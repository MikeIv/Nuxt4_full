import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
export const root = join(__dirname, '..')

export function chdirRoot() {
  process.chdir(root)
}

export function getPackageDisplayName() {
  try {
    const raw = readFileSync(join(root, 'package.json'), 'utf8')
    const name = JSON.parse(raw)?.name
    return typeof name === 'string' && name.trim() ? name.trim() : 'nuxt-app'
  } catch {
    return 'nuxt-app'
  }
}

export function getSpawnEnv() {
  const envClean = { ...process.env }
  delete envClean.NO_COLOR
  return { ...envClean, FORCE_COLOR: '1' }
}

const esc = (code, s) => `\u001b[${code}m${s}\u001b[0m`
const bold = (s) => esc(1, s)
const dim = (s) => esc(2, s)
const red = (s) => esc(31, s)
const green = (s) => esc(32, s)
const yellow = (s) => esc(33, s)
const cyan = (s) => esc(36, s)

const W = 62
const inner = W - 4
const h = dim('━'.repeat(W - 2))
const top = dim('╭') + h + dim('╮')
const bot = dim('╰') + h + dim('╯')
const pipe = dim('│')
export const sep = dim('─'.repeat(inner))

export { dim }

function visibleLen(s) {
  const escRe = new RegExp(`${String.fromCharCode(27)}\\[[0-9;]*m`, 'g')
  return s.replace(escRe, '').length
}

function row(content) {
  const pad = Math.max(0, inner - visibleLen(content))
  console.log(pipe + '  ' + content + ' '.repeat(pad) + pipe)
}

/** @param {{ hook: string, subtitle: string }} opts */
export function printHookBanner({ hook, subtitle }) {
  console.log()
  console.log(top)
  row('')
  row(`${bold(cyan(getPackageDisplayName()))}${dim('  ·  ')}${bold(yellow(hook))}`)
  row(dim(subtitle))
  row('')
  console.log(bot)
  console.log()
}

/** @param {{ ok: boolean, seconds: string, okMessage: string, failTitle: string, bypassHint: string, okFooter?: string }} opts */
export function printHookResult({
  ok,
  seconds,
  okMessage,
  failTitle,
  bypassHint,
  okFooter = 'Можно продолжать.',
}) {
  console.log()
  if (ok) {
    console.log(dim(`  ${sep}`))
    console.log(`  ${green('✓')}  ${bold(okMessage)}  ${dim(`·  ${seconds}s`)}`)
    console.log(dim(`  ${sep}`))
    console.log(dim(`  ${okFooter}`))
  } else {
    console.log(dim(`  ${sep}`))
    console.log(`  ${red('✗')}  ${bold(failTitle)}  ${dim(`·  ${seconds}s`)}`)
    console.log(dim(`  ${sep}`))
    console.log(dim('  Исправьте замечания. Отключить проверку (осторожно): '), yellow(bypassHint))
  }
  console.log()
}
