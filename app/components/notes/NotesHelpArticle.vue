<script setup lang="ts">
import type { CursorHelpCard } from '#shared/constants/cursorHelp'

const props = defineProps<{
  title: string
  hint: string
  cards: CursorHelpCard[]
  panelId: string
}>()

const activeCardId = ref<string | null>(null)

const toggleCard = (id: string) => {
  activeCardId.value = activeCardId.value === id ? null : id
}

const activeCard = computed(() => props.cards.find((card) => card.id === activeCardId.value))
</script>

<template>
  <article :class="$style.article">
    <header :class="$style.header">
      <h2 :class="$style.title">{{ title }}</h2>
      <p :class="$style.hint">{{ hint }}</p>
    </header>

    <ul :class="$style.cards">
      <li v-for="card in cards" :key="card.id">
        <button
          type="button"
          :class="[$style.card, activeCardId === card.id && $style.cardActive]"
          :aria-expanded="activeCardId === card.id"
          :aria-controls="panelId"
          :style="{ '--card-accent': card.accent }"
          @click="toggleCard(card.id)"
        >
          <span :class="$style.cardTitle">{{ card.title }}</span>
          <span :class="$style.cardHint">{{ card.hint }}</span>
          <span :class="$style.cardAction">
            {{ activeCardId === card.id ? 'Свернуть ↑' : 'Открыть →' }}
          </span>
        </button>
      </li>
    </ul>

    <section
      v-if="activeCard"
      :id="panelId"
      :class="$style.detail"
      :aria-label="activeCard.title"
    >
      <div
        v-for="(section, index) in activeCard.sections"
        :key="`${activeCard.id}-${index}`"
        :class="$style.section"
      >
        <h3 v-if="section.heading" :class="$style.sectionTitle">
          {{ section.heading }}
        </h3>

        <p
          v-for="(paragraph, pIndex) in section.paragraphs"
          :key="pIndex"
          :class="$style.paragraph"
        >
          {{ paragraph }}
        </p>

        <template v-if="section.codes">
          <NotesCodeBlock
            v-for="(code, cIndex) in section.codes"
            :key="cIndex"
            :code="code"
          />
        </template>
        <NotesCodeBlock v-else-if="section.code" :code="section.code" />

        <table v-if="section.table" :class="$style.table">
          <thead>
            <tr>
              <th :class="$style.th">Поле</th>
              <th :class="$style.th">Описание</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in section.table" :key="row.field">
              <td :class="$style.td">{{ row.field }}</td>
              <td :class="$style.td">{{ row.hint }}</td>
            </tr>
          </tbody>
        </table>

        <ul v-if="section.list" :class="$style.list">
          <li v-for="(item, lIndex) in section.list" :key="lIndex">
            {{ item }}
          </li>
        </ul>
      </div>
    </section>
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
  width: 100%;
  min-height: 100%;
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  background: var(--fs-color-bg);
  color: inherit;
  text-align: left;
  cursor: pointer;
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

.cardActive {
  border-color: rgb(235 153 20 / 0.32);
  background: rgb(235 153 20 / 0.08);
  box-shadow: var(--fs-shadow-sm);
  transform: none;
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

.detail {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-3);
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-bg);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);

  &:not(:last-child) {
    padding-bottom: var(--fs-space-3);
    border-bottom: 1px solid var(--fs-color-border-light);
  }
}

.sectionTitle {
  margin: 0;
  color: var(--fs-color-text);
  @include typo.fs-text-header;
}

.paragraph {
  margin: 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.92em;
}

.th,
.td {
  padding: var(--fs-space-2);
  border: 1px solid var(--fs-color-border-light);
  text-align: left;
  vertical-align: top;
}

.th {
  background: var(--fs-color-surface);
  color: var(--fs-color-text);
  @include typo.fs-text-tag;
}

.td {
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}

.list {
  margin: 0;
  padding-left: var(--fs-space-3);
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;

  li + li {
    margin-top: var(--fs-space-1);
  }
}
</style>
