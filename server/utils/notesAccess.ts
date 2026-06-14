import type { H3Event } from 'h3'
import { Prisma } from '@prisma/client'
import { createHmac, timingSafeEqual } from 'node:crypto'
import type {
  NotesDbPasswordResponse,
  NotesDbPasswordSaveResponse,
} from '#shared/types/notesAccess'
import {
  decryptNotesAccessPassword,
  encryptNotesAccessPassword,
  hashNotesAccessPassword,
  verifyNotesAccessPassword,
} from './notesAccessCrypto'
import { prisma } from './prisma'
import { sendNotesAccessPasswordEmail } from './notesAccessMail'

const SETTINGS_ID = 'default'
const SESSION_COOKIE = 'notes-access-session'
const SESSION_MAX_AGE_SEC = 60 * 60 * 12
const MIN_PASSWORD_LENGTH = 8

function isMissingNotesAccessTable(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2021'
}

async function findNotesAccessSettings(
  args: Parameters<typeof prisma.notesAccessSettings.findUnique>[0],
) {
  try {
    return await prisma.notesAccessSettings.findUnique(args)
  } catch (error) {
    if (isMissingNotesAccessTable(error)) {
      return null
    }
    throw error
  }
}

function getAuthSecret(): string {
  const secret = useRuntimeConfig().authSecret
  if (!secret) {
    throw createError({
      statusCode: 500,
      statusMessage: 'AUTH_SECRET is not configured',
    })
  }
  return secret
}

function signSessionPayload(payload: string): string {
  return createHmac('sha256', getAuthSecret()).update(payload).digest('hex')
}

function createSessionValue(): string {
  const expiresAt = Date.now() + SESSION_MAX_AGE_SEC * 1000
  const payload = `${expiresAt}`
  const signature = signSessionPayload(payload)
  return `${payload}.${signature}`
}

function parseSessionValue(value: string): boolean {
  const [expiresRaw, signature] = value.split('.')
  if (!expiresRaw || !signature) {
    return false
  }

  const expected = signSessionPayload(expiresRaw)
  const sigBuf = Buffer.from(signature)
  const expectedBuf = Buffer.from(expected)

  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return false
  }

  const expiresAt = Number(expiresRaw)
  return Number.isFinite(expiresAt) && expiresAt > Date.now()
}

export function isNotesAccessUnlocked(event: H3Event): boolean {
  const cookie = getCookie(event, SESSION_COOKIE)
  if (!cookie) {
    return false
  }

  return parseSessionValue(cookie)
}

export function setNotesAccessSession(event: H3Event): void {
  setCookie(event, SESSION_COOKIE, createSessionValue(), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_MAX_AGE_SEC,
  })
}

export async function getNotesAccessStatus(event: H3Event) {
  const settings = await findNotesAccessSettings({
    where: { id: SETTINGS_ID },
    select: { id: true },
  })

  return {
    configured: Boolean(settings),
    unlocked: isNotesAccessUnlocked(event),
  }
}

function assertPasswordStrength(password: string): void {
  if (password.length < MIN_PASSWORD_LENGTH) {
    throw createError({
      statusCode: 400,
      statusMessage: `Пароль должен быть не короче ${MIN_PASSWORD_LENGTH} символов`,
    })
  }
}

export async function setupNotesAccessPassword(
  event: H3Event,
  password: string,
  confirmPassword: string,
) {
  const existing = await findNotesAccessSettings({
    where: { id: SETTINGS_ID },
    select: { id: true },
  })

  if (existing) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Пароль уже установлен',
    })
  }

  assertPasswordStrength(password)

  if (password !== confirmPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Пароли не совпадают',
    })
  }

  const secret = getAuthSecret()
  const passwordHash = await hashNotesAccessPassword(password)
  const passwordCipher = encryptNotesAccessPassword(password, secret)

  try {
    await prisma.notesAccessSettings.create({
      data: {
        id: SETTINGS_ID,
        passwordHash,
        passwordCipher,
      },
    })
  } catch (error) {
    if (isMissingNotesAccessTable(error)) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Таблица notes_access_settings не найдена. Выполните prisma migrate deploy.',
      })
    }
    throw error
  }

  setNotesAccessSession(event)

  return { ok: true as const, unlocked: true as const }
}

export async function unlockNotesAccess(event: H3Event, password: string) {
  const settings = await findNotesAccessSettings({
    where: { id: SETTINGS_ID },
  })

  if (!settings) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Пароль ещё не установлен. Выполните prisma migrate deploy.',
    })
  }

  const valid = await verifyNotesAccessPassword(password, settings.passwordHash)
  if (!valid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Неверный пароль',
    })
  }

  setNotesAccessSession(event)

  return { ok: true as const, unlocked: true as const }
}

export async function sendNotesAccessForgotPassword() {
  const settings = await findNotesAccessSettings({
    where: { id: SETTINGS_ID },
  })

  if (!settings) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Пароль ещё не установлен. Выполните prisma migrate deploy.',
    })
  }

  const secret = getAuthSecret()
  const password = decryptNotesAccessPassword(settings.passwordCipher, secret)
  const config = useRuntimeConfig()

  await sendNotesAccessPasswordEmail({
    to: config.notesAccessResetEmail,
    password,
  })

  return { ok: true as const, sent: true as const }
}

export function requireNotesAccessUnlock(event: H3Event): void {
  if (!isNotesAccessUnlocked(event)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Требуется пароль раздела «Серверные доступы»',
    })
  }
}

function assertDbPasswordValue(password: string): string {
  const trimmed = password.trim()

  if (!trimmed) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Пароль PostgreSQL не может быть пустым',
    })
  }

  if (trimmed.length > 512) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Пароль PostgreSQL слишком длинный',
    })
  }

  return trimmed
}

export async function getNotesDbPassword(event: H3Event): Promise<NotesDbPasswordResponse> {
  requireNotesAccessUnlock(event)

  const settings = await findNotesAccessSettings({
    where: { id: SETTINGS_ID },
    select: { dbPasswordCipher: true },
  })

  if (!settings?.dbPasswordCipher) {
    return { password: null }
  }

  const password = decryptNotesAccessPassword(settings.dbPasswordCipher, getAuthSecret())

  return { password }
}

export async function saveNotesDbPassword(
  event: H3Event,
  password: string,
): Promise<NotesDbPasswordSaveResponse> {
  requireNotesAccessUnlock(event)

  const normalized = assertDbPasswordValue(password)
  const dbPasswordCipher = encryptNotesAccessPassword(normalized, getAuthSecret())

  try {
    await prisma.notesAccessSettings.update({
      where: { id: SETTINGS_ID },
      data: { dbPasswordCipher },
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw createError({
        statusCode: 404,
        statusMessage: 'Пароль раздела ещё не установлен',
      })
    }

    if (isMissingNotesAccessTable(error)) {
      throw createError({
        statusCode: 503,
        statusMessage: 'Таблица notes_access_settings не найдена. Выполните prisma migrate deploy.',
      })
    }

    throw error
  }

  return { ok: true as const }
}
