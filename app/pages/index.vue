<script setup lang="ts"></script>

<template>
  <div :class="$style.root">
    <h1 :class="$style.title">Nuxt4_full</h1>
    <p :class="$style.lead">
      Fullstack-песочница: Nuxt 4 + Nitro → Prisma, auth, RBAC. Capstone — mini-SaaS «Task Board».
    </p>

    <section :class="$style.section">
      <h2 :class="$style.subtitle">Документация</h2>
      <ul :class="$style.links">
        <li>
          <a
            href="https://github.com/MikeIv/Nuxt4_full/blob/main/docs/deployment-plan.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            План развёртывания
          </a>
          <span :class="$style.hint"> — этапы A–F</span>
        </li>
        <li>
          <a
            href="https://github.com/MikeIv/Nuxt4_full/blob/main/docs/roadmap-12-weeks.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            Roadmap 12 недель
          </a>
          <span :class="$style.hint"> — Nitro, Prisma, auth, деплой</span>
        </li>
        <li>
          <a
            href="https://github.com/MikeIv/Nuxt4_full/blob/main/docs/README.md"
            target="_blank"
            rel="noopener noreferrer"
          >
            Оглавление docs
          </a>
        </li>
      </ul>
      <p :class="$style.local">
        Локально: каталог <code>docs/</code> в корне проекта.
      </p>
    </section>
  </div>
</template>

<style module lang="scss">
.root {
  padding: 1.5rem;
  max-width: 40rem;
}

.title {
  margin: 0 0 0.5rem;
}

.lead {
  margin: 0 0 1.5rem;
  line-height: 1.5;
}

.section {
  margin-top: 1rem;
}

.subtitle {
  margin: 0 0 0.75rem;
  font-size: 1.125rem;
}

.links {
  margin: 0;
  padding-left: 1.25rem;
  line-height: 1.6;
}

.hint {
  color: var(--color-text-muted, #666);
}

.local {
  margin: 1rem 0 0;
  font-size: 0.875rem;
  color: var(--color-text-muted, #666);
}
</style>
