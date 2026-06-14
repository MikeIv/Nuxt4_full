<script setup lang="ts">
const props = defineProps<{
  open: boolean
  mode: 'setup' | 'unlock'
  loading?: boolean
}>()

const emit = defineEmits<{
  close: []
  submitSetup: [password: string, confirmPassword: string]
  submitUnlock: [password: string]
  forgotPassword: []
}>()

const password = ref('')
const confirmPassword = ref('')
const dialogRef = ref<HTMLDialogElement | null>(null)
const titleId = 'notes-access-dialog-title'

const title = computed(() =>
  props.mode === 'setup' ? 'Установите пароль' : 'Введите пароль',
)

const resetFields = () => {
  password.value = ''
  confirmPassword.value = ''
}

watch(
  () => props.open,
  (isOpen) => {
    const dialog = dialogRef.value
    if (!dialog) {
      return
    }

    if (isOpen) {
      resetFields()
      if (!dialog.open) {
        dialog.showModal()
      }
      return
    }

    if (dialog.open) {
      dialog.close()
    }
  },
)

watch(
  () => props.mode,
  () => {
    resetFields()
  },
)

const handleClose = () => {
  emit('close')
}

const handleSubmit = () => {
  if (props.mode === 'setup') {
    emit('submitSetup', password.value, confirmPassword.value)
    return
  }

  emit('submitUnlock', password.value)
}
</script>

<template>
  <dialog
    ref="dialogRef"
    :class="$style.dialog"
    :aria-labelledby="titleId"
    @close="handleClose"
    @cancel.prevent="handleClose"
  >
    <form :class="$style.form" @submit.prevent="handleSubmit">
      <header :class="$style.header">
        <h2 :id="titleId" :class="$style.title">{{ title }}</h2>
        <button
          type="button"
          :class="$style.closeBtn"
          aria-label="Закрыть"
          @click="handleClose"
        >
          ×
        </button>
      </header>

      <p :class="$style.lead">
        {{
          mode === 'setup'
            ? 'Задайте пароль для раздела «Серверные доступы». Он понадобится при каждом входе.'
            : 'Раздел «Серверные доступы» защищён паролем.'
        }}
      </p>

      <label :class="$style.field">
        <span :class="$style.label">Пароль</span>
        <input
          v-model="password"
          :class="$style.input"
          type="password"
          :autocomplete="mode === 'setup' ? 'new-password' : 'current-password'"
          minlength="8"
          required
        />
      </label>

      <label v-if="mode === 'setup'" :class="$style.field">
        <span :class="$style.label">Повторите пароль</span>
        <input
          v-model="confirmPassword"
          :class="$style.input"
          type="password"
          autocomplete="new-password"
          minlength="8"
          required
        />
      </label>

      <div :class="$style.actions">
        <button type="submit" :class="$style.submitBtn" :disabled="loading">
          {{ loading ? 'Проверка…' : mode === 'setup' ? 'Сохранить пароль' : 'Войти' }}
        </button>
      </div>

      <button
        v-if="mode === 'unlock'"
        type="button"
        :class="$style.forgotBtn"
        :disabled="loading"
        @click="emit('forgotPassword')"
      >
        Забыли пароль?
      </button>
    </form>
  </dialog>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as fn;
@use '~/assets/styles/tools/typography' as typo;

.dialog {
  width: min(100% - var(--fs-space-3), fn.rem(420));
  padding: 0;
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-bg);
  box-shadow: var(--fs-shadow-md);

  &::backdrop {
    background: rgb(23 23 32 / 0.45);
  }
}

.form {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
  padding: var(--fs-space-3);
}

.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--fs-space-2);
}

.title {
  margin: 0;
  color: var(--fs-color-text);
  @include typo.fs-text-h4;
}

.closeBtn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fn.rem(32);
  height: fn.rem(32);
  padding: 0;
  border: none;
  border-radius: var(--fs-radius-sm);
  background: transparent;
  color: var(--fs-color-text-muted);
  font-size: fn.rem(24);
  line-height: 1;
  cursor: pointer;

  &:hover {
    background: var(--fs-color-surface);
    color: var(--fs-color-text);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.lead {
  margin: 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}

.field {
  display: flex;
  flex-direction: column;
  gap: fn.rem(6);
}

.label {
  color: var(--fs-color-text-muted);
  @include typo.fs-text-tag;
}

.input {
  padding: fn.rem(10) var(--fs-space-2);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  background: var(--fs-color-surface);
  color: var(--fs-color-text);
  font-size: 14px;

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 1px;
  }
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.submitBtn {
  padding: fn.rem(10) var(--fs-space-3);
  border: none;
  border-radius: var(--fs-radius-md);
  background: var(--fs-color-primary);
  color: var(--fs-color-bg);
  cursor: pointer;
  @include typo.fs-text-button;

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary-strong);
    outline-offset: 2px;
  }
}

.forgotBtn {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--fs-color-primary-strong);
  text-decoration: underline;
  cursor: pointer;
  @include typo.fs-text-body;

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
    border-radius: var(--fs-radius-sm);
  }
}
</style>
