import { execSync, spawnSync } from 'node:child_process'
import {
  chdirRoot,
  dim,
  printHookBanner,
  printHookResult,
  getSpawnEnv,
  root,
  sep,
} from './hooks-ui.mjs'

chdirRoot()

const TYPECHECK_EXT = /\.(vue|ts|tsx|mts|cts)$/i

function getPushChangedFiles() {
  try {
    const upstream = execSync('git rev-parse --abbrev-ref --symbolic-full-name @{u}', {
      encoding: 'utf8',
      cwd: root,
    }).trim()

    return execSync(`git diff --name-only ${upstream}...HEAD`, {
      encoding: 'utf8',
      cwd: root,
    })
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
  } catch {
    return null
  }
}

function needsTypecheck(files) {
  if (files === null) return true
  if (files.length === 0) return false
  return files.some((f) => TYPECHECK_EXT.test(f))
}

printHookBanner({
  hook: 'pre-push',
  subtitle: 'typecheck  →  pnpm typecheck (если в push есть .ts / .vue)',
})

const changed = getPushChangedFiles()

if (!needsTypecheck(changed)) {
  console.log(dim(`  ${sep}`))
  console.log('  Пропуск typecheck: в push нет .ts / .vue файлов.')
  console.log(dim(`  ${sep}`))
  console.log()
  process.exit(0)
}

const t0 = Date.now()
const r = spawnSync('pnpm', ['typecheck'], {
  cwd: root,
  stdio: 'inherit',
  shell: true,
  env: getSpawnEnv(),
})

const status = r.status ?? (r.signal ? 1 : 0)
const sec = ((Date.now() - t0) / 1000).toFixed(2)

printHookResult({
  ok: status === 0,
  seconds: sec,
  okMessage: 'Typecheck пройден',
  failTitle: 'Pre-push остановлен',
  bypassHint: 'git push --no-verify',
  okFooter: 'Можно пушить.',
})

process.exit(status)
