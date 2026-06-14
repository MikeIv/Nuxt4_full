<script setup lang="ts">
import { useAppToast } from '~/composables/useAppToast'

const { toasts, dismiss } = useAppToast()
</script>

<template>
  <div
    v-if="toasts.length"
    :class="$style.host"
    aria-live="polite"
    aria-relevant="additions"
    aria-label="Уведомления"
  >
    <TransitionGroup name="toast" tag="ul" :class="$style.list">
      <li
        v-for="toast in toasts"
        :key="toast.id"
        :class="[$style.toast, toast.variant === 'success' ? $style.success : $style.error]"
        :role="toast.variant === 'error' ? 'alert' : 'status'"
      >
        <span :class="$style.icon" aria-hidden="true">
          {{ toast.variant === 'success' ? '✓' : '!' }}
        </span>
        <p :class="$style.message">{{ toast.message }}</p>
        <button
          type="button"
          :class="$style.close"
          aria-label="Закрыть уведомление"
          @click="dismiss(toast.id)"
        >
          ×
        </button>
      </li>
    </TransitionGroup>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as fn;
@use '~/assets/styles/tools/typography' as typo;

.host {
  position: fixed;
  z-index: 100;
  top: fn.rem(72);
  right: var(--fs-space-2);
  width: min(calc(100vw - var(--fs-space-4)), fn.rem(360));
  pointer-events: none;
}

.list {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  margin: 0;
  padding: 0;
  list-style: none;
}

.toast {
  display: flex;
  gap: var(--fs-space-2);
  align-items: flex-start;
  padding: var(--fs-space-2) var(--fs-space-2) var(--fs-space-2) var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: rgb(255 255 255 / 0.96);
  box-shadow: var(--fs-shadow-md);
  pointer-events: auto;
  backdrop-filter: blur(8px);
}

.success {
  border-color: rgb(51 174 39 / 0.35);
  background: rgb(51 174 39 / 0.08);
}

.error {
  border-color: rgb(238 46 34 / 0.35);
  background: rgb(238 46 34 / 0.08);
}

.icon {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: fn.rem(22);
  height: fn.rem(22);
  border-radius: 999px;
  font-size: fn.rem(13);
  font-weight: 700;
  line-height: 1;
}

.success .icon {
  background: rgb(51 174 39 / 0.16);
  color: var(--fs-color-success);
}

.error .icon {
  background: rgb(238 46 34 / 0.16);
  color: var(--fs-color-error);
}

.message {
  flex: 1;
  margin: fn.rem(2) 0 0;
  color: var(--fs-color-text);
  @include typo.fs-text-body;
}

.close {
  flex-shrink: 0;
  width: fn.rem(28);
  height: fn.rem(28);
  border: none;
  border-radius: var(--fs-radius-sm);
  background: transparent;
  color: var(--fs-color-text-muted);
  font-size: fn.rem(20);
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background: rgb(23 23 32 / 0.06);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}
</style>

<style scoped lang="scss">
.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(12px);
}

.toast-move {
  transition: transform 0.2s ease;
}
</style>
