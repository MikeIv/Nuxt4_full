<script setup lang="ts">
import { PROJECT_DOC_LINKS } from '#shared/constants/projectDocs'
</script>

<template>
  <article :class="$style.article">
    <header :class="$style.header">
      <h2 :class="$style.title">Документация</h2>
      <p :class="$style.hint">
        Локально — каталог <code :class="$style.code">docs/</code> в корне проекта
      </p>
    </header>

    <ul :class="$style.cards">
      <li v-for="item in PROJECT_DOC_LINKS" :key="item.title">
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
  </article>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as fn;
@use '~/assets/styles/tools/mixins' as mq;
@use '~/assets/styles/tools/typography' as typo;

.article {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-3);
}

.header {
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-bg);
}

.title {
  margin: 0;
  color: var(--fs-color-text);
  @include typo.fs-text-h3;
}

.hint {
  margin: var(--fs-space-1) 0 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}

.code {
  padding: fn.rem(2) fn.rem(6);
  border-radius: var(--fs-radius-sm);
  background: var(--fs-color-surface);
  color: var(--fs-color-primary-strong);
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
  font-size: 0.92em;
}

.cards {
  display: grid;
  gap: var(--fs-space-2);
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
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  background: var(--fs-color-bg);
  color: inherit;
  text-decoration: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.15s ease;

  &::before {
    content: '';
    width: fn.rem(40);
    height: fn.rem(4);
    border-radius: 999px;
    background: var(--card-accent, var(--fs-color-primary));
  }

  &:hover {
    border-color: var(--fs-color-border);
    box-shadow: var(--fs-shadow-sm);
    transform: translateY(fn.rem(-2));
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.cardTitle {
  color: var(--fs-color-text);
  @include typo.fs-text-header;
}

.cardHint {
  flex: 1;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
  font-size: 0.92em;
}

.cardAction {
  color: var(--fs-color-primary-strong);
  @include typo.fs-text-tag;
}
</style>
