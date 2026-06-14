import {
  createCipheriv,
  createDecipheriv,
  createHash,
  randomBytes,
  scrypt,
  timingSafeEqual,
} from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)

const SCRYPT_KEYLEN = 64

function encryptionKey(secret: string): Buffer {
  return createHash('sha256').update(secret).digest()
}

export async function hashNotesAccessPassword(password: string): Promise<string> {
  const salt = randomBytes(16)
  const derived = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer
  return `${salt.toString('hex')}:${derived.toString('hex')}`
}

export async function verifyNotesAccessPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':')
  if (!saltHex || !hashHex) {
    return false
  }

  const salt = Buffer.from(saltHex, 'hex')
  const expected = Buffer.from(hashHex, 'hex')
  const derived = (await scryptAsync(password, salt, SCRYPT_KEYLEN)) as Buffer

  if (expected.length !== derived.length) {
    return false
  }

  return timingSafeEqual(expected, derived)
}

export function encryptNotesAccessPassword(password: string, secret: string): string {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(secret), iv)
  const encrypted = Buffer.concat([cipher.update(password, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`
}

export function decryptNotesAccessPassword(cipherText: string, secret: string): string {
  const [ivHex, tagHex, dataHex] = cipherText.split(':')
  if (!ivHex || !tagHex || !dataHex) {
    throw new Error('Invalid cipher payload')
  }

  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(secret), Buffer.from(ivHex, 'hex'))
  decipher.setAuthTag(Buffer.from(tagHex, 'hex'))

  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()])

  return decrypted.toString('utf8')
}
