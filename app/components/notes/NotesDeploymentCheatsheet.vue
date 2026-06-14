<script setup lang="ts">
import { DEPLOYMENT_CHEATSHEET } from '#shared/constants/deploymentCheatsheet'

const { meta, sections, footerNote } = DEPLOYMENT_CHEATSHEET

const metaItems = [
  { label: 'Проект', value: meta.project },
  { label: 'Домен', value: meta.domain, href: meta.domainUrl },
  { label: 'Сервер', value: meta.server },
  { label: 'IP', value: meta.ip },
  { label: 'Папка проекта', value: meta.projectPath, mono: true },
] as const

const tocItems = sections.map((section) => ({
  id: section.id,
  label: `${section.number}. ${section.title}`,
}))

const sshCommand = `ssh root@${meta.ip}`
</script>

<template>
  <article :class="$style.article">
    <header :class="$style.hero">
      <p :class="$style.kicker">Деплой fabsearch.ru</p>
      <h2 :class="$style.title">{{ meta.title }}</h2>

      <dl :class="$style.metaGrid">
        <div v-for="item in metaItems" :key="item.label" :class="$style.metaItem">
          <dt :class="$style.metaLabel">{{ item.label }}</dt>
          <dd :class="$style.metaValue">
            <a
              v-if="'href' in item && item.href"
              :href="item.href"
              :class="$style.metaLink"
              target="_blank"
              rel="noopener noreferrer"
            >
              {{ item.value }}
            </a>
            <code v-else-if="'mono' in item && item.mono" :class="$style.metaCode">
              {{ item.value }}
            </code>
            <span v-else>{{ item.value }}</span>
          </dd>
        </div>
      </dl>
    </header>

    <NotesCodeBlock :code="sshCommand" label="Подключение к серверу" />

    <nav :class="$style.toc" aria-label="Содержание шпаргалки">
      <p :class="$style.tocTitle">Содержание</p>
      <ol :class="$style.tocList">
        <li v-for="item in tocItems" :key="item.id">
          <a
            :href="`#${item.id}`"
            :class="[$style.tocLink, item.id === 'deploy' && $style.tocLinkAccent]"
          >
            {{ item.label }}
          </a>
        </li>
      </ol>
    </nav>

    <div :class="$style.sections">
      <section
        v-for="section in sections"
        :id="section.id"
        :key="section.id"
        :class="$style.section"
      >
        <h3 :class="$style.sectionTitle">
          <span :class="$style.sectionNum">{{ section.number }}</span>
          {{ section.title }}
        </h3>

        <div v-if="section.type === 'table'" :class="$style.tableWrap">
          <table :class="$style.table">
            <thead>
              <tr>
                <th scope="col">Что</th>
                <th scope="col">Путь</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in section.rows" :key="row.label">
                <td :class="$style.tableLabel">{{ row.label }}</td>
                <td>
                  <code :class="$style.pathCode">{{ row.path }}</code>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <NotesCodeBlock
          v-else-if="section.type === 'code'"
          :code="section.code"
          :label="section.title"
        />

        <div v-else-if="section.type === 'practices'" :class="$style.practices">
          <div
            v-for="group in section.groups"
            :key="group.title"
            :class="$style.practiceGroup"
          >
            <h4 :class="$style.practiceTitle">{{ group.title }}</h4>
            <ol :class="$style.practiceList">
              <li v-for="(item, index) in group.items" :key="index">{{ item }}</li>
            </ol>
          </div>
        </div>

        <ul v-else-if="section.type === 'links'" :class="$style.linkList">
          <li v-for="link in section.links" :key="link.href">
            <a
              :href="link.href"
              :class="$style.extLink"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span :class="$style.extLinkLabel">{{ link.label }}</span>
              <span :class="$style.extLinkUrl">{{ link.href }}</span>
              <span :class="$style.extLinkIcon" aria-hidden="true">↗</span>
            </a>
          </li>
        </ul>
      </section>
    </div>

    <footer :class="$style.footer">
      <p :class="$style.footerMeta">
        <span>Создано: {{ meta.created }}</span>
        <span aria-hidden="true">·</span>
        <span>Автор: {{ meta.author }}</span>
      </p>
      <p :class="$style.footerNote">{{ footerNote }}</p>
    </footer>
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
    rgb(235 153 20 / 0.06) 100%
  );
  box-shadow: var(--fs-shadow-sm);
}

.kicker {
  margin: 0;
  color: var(--fs-color-primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  @include typo.fs-text-tag;
}

.title {
  margin: var(--fs-space-1) 0 var(--fs-space-2);
  color: var(--fs-color-primary-strong);
  @include typo.fs-text-h3;
}

.metaGrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(fn.rem(200), 1fr));
  gap: var(--fs-space-2);
  margin: 0;
}

.metaItem {
  padding: var(--fs-space-2);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  background: var(--fs-color-bg);
}

.metaLabel {
  margin: 0 0 fn.rem(4);
  color: var(--fs-color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  @include typo.fs-text-tag;
}

.metaValue {
  margin: 0;
  color: var(--fs-color-text);
  @include typo.fs-text-body;
}

.metaLink {
  color: var(--fs-color-primary-strong);
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
    border-radius: var(--fs-radius-sm);
  }
}

.metaCode,
.pathCode {
  padding: fn.rem(2) fn.rem(6);
  border-radius: var(--fs-radius-sm);
  background: rgb(23 53 87 / 0.06);
  color: var(--fs-color-primary-strong);
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
  font-size: 0.92em;
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
  columns: 2;
  column-gap: var(--fs-space-3);
  @include typo.fs-text-body;

  @media (width <= fn.rem(640)) {
    columns: 1;
  }
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

.tocLinkAccent {
  color: var(--fs-color-primary);

  &:hover {
    color: var(--fs-color-warning);
  }
}

.sections {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-3);
}

.section {
  scroll-margin-top: fn.rem(80);
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-bg);
}

.sectionTitle {
  display: flex;
  gap: var(--fs-space-2);
  align-items: center;
  margin: 0 0 var(--fs-space-2);
  color: var(--fs-color-text);
  @include typo.fs-text-h4;
}

.sectionNum {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: fn.rem(28);
  height: fn.rem(28);
  border-radius: 999px;
  background: rgb(235 153 20 / 0.14);
  color: var(--fs-color-primary-strong);
  @include typo.fs-text-tag;
}

.tableWrap {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  @include typo.fs-text-body;

  th,
  td {
    padding: fn.rem(10) fn.rem(12);
    border-bottom: 1px solid var(--fs-color-border-light);
    text-align: left;
  }

  th {
    color: var(--fs-color-text-muted);
    @include typo.fs-text-tag;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: var(--fs-color-surface);
  }
}

.tableLabel {
  color: var(--fs-color-text);
  white-space: nowrap;
}

.practices {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
}

.practiceGroup {
  padding: var(--fs-space-2);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  background: var(--fs-color-surface);
}

.practiceTitle {
  margin: 0 0 var(--fs-space-1);
  color: var(--fs-color-text);
  @include typo.fs-text-header;
}

.practiceList {
  margin: 0;
  padding-left: var(--fs-space-3);
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;

  li + li {
    margin-top: fn.rem(6);
  }
}

.linkList {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
}

.extLink {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: fn.rem(4) var(--fs-space-2);
  padding: var(--fs-space-2);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  background: var(--fs-color-surface);
  color: inherit;
  text-decoration: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    border-color: var(--fs-color-border);
    box-shadow: var(--fs-shadow-sm);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.extLinkLabel {
  color: var(--fs-color-text);
  @include typo.fs-text-header;
}

.extLinkUrl {
  grid-column: 1;
  color: var(--fs-color-text-muted);
  font-size: 0.9em;
  word-break: break-all;
}

.extLinkIcon {
  grid-row: 1 / span 2;
  grid-column: 2;
  align-self: center;
  color: var(--fs-color-primary-strong);
}

.footer {
  padding: var(--fs-space-3);
  border: 1px dashed var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-surface);
  text-align: center;
}

.footerMeta {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1);
  justify-content: center;
  margin: 0 0 var(--fs-space-1);
  color: var(--fs-color-text-muted);
  @include typo.fs-text-tag;
}

.footerNote {
  margin: 0;
  color: var(--fs-color-text-muted);
  font-style: italic;
  @include typo.fs-text-body;
}
</style>
