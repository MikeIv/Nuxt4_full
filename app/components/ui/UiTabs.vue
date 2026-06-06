<script setup lang="ts">
export interface UiTabItem {
  value: string
  label: string
  badge?: string
}

const props = defineProps<{
  items: UiTabItem[]
  modelValue: string
  ariaLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function selectTab(value: string): void {
  if (value !== props.modelValue) {
    emit('update:modelValue', value)
  }
}

function onKeydown(event: KeyboardEvent, index: number): void {
  const { key } = event
  let nextIndex = index

  if (key === 'ArrowRight') {
    nextIndex = (index + 1) % props.items.length
  } else if (key === 'ArrowLeft') {
    nextIndex = (index - 1 + props.items.length) % props.items.length
  } else if (key === 'Home') {
    nextIndex = 0
  } else if (key === 'End') {
    nextIndex = props.items.length - 1
  } else {
    return
  }

  event.preventDefault()
  const next = props.items[nextIndex]
  if (next) {
    selectTab(next.value)
  }
}
</script>

<template>
  <div :class="$style.root">
    <div
      role="tablist"
      :aria-label="ariaLabel ?? 'Вкладки'"
      :class="$style.list"
    >
      <button
        v-for="(item, index) in items"
        :id="`tab-${item.value}`"
        :key="item.value"
        type="button"
        role="tab"
        :aria-selected="modelValue === item.value"
        :aria-controls="`panel-${item.value}`"
        :tabindex="modelValue === item.value ? 0 : -1"
        :class="[$style.tab, modelValue === item.value && $style.tabActive]"
        @click="selectTab(item.value)"
        @keydown="onKeydown($event, index)"
      >
        <span :class="$style.tabLabel">{{ item.label }}</span>
        <span v-if="item.badge" :class="$style.badge">{{ item.badge }}</span>
      </button>
    </div>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as fn;
@use '~/assets/styles/tools/typography' as typo;

.root {
  width: 100%;
}

.list {
  display: flex;
  gap: fn.rem(8);
  padding: fn.rem(4);
  overflow-x: auto;
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-surface);
  scrollbar-width: thin;
}

.tab {
  display: inline-flex;
  flex-shrink: 0;
  gap: fn.rem(6);
  align-items: center;
  padding: fn.rem(10) fn.rem(14);
  border: 1px solid transparent;
  border-radius: var(--fs-radius-md);
  background: transparent;
  color: var(--fs-color-text-muted);
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
  @include typo.fs-text-header;

  &:hover {
    background: rgb(255 255 255 / 0.7);
    color: var(--fs-color-text);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.tabActive {
  border-color: rgb(235 153 20 / 0.28);
  background: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-sm);
  color: var(--fs-color-primary-strong);
}

.tabLabel {
  white-space: nowrap;
}

.badge {
  padding: fn.rem(2) fn.rem(8);
  border-radius: 999px;
  background: rgb(23 53 87 / 0.08);
  color: var(--fs-color-primary-strong);
  @include typo.fs-text-tag;
}

.tabActive .badge {
  background: rgb(235 153 20 / 0.14);
  color: var(--fs-figma-gradient-auth-from);
}
</style>
