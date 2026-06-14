import { readFileSync } from 'node:fs'

const schemaPath = 'prisma/schema.prisma'

let schema = ''

try {
  schema = readFileSync(schemaPath, 'utf8')
} catch {
  console.error(`[verify-prisma-schema] Не найден ${schemaPath}`)
  process.exit(1)
}

const requiredModels = ['model User {', 'model Task {', 'model NotesAccessSettings {']

const introspectedModels = ['model users {', 'model tasks {', 'model notes_access_settings {']

for (const marker of requiredModels) {
  if (!schema.includes(marker)) {
    console.error(`[verify-prisma-schema] В ${schemaPath} нет "${marker}".`)
    console.error('Схема, вероятно, перезаписана через prisma db pull.')
    console.error('Восстановите из git: git checkout -- prisma/schema.prisma')
    process.exit(1)
  }
}

for (const marker of introspectedModels) {
  if (schema.includes(marker)) {
    console.error(`[verify-prisma-schema] Найден introspect-маркер "${marker}".`)
    console.error('Используйте PascalCase-модели с @@map(), не имена таблиц.')
    process.exit(1)
  }
}

console.info('[verify-prisma-schema] OK')
