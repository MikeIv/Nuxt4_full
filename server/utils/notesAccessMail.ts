import nodemailer from 'nodemailer'

interface SendPasswordEmailInput {
  to: string
  password: string
}

export async function sendNotesAccessPasswordEmail(input: SendPasswordEmailInput): Promise<void> {
  const config = useRuntimeConfig()

  if (!config.smtpHost || !config.smtpUser || !config.smtpPass) {
    throw createError({
      statusCode: 503,
      statusMessage: 'SMTP не настроен. Укажите SMTP_HOST, SMTP_USER и SMTP_PASS в .env',
    })
  }

  const transporter = nodemailer.createTransport({
    host: config.smtpHost,
    port: Number(config.smtpPort) || 465,
    secure: Number(config.smtpPort) === 465,
    auth: {
      user: config.smtpUser,
      pass: config.smtpPass,
    },
  })

  const from = config.smtpFrom || config.smtpUser

  await transporter.sendMail({
    from,
    to: input.to,
    subject: 'Пароль — раздел «Серверные доступы» (Nuxt4_full)',
    text: [
      'Запрошено восстановление пароля для раздела «Серверные доступы».',
      '',
      `Пароль: ${input.password}`,
      '',
      'Если вы не запрашивали письмо — смените пароль после входа.',
    ].join('\n'),
  })
}
