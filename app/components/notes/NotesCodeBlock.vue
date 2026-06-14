<script setup lang="ts">
const props = defineProps<{
  code: string
  label?: string
}>()

const toast = useToast()
const copied = ref(false)

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    toast.success('Скопировано в буфер обмена')
    window.setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch {
    toast.error('Не удалось скопировать')
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
        :aria-label="copied ? 'Скопировано' : 'Скопировать код'"
        @click="copyCode"
      >
        {{ copied ? 'Скопировано' : 'Копировать' }}
      </button>
    </div>
    <pre :class="$style.pre"><code :class="$style.code">{{ code }}</code></pre>
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
  gap: var(--fs-space-2);
  padding: fn.rem(8) fn.rem(12);
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

.pre {
  margin: 0;
  padding: var(--fs-space-2);
  overflow-x: auto;
}

.code {
  display: block;
  color: var(--fs-color-primary-strong);
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
  font-size: fn.rem(13);
  line-height: 1.55;
  white-space: pre;
}
</style>
