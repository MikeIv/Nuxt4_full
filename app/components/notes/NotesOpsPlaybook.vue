<script setup lang="ts">
import { NOTES_OPS_PLAYBOOK } from '#shared/constants/notesOpsPlaybook'

const { title, lead, cases } = NOTES_OPS_PLAYBOOK

const tocItems = cases.map((item, index) => ({
  id: item.id,
  label: `${index + 1}. ${item.title}`,
}))
</script>

<template>
  <article :class="$style.article">
    <header :class="$style.hero">
      <p :class="$style.kicker">Ops / инциденты</p>
      <h2 :class="$style.title">{{ title }}</h2>
      <p :class="$style.lead">{{ lead }}</p>
    </header>

    <nav :class="$style.toc" aria-label="Содержание playbook">
      <p :class="$style.tocTitle">Кейсы</p>
      <ol :class="$style.tocList">
        <li v-for="item in tocItems" :key="item.id">
          <a :href="`#${item.id}`" :class="$style.tocLink">{{ item.label }}</a>
        </li>
      </ol>
    </nav>

    <div :class="$style.cases">
      <section
        v-for="(item, index) in cases"
        :id="item.id"
        :key="item.id"
        :class="$style.case"
      >
        <h3 :class="$style.caseTitle">
          <span :class="$style.caseNum">{{ index + 1 }}</span>
          {{ item.title }}
        </h3>
        <p :class="$style.caseSummary">{{ item.summary }}</p>

        <div :class="$style.block">
          <h4 :class="$style.blockTitle">Симптомы</h4>
          <ul :class="$style.list">
            <li v-for="(symptom, symptomIndex) in item.symptoms" :key="symptomIndex">
              {{ symptom }}
            </li>
          </ul>
        </div>

        <div :class="$style.block">
          <h4 :class="$style.blockTitle">Причина</h4>
          <p :class="$style.text">{{ item.cause }}</p>
        </div>

        <div :class="$style.steps">
          <div v-for="step in item.steps" :key="step.title" :class="$style.step">
            <h4 :class="$style.stepTitle">{{ step.title }}</h4>
            <NotesCodeBlock v-if="step.code" :code="step.code" />
            <p v-if="step.note" :class="$style.note">{{ step.note }}</p>
          </div>
        </div>

        <div :class="$style.block">
          <h4 :class="$style.blockTitle">Профилактика</h4>
          <ul :class="$style.list">
            <li v-for="(line, lineIndex) in item.prevention" :key="lineIndex">{{ line }}</li>
          </ul>
        </div>
      </section>
    </div>
  </article>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as fn;
@use '~/assets/styles/tools/typography' as typo;

.article {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-3);
}

.hero {
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: linear-gradient(
    135deg,
    rgb(255 255 255 / 0.95) 0%,
    rgb(51 174 39 / 0.08) 100%
  );
  box-shadow: var(--fs-shadow-sm);
}

.kicker {
  margin: 0;
  color: var(--fs-color-success);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  @include typo.fs-text-tag;
}

.title {
  margin: var(--fs-space-1) 0;
  color: var(--fs-color-primary-strong);
  @include typo.fs-text-h3;
}

.lead {
  margin: 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}

.toc {
  padding: var(--fs-space-2) var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-bg);
}

.tocTitle {
  margin: 0 0 var(--fs-space-1);
  color: var(--fs-color-text-muted);
  @include typo.fs-text-tag;
}

.tocList {
  margin: 0;
  padding-left: var(--fs-space-3);
  @include typo.fs-text-body;
}

.tocLink {
  color: var(--fs-color-text);
  text-decoration: none;

  &:hover {
    color: var(--fs-color-primary-strong);
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
    border-radius: var(--fs-radius-sm);
  }
}

.cases {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-3);
}

.case {
  scroll-margin-top: fn.rem(80);
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-bg);
}

.caseTitle {
  display: flex;
  gap: var(--fs-space-2);
  align-items: center;
  margin: 0 0 var(--fs-space-1);
  color: var(--fs-color-text);
  @include typo.fs-text-h4;
}

.caseNum {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: fn.rem(28);
  height: fn.rem(28);
  border-radius: 999px;
  background: rgb(51 174 39 / 0.14);
  color: var(--fs-color-success);
  @include typo.fs-text-tag;
}

.caseSummary {
  margin: 0 0 var(--fs-space-2);
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}

.block,
.step {
  margin-bottom: var(--fs-space-2);
}

.blockTitle,
.stepTitle {
  margin: 0 0 var(--fs-space-1);
  color: var(--fs-color-text);
  @include typo.fs-text-header;
}

.text,
.note {
  margin: 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}

.note {
  margin-top: var(--fs-space-1);
  font-style: italic;
}

.list {
  margin: 0;
  padding-left: var(--fs-space-3);
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;

  li + li {
    margin-top: fn.rem(6);
  }
}

.steps {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
}
</style>
