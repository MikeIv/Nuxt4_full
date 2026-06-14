<script setup lang="ts">
import type { HealthResponse } from '#shared/types/health'

interface DocLink {
  title: string
  hint: string
  href: string
  accent: string
}

interface StackItem {
  label: string
  status: 'now' | 'plan'
}

useHead({
  title: 'Nuxt4_full — fullstack sandbox',
})

const docLinks: DocLink[] = [
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

const stackItems: StackItem[] = [
  { label: 'Nuxt 4.4', status: 'now' },
  { label: 'Nitro', status: 'now' },
  { label: 'TypeScript', status: 'now' },
  { label: 'Prisma', status: 'plan' },
  { label: 'PostgreSQL', status: 'plan' },
  { label: 'Auth + RBAC', status: 'plan' },
]

const { data: health, pending: healthPending, error: healthError } =
  await useApiFetch<HealthResponse>('/api/health')

const { currentWorkingWeekId } = useRoadmapProgress()

const healthErrorMessage = computed(() => {
  const err = healthError.value
  if (!err) {
    return ''
  }

  return err.message || 'Не удалось загрузить /api/health'
})
</script>

<template>
  <div :class="$style.page">
    <div :class="$style.backdrop" aria-hidden="true" />

    <div :class="$style.shell">
      <header :class="$style.hero">
        <p :class="$style.badge">Fullstack learning sandbox</p>
        <h1 :class="$style.title">Fabsearch</h1>
        <p :class="$style.lead">
          Песочница для прокачки backend: Nitro → Prisma → auth → деплой. Capstone — mini-SaaS
          «Task Board».
        </p>

        <div :class="$style.heroMeta">
          <span :class="$style.metaItem">
            <span :class="$style.metaLabel">Фаза</span>
            <span :class="$style.metaValue">Неделя {{ currentWorkingWeekId }}</span>
          </span>
          <span :class="$style.metaDivider" aria-hidden="true" />
          <span :class="$style.metaItem">
            <span :class="$style.metaLabel">Remote</span>
            <a
              :class="$style.metaLink"
              href="https://github.com/MikeIv/Nuxt4_full"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </span>
        </div>
      </header>

      <section :class="$style.section">
        <div :class="$style.sectionHead">
          <h2 :class="$style.sectionTitle">Документация</h2>
          <p :class="$style.sectionHint">Локально — каталог <code>docs/</code> в корне проекта</p>
        </div>

        <ul :class="$style.cards">
          <li v-for="item in docLinks" :key="item.title">
            <component
              :is="item.href.startsWith('/') ? 'NuxtLink' : 'a'"
              :class="$style.card"
              :href="item.href.startsWith('/') ? undefined : item.href"
              :to="item.href.startsWith('/') ? item.href : undefined"
              :target="item.href.startsWith('/') ? undefined : '_blank'"
              :rel="item.href.startsWith('/') ? undefined : 'noopener noreferrer'"
              :style="{ '--card-accent': item.accent }"
            >
              <span :class="$style.cardTitle">{{ item.title }}</span>
              <span :class="$style.cardHint">{{ item.hint }}</span>
              <span :class="$style.cardAction">
                {{ item.href.startsWith('/') ? 'Открыть →' : 'Открыть на GitHub →' }}
              </span>
            </component>
          </li>
        </ul>
      </section>

      <section :class="$style.section">
        <div :class="$style.sectionHead">
          <h2 :class="$style.sectionTitle">Стек</h2>
          <p :class="$style.sectionHint">Сейчас и по roadmap</p>
        </div>

        <ul :class="$style.stack">
          <li v-for="item in stackItems" :key="item.label">
            <span
              :class="[$style.chip, item.status === 'now' ? $style.chipNow : $style.chipPlan]"
            >
              {{ item.label }}
            </span>
          </li>
        </ul>
      </section>

      <section :class="$style.section">
        <div :class="$style.sectionHead">
          <h2 :class="$style.sectionTitle">Health Check</h2>
          <p :class="$style.sectionHint">
            <code>GET /api/health</code> через <code>useApiFetch</code> (SSR)
          </p>
        </div>

        <div :class="$style.healthCard">
          <p v-if="healthPending" :class="$style.healthPending">Загрузка health…</p>

          <p v-else-if="healthError" :class="$style.healthError" role="alert">
            Ошибка: {{ healthErrorMessage }}
          </p>

          <dl v-else :class="$style.healthGrid">
            <div :class="$style.healthRow">
              <dt :class="$style.healthTerm">Status</dt>
              <dd :class="[$style.healthValue, $style.healthStatusOk]">{{ health?.status }}</dd>
            </div>
            <div :class="$style.healthRow">
              <dt :class="$style.healthTerm">Version</dt>
              <dd :class="$style.healthValue">{{ health?.version }}</dd>
            </div>
            <div :class="$style.healthRow">
              <dt :class="$style.healthTerm">App</dt>
              <dd :class="$style.healthValue">{{ health?.appName }}</dd>
            </div>
            <div :class="$style.healthRow">
              <dt :class="$style.healthTerm">Uptime</dt>
              <dd :class="$style.healthValue">{{ health?.uptime?.toFixed(1) }} с</dd>
            </div>
            <div :class="[$style.healthRow, $style.healthRowFull]">
              <dt :class="$style.healthTerm">Timestamp</dt>
              <dd :class="[$style.healthValue, $style.healthTimestamp]">{{ health?.timestamp }}</dd>
            </div>
          </dl>
        </div>
      </section>

      <footer :class="$style.footer">
        <p :class="$style.footerText">
          UI-токены — UI Kit «Олимпийский» (Grand). Неделя 1: POST, middleware, полировка
          <code>runtimeConfig</code> — см. <NuxtLink to="/roadmap">roadmap</NuxtLink>.
        </p>
      </footer>
    </div>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as fn;
@use '~/assets/styles/tools/mixins' as mq;
@use '~/assets/styles/tools/typography' as typo;
@use '~/assets/styles/tools/margin' as margin;

.page {
  position: relative;
  min-height: 100dvh;
  padding: var(--fs-space-3) var(--fs-space-2) var(--fs-space-4);
  overflow: hidden;
}

.backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 12% 18%, rgb(235 153 20 / 0.16), transparent 42%),
    radial-gradient(circle at 88% 12%, rgb(0 173 234 / 0.14), transparent 38%),
    radial-gradient(circle at 70% 88%, rgb(23 53 87 / 0.12), transparent 45%),
    linear-gradient(180deg, var(--fs-figma-metallic-gradient-grey-1) 0%, var(--fs-color-bg) 42%);
  pointer-events: none;
}

.shell {
  position: relative;
  z-index: 1;
  width: min(100%, fn.rem(960));
  margin-inline: auto;
}

.hero {
  padding: var(--fs-space-4);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-xl);
  background: rgb(255 255 255 / 0.82);
  box-shadow: var(--fs-shadow-md);
  backdrop-filter: blur(12px);
}

.badge {
  display: inline-flex;
  margin: 0;
  padding: fn.rem(6) fn.rem(12);
  border-radius: 999px;
  background: var(--fs-gradient-auth);
  color: var(--fs-figma-achromatic-white);
  @include typo.fs-text-tag;
}

.title {
  margin: var(--fs-margin-title-subtitle-block) 0 0;
  color: var(--fs-color-primary-strong);
  @include typo.fs-text-h1;
}

.lead {
  max-width: fn.rem(640);
  margin: var(--fs-margin-title-subtitle-block) 0 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-h5-subtitle;
}

.heroMeta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-2);
  align-items: center;
  margin-top: var(--fs-margin-title-content);
  padding-top: var(--fs-space-2);
  border-top: 1px solid var(--fs-color-border-light);
}

.metaItem {
  display: flex;
  flex-direction: column;
  gap: fn.rem(4);
}

.metaLabel {
  color: var(--fs-color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  @include typo.fs-text-tag;
}

.metaValue {
  color: var(--fs-color-text);
  @include typo.fs-text-header;
}

.metaLink {
  color: var(--fs-color-accent);
  transition: color 0.2s ease;

  &:hover {
    color: var(--fs-color-primary-strong);
  }

  &:focus-visible {
    border-radius: var(--fs-radius-sm);
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.metaDivider {
  width: 1px;
  height: fn.rem(32);
  background: var(--fs-color-border-light);
}

.hero + .section {
  margin-block-start: var(--fs-margin-title-content);
}

.section {
  @include margin.fs-margin-content-block;
}

.sectionHead {
  @include margin.fs-margin-title-subtitle;
}

.sectionTitle {
  margin: 0;
  color: var(--fs-color-text);
  @include typo.fs-text-h3;
}

.sectionHint {
  margin: var(--fs-margin-min) 0 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;

  code {
    padding: fn.rem(2) fn.rem(6);
    border-radius: var(--fs-radius-sm);
    background: var(--fs-color-surface);
    color: var(--fs-color-primary-strong);
    font-size: 0.92em;
  }
}

.cards {
  display: grid;
  gap: var(--fs-margin-card-sm);
  margin: 0;
  padding: 0;
  list-style: none;

  @include mq.from-tablet {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.card {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
  min-height: 100%;
  padding: var(--fs-margin-card);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-sm);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  &::before {
    content: '';
    width: fn.rem(40);
    height: fn.rem(4);
    border-radius: 999px;
    background: var(--card-accent, var(--fs-color-primary));
  }

  &:hover {
    border-color: var(--fs-color-border);
    box-shadow: var(--fs-shadow-glow);
    transform: translateY(fn.rem(-2));
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.cardTitle {
  color: var(--fs-color-text);
  @include typo.fs-text-h4;
}

.cardHint {
  flex: 1;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}

.cardAction {
  color: var(--fs-color-primary-strong);
  @include typo.fs-text-header;
}

.stack {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-margin-tag);
  margin: 0;
  padding: 0;
  list-style: none;
}

.chip {
  display: inline-flex;
  padding: fn.rem(8) fn.rem(14);
  border-radius: 999px;
  @include typo.fs-text-tag;
}

.chipNow {
  border: 1px solid rgb(235 153 20 / 0.28);
  background: rgb(235 153 20 / 0.1);
  color: var(--fs-color-primary-strong);
}

.chipPlan {
  border: 1px solid var(--fs-color-border-light);
  background: var(--fs-color-surface);
  color: var(--fs-color-text-muted);
}

.footer {
  margin-top: var(--fs-margin-block);
  padding-top: var(--fs-space-3);
  border-top: 1px solid var(--fs-color-border-light);
}

.footerText {
  margin: 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;

  a {
    color: var(--fs-color-accent);
    text-decoration: none;

    &:hover {
      color: var(--fs-color-primary-strong);
    }

    &:focus-visible {
      border-radius: var(--fs-radius-sm);
      outline: 2px solid var(--fs-color-primary);
      outline-offset: 2px;
    }
  }

  code {
    padding: fn.rem(2) fn.rem(6);
    border-radius: var(--fs-radius-sm);
    background: var(--fs-color-surface);
    color: var(--fs-color-text);
    font-size: 0.92em;
  }
}

.healthCard {
  padding: var(--fs-margin-card);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-bg);
}

.healthPending {
  margin: 0;
  padding: var(--fs-space-3) 0;
  color: var(--fs-color-text-muted);
  text-align: center;
  @include typo.fs-text-body;
}

.healthError {
  margin: 0;
  padding: var(--fs-margin-card-sm);
  border-radius: var(--fs-radius-md);
  background: rgb(238 46 34 / 0.08);
  color: var(--fs-color-error);
  @include typo.fs-text-body;
}

.healthGrid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--fs-space-2) var(--fs-space-3);
  margin: 0;
}

.healthRow {
  display: grid;
  gap: var(--fs-margin-min);
  margin: 0;
}

.healthRowFull {
  grid-column: 1 / -1;
  padding-top: var(--fs-space-2);
  border-top: 1px solid var(--fs-color-border-light);
}

.healthTerm {
  margin: 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-tag;
}

.healthValue {
  margin: 0;
  color: var(--fs-color-text);
  @include typo.fs-text-body;
}

.healthStatusOk {
  color: var(--fs-color-success);
  font-weight: 600;
}

.healthTimestamp {
  word-break: break-all;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-tag;
}
</style>
