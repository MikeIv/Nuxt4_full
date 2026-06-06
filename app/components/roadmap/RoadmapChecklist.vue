<script setup lang="ts">
import type { RoadmapCheckItem } from '#shared/constants/roadmapWeeks'

defineProps<{
  title: string
  items: RoadmapCheckItem[]
  isDone: (taskId: string) => boolean
}>()

const emit = defineEmits<{
  toggle: [taskId: string]
}>()
</script>

<template>
  <section :class="$style.block">
    <h3 :class="$style.blockTitle">{{ title }}</h3>
    <ul :class="$style.checklist">
      <li v-for="item in items" :key="item.id" :class="$style.item">
        <label :class="[$style.label, isDone(item.id) && $style.labelDone]">
          <input
            type="checkbox"
            :class="$style.checkbox"
            :checked="isDone(item.id)"
            @change="emit('toggle', item.id)"
          />
          <span :class="$style.labelBody">
            <span :class="$style.labelText">{{ item.label }}</span>
            <span v-if="item.comment" :class="$style.labelComment">{{ item.comment }}</span>
          </span>
        </label>
      </li>
    </ul>
  </section>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as fn;
@use '~/assets/styles/tools/typography' as typo;
@use '~/assets/styles/tools/margin' as margin;

.block {
  @include margin.fs-margin-content-block;
}

.blockTitle {
  margin: 0 0 var(--fs-margin-card-sm);
  color: var(--fs-color-text);
  @include typo.fs-text-h4;
}

.checklist {
  display: grid;
  gap: var(--fs-margin-card-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

.item {
  min-width: 0;
}

.label {
  display: flex;
  gap: var(--fs-space-2);
  align-items: flex-start;
  padding: var(--fs-margin-card-sm);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  background: var(--fs-color-bg);
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    border-color: var(--fs-color-border);
    background: var(--fs-color-surface);
  }
}

.labelDone {
  border-color: rgb(51 174 39 / 0.28);
  background: rgb(51 174 39 / 0.06);
}

.checkbox {
  flex-shrink: 0;
  width: fn.rem(18);
  height: fn.rem(18);
  margin-top: fn.rem(2);
  accent-color: var(--fs-color-success);
}

.labelBody {
  display: grid;
  gap: var(--fs-margin-min);
  min-width: 0;
}

.labelText {
  color: var(--fs-color-text);
  @include typo.fs-text-body;
}

.labelComment {
  color: var(--fs-color-text-muted);
  white-space: pre-line;
  @include typo.fs-text-body;
}

.labelDone .labelText {
  color: var(--fs-color-text-muted);
  text-decoration: line-through;
  text-decoration-color: rgb(51 174 39 / 0.45);
}
</style>
