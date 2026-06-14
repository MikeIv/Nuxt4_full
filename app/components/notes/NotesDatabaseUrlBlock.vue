<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    label?: string
    username?: string
    host?: string
    port?: number
    database?: string
    schema?: string
    initialPassword?: string
  }>(),
  {
    label: 'Строка подключения (.env)',
    username: 'nuxtuser',
    host: 'localhost',
    port: 5432,
    database: 'nuxt4full',
    schema: 'public',
    initialPassword: 'НовыйСильныйПароль123!',
  },
)

const COPY_RESET_MS = 2000

const { copyToClipboard } = useCopyToClipboard()
const {
  savedPassword,
  password,
  passwordInputRef,
  isEditing,
  showCheck,
  handleAction,
  handleInputKeydown,
} = useNotesEditablePasswordField(props.initialPassword)

const copied = ref(false)

const connectionPath = computed(
  () => `@${props.host}:${props.port}/${props.database}?schema=${props.schema}`,
)

const fullEnvLine = computed(() => {
  const encodedPassword = encodeURIComponent(savedPassword.value)
  return `DATABASE_URL="postgresql://${props.username}:${encodedPassword}${connectionPath.value}"`
})

const copyEnvLine = async () => {
  const ok = await copyToClipboard(fullEnvLine.value)
  if (!ok) {
    return
  }

  copied.value = true
  window.setTimeout(() => {
    copied.value = false
  }, COPY_RESET_MS)
}
</script>

<template>
  <div :class="$style.root">
    <div :class="$style.toolbar">
      <span v-if="label" :class="$style.label">{{ label }}</span>
      <button
        type="button"
        :class="$style.copyBtn"
        :aria-label="copied ? 'Скопировано' : 'Скопировать DATABASE_URL'"
        @click="copyEnvLine"
      >
        {{ copied ? 'Скопировано' : 'Копировать' }}
      </button>
    </div>

    <div :class="$style.body">
      <code :class="$style.code">
        <span :class="$style.prefix">DATABASE_URL="postgresql://{{ username }}:</span>
        <span :class="$style.inputWrap">
          <input
            ref="passwordInputRef"
            v-model="password"
            type="text"
            :class="[$style.passwordInput, isEditing && $style.passwordInputActive]"
            :readonly="!isEditing"
            spellcheck="false"
            autocomplete="off"
            aria-label="Пароль в DATABASE_URL"
            @keydown="handleInputKeydown"
          />
          <button
            type="button"
            :class="[$style.actionBtn, showCheck && $style.actionBtnConfirm]"
            :aria-label="
              showCheck ? 'Сохранить пароль' : isEditing ? 'Отменить редактирование' : 'Редактировать пароль'
            "
            @click="handleAction"
          >
            <svg
              v-if="showCheck"
              :class="$style.icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M5 13l4 4L19 7"
                stroke="currentColor"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg
              v-else
              :class="$style.icon"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </span>
        <span :class="$style.suffix">{{ connectionPath }}"</span>
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
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: fn.rem(2);
  padding: var(--fs-space-1) var(--fs-space-3);
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  color: var(--fs-color-primary-strong);
}

.prefix,
.suffix {
  white-space: pre;
}

.inputWrap {
  display: inline-flex;
  align-items: center;
  gap: fn.rem(6);
  min-width: fn.rem(180);
  max-width: 100%;
  padding: fn.rem(2) fn.rem(4) fn.rem(2) fn.rem(8);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-sm);
  background: rgb(23 53 87 / 0.04);
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.passwordInput {
  flex: 1;
  min-width: fn.rem(120);
  padding: fn.rem(4) 0;
  border: none;
  background: transparent;
  color: var(--fs-color-primary-strong);
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  outline: none;
  cursor: default;

  &[readonly] {
    user-select: none;
  }
}

.passwordInputActive {
  cursor: text;
}

.inputWrap:has(.passwordInputActive) {
  border-color: rgb(235 153 20 / 0.45);
  background: rgb(235 153 20 / 0.08);
  box-shadow: 0 0 0 2px rgb(235 153 20 / 0.12);
}

.actionBtn {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: fn.rem(28);
  height: fn.rem(28);
  padding: 0;
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-sm);
  background: var(--fs-color-surface);
  color: var(--fs-color-text-muted);
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease,
    transform 0.12s ease;

  &:hover {
    border-color: var(--fs-color-border);
    background: var(--fs-color-bg);
    color: var(--fs-color-primary-strong);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }

  &:active {
    transform: scale(0.94);
  }
}

.actionBtnConfirm {
  border-color: rgb(51 174 39 / 0.35);
  background: rgb(51 174 39 / 0.12);
  color: var(--fs-color-success);

  &:hover {
    border-color: rgb(51 174 39 / 0.55);
    background: rgb(51 174 39 / 0.2);
    color: var(--fs-color-success);
  }
}

.icon {
  width: fn.rem(14);
  height: fn.rem(14);
}
</style>
