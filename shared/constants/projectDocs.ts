export interface ProjectDocLink {
  title: string
  hint: string
  href: string
  accent: string
}

export const PROJECT_DOC_LINKS: ProjectDocLink[] = [
  {
    title: 'План развёртывания',
    hint: 'Этапы A–F, окружение, Cursor rules',
    href: 'https://github.com/MikeIv/Nuxt4_full/blob/main/docs/deployment-plan.md',
    accent: 'var(--fs-figma-main-building-main)',
  },
  {
    title: 'Roadmap 12 недель',
    hint: 'Nitro, Prisma, auth, деплой, capstone',
    href: '/roadmap',
    accent: 'var(--fs-figma-vertical-shop)',
  },
  {
    title: 'Оглавление docs',
    hint: 'Навигация по документации проекта',
    href: 'https://github.com/MikeIv/Nuxt4_full/blob/main/docs/README.md',
    accent: 'var(--fs-figma-main-building-whater-complex)',
  },
]
