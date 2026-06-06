<script setup lang="ts">
import type { RoadmapWeek } from '#shared/constants/roadmapWeeks'

defineProps<{
  week: RoadmapWeek
  isDone: (taskId: string) => boolean
}>()

const emit = defineEmits<{
  toggle: [taskId: string]
}>()
</script>

<template>
  <article :class="$style.panel">
    <header :class="$style.header">
      <p :class="$style.kicker">Неделя {{ week.id }}</p>
      <h2 :class="$style.title">{{ week.title }}</h2>
      <p :class="$style.theme">{{ week.theme }}</p>
    </header>

    <section :class="$style.block">
      <h3 :class="$style.blockTitle">Цель</h3>
      <p :class="$style.text">{{ week.goal }}</p>
    </section>

    <section v-if="week.theory.length" :class="$style.block">
      <h3 :class="$style.blockTitle">Теория</h3>
      <ul :class="$style.theoryList">
        <li v-for="(item, index) in week.theory" :key="index" :class="$style.theoryItem">
          <p :class="$style.theoryTopic">
            <span :class="$style.theoryLabel">Тема:</span>
            {{ item.title }}
          </p>
          <p v-if="item.comment" :class="$style.theoryComment">
            <span :class="$style.theoryLabel">Описание:</span>
            {{ item.comment }}
          </p>
        </li>
      </ul>
    </section>

    <RoadmapChecklist
      title="Практика"
      :items="week.practice"
      :is-done="isDone"
      @toggle="emit('toggle', $event)"
    />

    <RoadmapChecklist
      title="Done when"
      :items="week.doneWhen"
      :is-done="isDone"
      @toggle="emit('toggle', $event)"
    />
  </article>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as fn;
@use '~/assets/styles/tools/typography' as typo;
@use '~/assets/styles/tools/margin' as margin;

.panel {
  padding: var(--fs-margin-card);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-xl);
  background: rgb(255 255 255 / 0.9);
  box-shadow: var(--fs-shadow-md);
}

.header {
  @include margin.fs-margin-title-content;
}

.kicker {
  margin: 0;
  color: var(--fs-color-primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  @include typo.fs-text-tag;
}

.title {
  margin: var(--fs-margin-min) 0 0;
  color: var(--fs-color-primary-strong);
  @include typo.fs-text-h2;
}

.theme {
  margin: var(--fs-margin-min) 0 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}

.block {
  @include margin.fs-margin-content-block;
}

.blockTitle {
  margin: 0 0 var(--fs-margin-card-sm);
  color: var(--fs-color-text);
  @include typo.fs-text-h4;
}

.text {
  margin: 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}

.theoryList {
  display: grid;
  gap: var(--fs-margin-card-sm);
  margin: 0;
  padding: 0;
  list-style: none;
}

.theoryItem {
  padding: var(--fs-margin-card-sm);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  background: var(--fs-color-surface);
}

.theoryTopic {
  margin: 0;
  color: var(--fs-color-text);
  @include typo.fs-text-header;
}

.theoryLabel {
  color: var(--fs-color-primary);
  font-weight: 600;
}

.theoryComment {
  margin: var(--fs-margin-min) 0 0;
  color: var(--fs-color-text-muted);
  white-space: pre-line;
  @include typo.fs-text-body;
}
</style>
