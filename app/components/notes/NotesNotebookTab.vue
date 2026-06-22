<script setup lang="ts">
import type { NotebookEntry } from '#shared/types/notebook'
import { formatApiError } from '#shared/utils/formatApiError'
import { useAppToast } from '~/composables/useAppToast'

const { loggedIn, ready } = useAuth()

const {
  entries,
  pending,
  error,
  refresh,
  createEntry,
  updateEntry,
  deleteEntry,
  isCreating,
  isUpdating,
  isDeleting,
} = useNotebook()

const { notebookSort, hasAnyEntries, sortedEntries, sortOptions } = useNotebookFilters(entries)

const toast = useAppToast()

const newTitle = ref('')
const newDesc = ref('')
const newCode = ref('')
const titleInputRef = ref<HTMLInputElement | null>(null)

const editingId = ref<string | null>(null)
const editTitle = ref('')
const editDesc = ref('')
const editCode = ref('')

const SKELETON_ROWS = 3

const isEntryBusy = (id: string) => isUpdating(id) || isDeleting(id)

const isAnyEntryBusy = computed(
  () => editingId.value !== null || isCreating.value || entries.value.some((e) => isEntryBusy(e.id)),
)

const loadErrorMessage = computed(() =>
  formatApiError(error.value, 'Не удалось загрузить заметки. Проверьте подключение к серверу.'),
)

const notifyError = (cause: unknown, fallback: string) => {
  toast.error(formatApiError(cause, fallback))
}

const focusCreateForm = () => {
  titleInputRef.value?.focus()
  titleInputRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const handleCreate = async () => {
  const title = newTitle.value.trim()
  if (!title || isCreating.value) return

  try {
    await createEntry({
      title,
      description: newDesc.value.trim() || undefined,
      code: newCode.value.trim() || undefined,
    })

    toast.success(`Заметка «${title}» создана`)
    newTitle.value = ''
    newDesc.value = ''
    newCode.value = ''
    await nextTick()
    focusCreateForm()
  } catch (e) {
    notifyError(e, 'Не удалось создать заметку. Попробуйте ещё раз.')
  }
}

const startEdit = (entry: NotebookEntry) => {
  if (isAnyEntryBusy.value) return

  editingId.value = entry.id
  editTitle.value = entry.title
  editDesc.value = entry.description ?? ''
  editCode.value = entry.code ?? ''
}

const cancelEdit = () => {
  editingId.value = null
  editTitle.value = ''
  editDesc.value = ''
  editCode.value = ''
}

const saveEdit = async () => {
  const id = editingId.value
  if (!id || isEntryBusy(id)) return

  const title = editTitle.value.trim()
  if (!title) {
    cancelEdit()
    return
  }

  try {
    await updateEntry(id, {
      title,
      description: editDesc.value.trim() || null,
      code: editCode.value.trim() || null,
    })
    toast.success(`Заметка «${title}» обновлена`)
    cancelEdit()
  } catch (e) {
    notifyError(e, 'Не удалось сохранить изменения. Попробуйте ещё раз.')
  }
}

const handleDelete = async (id: string) => {
  if (isEntryBusy(id) || isCreating.value) return
  if (!confirm('Удалить заметку?')) return

  const entryTitle = entries.value.find((entry) => entry.id === id)?.title ?? 'Заметка'

  try {
    await deleteEntry(id)
    toast.success(`Заметка «${entryTitle}» удалена`)
  } catch (e) {
    notifyError(e, 'Не удалось удалить заметку. Попробуйте ещё раз.')
  }
}
</script>

<template>
  <div :class="$style.root">
    <p v-if="!ready" :class="$style.authLoading">Проверка сессии…</p>

    <template v-else-if="!loggedIn">
      <div :class="$style.guest">
        <span :class="$style.stateIcon" aria-hidden="true">🔒</span>
        <h2 :class="$style.stateTitle">Блокнот доступен после входа</h2>
        <p :class="$style.stateMessage">
          Войдите в аккаунт, чтобы создавать и хранить личные заметки с кодом.
        </p>
        <div :class="$style.guestActions">
          <NuxtLink to="/login" :class="[$style.btn, $style.btnPrimary]">Вход</NuxtLink>
          <NuxtLink to="/register" :class="[$style.btn, $style.btnGhost]">Регистрация</NuxtLink>
        </div>
      </div>
    </template>

    <template v-else>
      <section :class="$style.createSection">
        <h2 :class="$style.createTitle">Новая заметка</h2>

        <form :class="$style.createForm" @submit.prevent="handleCreate">
          <div :class="$style.formRow">
            <input
              ref="titleInputRef"
              v-model="newTitle"
              :class="$style.input"
              type="text"
              placeholder="Название заметки *"
              required
              autocomplete="off"
              :disabled="isCreating"
            />

            <button
              type="submit"
              :class="[$style.btn, $style.btnPrimary]"
              :disabled="!newTitle.trim() || isCreating"
              :aria-busy="isCreating"
            >
              {{ isCreating ? 'Добавление…' : 'Добавить' }}
            </button>
          </div>

          <textarea
            v-model="newDesc"
            :class="$style.textarea"
            placeholder="Описание"
            rows="2"
            :disabled="isCreating"
          />

          <textarea
            v-model="newCode"
            :class="[$style.textarea, $style.codeInput]"
            placeholder="Код (необязательно)"
            rows="4"
            spellcheck="false"
            :disabled="isCreating"
          />
        </form>
      </section>

      <section
        v-if="pending"
        :class="$style.skeletonList"
        aria-busy="true"
        aria-live="polite"
        aria-label="Загрузка заметок"
      >
        <p :class="$style.skeletonLabel">Загрузка заметок…</p>
        <div
          v-for="row in SKELETON_ROWS"
          :key="row"
          :class="$style.skeletonEntry"
          aria-hidden="true"
        >
          <div :class="$style.skeletonBody">
            <span :class="[$style.skeletonBlock, $style.skeletonTitle]" />
            <span :class="[$style.skeletonBlock, $style.skeletonDesc]" />
          </div>
        </div>
      </section>

      <section
        v-else-if="error"
        :class="$style.errorState"
        role="alert"
        aria-live="assertive"
      >
        <span :class="$style.stateIcon" aria-hidden="true">⚠️</span>
        <h2 :class="$style.stateTitle">Не удалось загрузить заметки</h2>
        <p :class="$style.stateMessage">{{ loadErrorMessage }}</p>
        <button type="button" :class="[$style.btn, $style.btnPrimary]" @click="() => refresh()">
          Повторить
        </button>
      </section>

      <div v-else>
        <section
          v-if="hasAnyEntries"
          :class="$style.toolbar"
          aria-label="Сортировка заметок"
        >
          <label :class="$style.sortControl">
            <span :class="$style.sortLabel">Сортировка</span>
            <select v-model="notebookSort" :class="$style.sortSelect">
              <option
                v-for="option in sortOptions"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
          </label>
        </section>

        <ul v-if="sortedEntries.length" :class="$style.list">
          <li
            v-for="entry in sortedEntries"
            :key="entry.id"
            :class="$style.entry"
            :aria-busy="isEntryBusy(entry.id)"
          >
            <div :class="$style.entryContent">
              <template v-if="editingId === entry.id">
                <input
                  v-model="editTitle"
                  :class="$style.input"
                  type="text"
                  placeholder="Название заметки"
                  :disabled="isEntryBusy(entry.id)"
                  @keyup.enter="saveEdit"
                  @keyup.esc="cancelEdit"
                />
                <textarea
                  v-model="editDesc"
                  :class="$style.textarea"
                  placeholder="Описание"
                  rows="2"
                  :disabled="isEntryBusy(entry.id)"
                  @keyup.esc="cancelEdit"
                />
                <textarea
                  v-model="editCode"
                  :class="[$style.textarea, $style.codeInput]"
                  placeholder="Код"
                  rows="4"
                  spellcheck="false"
                  :disabled="isEntryBusy(entry.id)"
                  @keyup.esc="cancelEdit"
                />
              </template>

              <template v-else>
                <h3
                  :class="[
                    $style.entryTitle,
                    (isEntryBusy(entry.id) || isCreating) && $style.entryTitleDisabled,
                  ]"
                  title="Нажмите, чтобы редактировать"
                  @click="startEdit(entry)"
                >
                  {{ entry.title }}
                </h3>
                <p v-if="entry.description" :class="$style.entryDesc">
                  {{ entry.description }}
                </p>
                <NotesCodeBlock
                  v-if="entry.code"
                  :code="entry.code"
                  label="Код"
                  :class="$style.codeBlock"
                />
              </template>
            </div>

            <div :class="$style.entryActions">
              <template v-if="editingId === entry.id">
                <button
                  type="button"
                  :class="[$style.btn, $style.btnPrimary, $style.btnSm]"
                  :disabled="isEntryBusy(entry.id)"
                  @click="saveEdit"
                >
                  {{ isEntryBusy(entry.id) ? 'Сохранение…' : 'Сохранить' }}
                </button>
                <button
                  type="button"
                  :class="[$style.btn, $style.btnGhost, $style.btnSm]"
                  :disabled="isEntryBusy(entry.id)"
                  @click="cancelEdit"
                >
                  Отмена
                </button>
              </template>

              <template v-else>
                <button
                  type="button"
                  :class="[$style.btn, $style.btnGhost, $style.btnSm]"
                  :disabled="isEntryBusy(entry.id) || isCreating || isAnyEntryBusy"
                  @click="startEdit(entry)"
                >
                  Изменить
                </button>
                <button
                  type="button"
                  :class="[$style.btn, $style.btnDanger, $style.btnSm]"
                  :disabled="isEntryBusy(entry.id) || isCreating"
                  @click="handleDelete(entry.id)"
                >
                  {{ isEntryBusy(entry.id) ? 'Удаление…' : 'Удалить' }}
                </button>
              </template>
            </div>
          </li>
        </ul>

        <div v-else :class="$style.empty">
          <span :class="$style.stateIcon" aria-hidden="true">📝</span>
          <h2 :class="$style.stateTitle">Пока нет заметок</h2>
          <p :class="$style.stateMessage">
            Добавьте первую заметку — название, описание и при необходимости фрагмент кода.
          </p>
          <button type="button" :class="[$style.btn, $style.btnPrimary]" @click="focusCreateForm">
            Создать заметку
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as fn;
@use '~/assets/styles/tools/typography' as typo;

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

@mixin skeleton-surface {
  border-radius: var(--fs-radius-sm);
  background: linear-gradient(
    90deg,
    var(--fs-color-surface) 0%,
    var(--fs-color-border-light) 45%,
    var(--fs-color-surface) 90%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.4s ease-in-out infinite;
}

.root {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-3);
}

.createSection {
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-bg);
}

.createTitle {
  margin: 0 0 var(--fs-space-2);
  color: var(--fs-color-text);
  @include typo.fs-text-h4;
}

.createForm {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
}

.formRow {
  display: flex;
  gap: var(--fs-space-2);
  align-items: center;
}

.input,
.textarea {
  width: 100%;
  padding: var(--fs-space-2);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  background: var(--fs-color-bg);
  color: var(--fs-color-text);
  @include typo.fs-text-body;

  &::placeholder {
    color: var(--fs-color-text-muted);
  }

  &:focus {
    outline: none;
    border-color: var(--fs-color-primary);
    box-shadow: 0 0 0 3px rgb(235 153 20 / 0.12);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    background: var(--fs-color-surface);
  }
}

.textarea {
  resize: vertical;
  min-height: fn.rem(60);
}

.codeInput {
  font-family: ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace;
  font-size: 0.9em;
  line-height: 1.5;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: var(--fs-space-2);
  padding: var(--fs-space-2);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-bg);
}

.sortControl {
  display: flex;
  align-items: center;
  gap: var(--fs-space-1);
}

.sortLabel {
  color: var(--fs-color-text-muted);
  @include typo.fs-text-tag;
}

.sortSelect {
  padding: fn.rem(6) fn.rem(10);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  background: var(--fs-color-bg);
  color: var(--fs-color-text);
  @include typo.fs-text-body;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
}

.entry {
  display: flex;
  align-items: flex-start;
  gap: var(--fs-space-2);
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-bg);
  transition: border-color 0.15s ease;

  &:hover {
    border-color: var(--fs-color-border);
  }
}

.entryContent {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
}

.entryTitle {
  margin: 0;
  color: var(--fs-color-text);
  cursor: pointer;
  @include typo.fs-text-h4;

  &:hover {
    color: var(--fs-color-primary-strong);
  }
}

.entryTitleDisabled {
  cursor: not-allowed;
  pointer-events: none;
  opacity: 0.6;
}

.entryDesc {
  margin: 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}

.codeBlock {
  margin-top: var(--fs-space-1);
}

.entryActions {
  display: flex;
  gap: var(--fs-space-1);
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.15s ease;

  .entry:hover & {
    opacity: 1;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: fn.rem(8) fn.rem(14);
  border-radius: var(--fs-radius-md);
  border: 1px solid var(--fs-color-border-light);
  background: var(--fs-color-bg);
  color: var(--fs-color-text);
  text-decoration: none;
  @include typo.fs-text-header;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease;

  &:hover:not(:disabled) {
    background: var(--fs-color-surface);
    border-color: var(--fs-color-border);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btnSm {
  padding: fn.rem(6) fn.rem(10);
  font-size: 0.9em;
}

.btnPrimary {
  background: var(--fs-color-primary);
  color: var(--fs-figma-achromatic-white);
  border-color: transparent;

  &:hover:not(:disabled) {
    filter: brightness(0.95);
    background: var(--fs-color-primary);
  }
}

.btnDanger {
  color: var(--fs-color-error);
  border-color: rgb(238 46 34 / 0.3);

  &:hover:not(:disabled) {
    background: rgb(238 46 34 / 0.08);
    border-color: var(--fs-color-error);
  }
}

.btnGhost {
  background: transparent;

  &:hover:not(:disabled) {
    background: var(--fs-color-surface);
  }
}

.skeletonList {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
}

.skeletonLabel {
  margin: 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-tag;
}

.skeletonEntry {
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-bg);
}

.skeletonBody {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
}

.skeletonBlock {
  display: block;
  @include skeleton-surface;
}

.skeletonTitle {
  width: 55%;
  height: fn.rem(18);
}

.skeletonDesc {
  width: 80%;
  height: fn.rem(12);
}

.authLoading {
  margin: 0;
  padding: var(--fs-space-3);
  color: var(--fs-color-text-muted);
  text-align: center;
  @include typo.fs-text-body;
}

.empty,
.errorState,
.guest {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--fs-space-2);
  padding: var(--fs-space-4) var(--fs-space-3);
  text-align: center;
  border-radius: var(--fs-radius-lg);
}

.empty,
.guest {
  border: 1px dashed var(--fs-color-border-light);
  background: var(--fs-color-bg);
}

.errorState {
  border: 1px solid rgb(238 46 34 / 0.28);
  background: rgb(238 46 34 / 0.06);
}

.guestActions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-2);
  justify-content: center;
}

.stateIcon {
  font-size: fn.rem(40);
  line-height: 1;
}

.stateTitle {
  margin: 0;
  color: var(--fs-color-text);
  @include typo.fs-text-h4;
}

.stateMessage {
  max-width: fn.rem(420);
  margin: 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}

.errorState .stateTitle,
.errorState .stateMessage {
  color: var(--fs-color-error);
}

.errorState .stateMessage {
  opacity: 0.88;
}
</style>
