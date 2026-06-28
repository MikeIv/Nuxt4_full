<script setup lang="ts">
import { renderNotebookMarkdown } from '#shared/utils/renderNotebookMarkdown'

const props = defineProps<{
  text: string
}>()

const html = computed(() => renderNotebookMarkdown(props.text))
</script>

<template>
  <!-- eslint-disable-next-line vue/no-v-html -- trusted markdown from the signed-in user's own notes -->
  <div :class="$style.prose" v-html="html" />
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as fn;
@use '~/assets/styles/tools/typography' as typo;

.prose {
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;

  :global(h1),
  :global(h2),
  :global(h3),
  :global(h4) {
    margin: var(--fs-space-2) 0 var(--fs-space-1);
    color: var(--fs-color-text);
    line-height: 1.35;

    &:first-child {
      margin-top: 0;
    }
  }

  :global(h1) {
    @include typo.fs-text-h3;
  }

  :global(h2),
  :global(h3),
  :global(h4) {
    @include typo.fs-text-h4;
  }

  :global(p) {
    margin: 0 0 var(--fs-space-1);

    &:last-child {
      margin-bottom: 0;
    }
  }

  :global(ul),
  :global(ol) {
    margin: 0 0 var(--fs-space-2);
    padding-left: var(--fs-space-3);

    &:last-child {
      margin-bottom: 0;
    }
  }

  :global(li) {
    margin-bottom: fn.rem(4);

    &:last-child {
      margin-bottom: 0;
    }
  }

  :global(strong) {
    color: var(--fs-color-text);
    font-weight: 600;
  }

  :global(code) {
    padding: fn.rem(1) fn.rem(6);
    border-radius: var(--fs-radius-sm);
    background: rgb(235 153 20 / 0.12);
    color: var(--fs-color-primary-strong);
    font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
    font-size: 0.92em;
  }

  :global(pre) {
    overflow-x: auto;
    margin: 0 0 var(--fs-space-2);
    padding: var(--fs-space-2);
    border: 1px solid var(--fs-color-border-light);
    border-radius: var(--fs-radius-md);
    background: var(--fs-color-surface);

    &:last-child {
      margin-bottom: 0;
    }

    :global(code) {
      padding: 0;
      background: transparent;
      color: var(--fs-color-text);
      font-size: 0.9em;
    }
  }

  :global(a) {
    color: var(--fs-color-primary-strong);
    text-decoration: underline;
    text-underline-offset: fn.rem(2);

    &:hover {
      color: var(--fs-color-primary);
    }
  }

  :global(blockquote) {
    margin: 0 0 var(--fs-space-2);
    padding-left: var(--fs-space-2);
    border-left: 3px solid var(--fs-color-border);
    color: var(--fs-color-text-muted);
  }

  :global(hr) {
    margin: var(--fs-space-2) 0;
    border: none;
    border-top: 1px solid var(--fs-color-border-light);
  }
}
</style>
