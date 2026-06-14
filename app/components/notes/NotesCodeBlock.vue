<script setup lang="ts">
const props = defineProps<{
  code: string
  label?: string
}>()

type CodeLineType = 'command' | 'comment'

interface CodeLine {
  text: string
  type: CodeLineType
}

const COPY_ALL_RESET_MS = 2000
const COPY_LINE_RESET_MS = 1500

const { copyToClipboard } = useCopyToClipboard()
const copiedAll = ref(false)
const copiedLineIndex = ref<number | null>(null)

const flashCopyState = (target: 'all' | number, resetMs: number) => {
  if (target === 'all') {
    copiedAll.value = true
    window.setTimeout(() => {
      copiedAll.value = false
    }, resetMs)
    return
  }

  copiedLineIndex.value = target
  window.setTimeout(() => {
    copiedLineIndex.value = null
  }, resetMs)
}

const lines = computed<CodeLine[]>(() =>
  props.code.split('\n').flatMap((line) => {
    const trimmed = line.trim()

    if (!trimmed) {
      return []
    }

    return [
      {
        text: line,
        type: trimmed.startsWith('#') ? 'comment' : 'command',
      },
    ]
  }),
)

const copyCode = async () => {
  const copied = await copyToClipboard(props.code)
  if (copied) {
    flashCopyState('all', COPY_ALL_RESET_MS)
  }
}

const copyLine = async (text: string, index: number) => {
  const copied = await copyToClipboard(text.trim())
  if (copied) {
    flashCopyState(index, COPY_LINE_RESET_MS)
  }
}
</script>

<template>
  <div :class="$style.root">
    <div :class="$style.toolbar">
      <span v-if="label" :class="$style.label">{{ label }}</span>
      <button
        type="button"
        :class="$style.copyBtn"
        :aria-label="copiedAll ? 'Скопировано' : 'Скопировать весь блок'"
        @click="copyCode"
      >
        {{ copiedAll ? 'Скопировано' : 'Копировать' }}
      </button>
    </div>
    <div :class="$style.body">
      <code :class="$style.code">
        <template v-for="(line, index) in lines" :key="index">
          <button
            v-if="line.type === 'command'"
            type="button"
            :class="[
              $style.line,
              $style.lineCommand,
              copiedLineIndex === index && $style.lineCopied,
            ]"
            :title="`Скопировать: ${line.text.trim()}`"
            @click="copyLine(line.text, index)"
          >
            {{ line.text }}
          </button>
          <span v-else-if="line.type === 'comment'" :class="[$style.line, $style.lineComment]">
            {{ line.text }}
          </span>
        </template>
      </code>
    </div>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as fn;
@use '~/assets/styles/tools/typography' as typo;

.root {
  overflow: hidden;
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  background: var(--fs-color-bg);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--fs-space-1);
  padding: fn.rem(6) var(--fs-space-1);
  border-bottom: 1px solid var(--fs-color-border-light);
  background: rgb(23 53 87 / 0.04);
}

.label {
  color: var(--fs-color-text-muted);
  @include typo.fs-text-tag;
}

.copyBtn {
  padding: fn.rem(4) fn.rem(10);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-sm);
  background: var(--fs-color-surface);
  color: var(--fs-color-text);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
  @include typo.fs-text-tag;

  &:hover {
    border-color: var(--fs-color-border);
    background: var(--fs-color-bg);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.body {
  overflow-x: auto;
}

.code {
  display: block;
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
}

.line {
  display: block;
  width: 100%;
  text-align: left;
  white-space: pre;
}

.lineCommand {
  padding: var(--fs-space-1) var(--fs-space-3);
  border: none;
  border-radius: var(--fs-radius-sm);
  background: transparent;
  color: var(--fs-color-primary-strong);
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.25;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background: rgb(23 53 87 / 0.08);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 1px;
  }
}

.lineCopied {
  background: rgb(235 153 20 / 0.14);
}

.lineComment {
  padding-inline: var(--fs-space-3);
  color: var(--fs-color-text-muted);
  line-height: 1.35;
  @include typo.fs-text-tag;
}
</style>
