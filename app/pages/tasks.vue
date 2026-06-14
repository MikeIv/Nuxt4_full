<script setup lang="ts">
import type { Task } from '#shared/types/task'
import { formatApiError } from '#shared/utils/formatApiError'

definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Задачи — Nuxt4_full',
})

const {
  tasks,
  pending,
  error,
  refresh,
  createTask,
  updateTask,
  deleteTask,
  toggleTask,
  isCreating,
  isToggling,
  isDeleting,
} = useTasks()

const {
  taskFilter,
  taskSort,
  hasAnyTasks,
  filteredTasks,
  isFilterEmpty,
  resetFilter,
  filterOptions,
  sortOptions,
} = useTaskFilters(tasks)

const toast = useAppToast()

const newTitle = ref('')
const newDesc = ref('')
const titleInputRef = ref<HTMLInputElement | null>(null)

const editingId = ref<string | null>(null)
const editTitle = ref('')
const editDesc = ref('')

const busyTaskId = ref<string | null>(null)

const isTaskBusy = (id: string) =>
  isToggling(id) || isDeleting(id) || busyTaskId.value === id

const isAnyTaskBusy = computed(
  () => busyTaskId.value !== null || isCreating.value,
)

const notifyError = (cause: unknown, fallback: string) => {
  toast.error(formatApiError(cause, fallback))
}

const SKELETON_ROWS = 4

const loadErrorMessage = computed(() =>
  formatApiError(error.value, 'Не удалось загрузить список задач. Проверьте подключение к серверу.'),
)

const focusCreateForm = () => {
  titleInputRef.value?.focus()
  titleInputRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

const handleCreate = async () => {
  const title = newTitle.value.trim()
  if (!title || isCreating.value) return

  try {
    await createTask({
      title,
      description: newDesc.value.trim() || undefined,
    })

    toast.success(`Задача «${title}» создана`)
    newTitle.value = ''
    newDesc.value = ''
    await nextTick()
    focusCreateForm()
  } catch (e) {
    notifyError(e, 'Не удалось создать задачу. Попробуйте ещё раз.')
  }
}

const startEdit = (task: Task) => {
  if (busyTaskId.value !== null || isCreating.value) return

  editingId.value = task.id
  editTitle.value = task.title
  editDesc.value = task.description ?? ''
}

const saveEdit = async () => {
  const id = editingId.value
  if (!id || busyTaskId.value !== null) return

  const title = editTitle.value.trim()
  if (!title) {
    cancelEdit()
    return
  }

  busyTaskId.value = id
  try {
    await updateTask(id, {
      title,
      description: editDesc.value.trim() || undefined,
    })
    toast.success(`Задача «${title}» обновлена`)
    cancelEdit()
  } catch (e) {
    notifyError(e, 'Не удалось сохранить изменения. Попробуйте ещё раз.')
  } finally {
    busyTaskId.value = null
  }
}

const cancelEdit = () => {
  editingId.value = null
  editTitle.value = ''
  editDesc.value = ''
}

const handleDelete = async (id: string) => {
  if (isTaskBusy(id) || isCreating.value) return
  if (!confirm('Удалить задачу?')) return

  const taskTitle = tasks.value.find((task) => task.id === id)?.title ?? 'Задача'

  try {
    await deleteTask(id)
    toast.success(`Задача «${taskTitle}» удалена`)
  } catch (e) {
    notifyError(e, 'Не удалось удалить задачу. Попробуйте ещё раз.')
  }
}

const handleToggle = async (id: string) => {
  if (isTaskBusy(id) || isCreating.value) return

  const task = tasks.value.find((item) => item.id === id)
  if (!task) return

  const wasCompleted = task.completed

  try {
    await toggleTask(id)
    toast.success(
      wasCompleted ? 'Задача возвращена в активные' : 'Задача отмечена как выполненная',
    )
  } catch (e) {
    notifyError(e, 'Не удалось изменить статус задачи. Попробуйте ещё раз.')
  }
}
</script>

<template>
  <div :class="$style.page">
    <AppContainer>
      <header :class="$style.header">
        <h1 :class="$style.title">Задачи</h1>
        <p :class="$style.subtitle">Полный CRUD через API (Prisma + PostgreSQL)</p>
      </header>

      <!-- Форма создания -->
      <section :class="$style.createSection">
        <h2 :class="$style.createTitle">Новая задача</h2>

        <form :class="$style.createForm" @submit.prevent="handleCreate">
          <div :class="$style.formRow">
            <input
              ref="titleInputRef"
              v-model="newTitle"
              :class="$style.input"
              type="text"
              placeholder="Название задачи *"
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
            placeholder="Описание (необязательно)"
            rows="2"
            :disabled="isCreating"
          />
        </form>
      </section>

      <!-- Состояния и список -->
      <section
        v-if="pending"
        :class="$style.skeletonList"
        aria-busy="true"
        aria-live="polite"
        aria-label="Загрузка задач"
      >
        <p :class="$style.skeletonLabel">Загрузка задач…</p>
        <div
          v-for="row in SKELETON_ROWS"
          :key="row"
          :class="$style.skeletonTask"
          aria-hidden="true"
        >
          <span :class="[$style.skeletonBlock, $style.skeletonCheckbox]" />
          <div :class="$style.skeletonBody">
            <span :class="[$style.skeletonBlock, $style.skeletonTitle]" />
            <span :class="[$style.skeletonBlock, $style.skeletonDesc]" />
          </div>
          <div :class="$style.skeletonActions">
            <span :class="[$style.skeletonBlock, $style.skeletonBtn]" />
            <span :class="[$style.skeletonBlock, $style.skeletonBtn]" />
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
        <h2 :class="$style.stateTitle">Не удалось загрузить задачи</h2>
        <p :class="$style.stateMessage">{{ loadErrorMessage }}</p>
        <button
          type="button"
          :class="[$style.btn, $style.btnPrimary]"
          @click="() => refresh()"
        >
          Повторить
        </button>
      </section>

      <div v-else>
        <section
          v-if="hasAnyTasks"
          :class="$style.toolbar"
          aria-label="Фильтр и сортировка задач"
        >
          <div :class="$style.filterGroup" role="group" aria-label="Фильтр по статусу">
            <button
              v-for="option in filterOptions"
              :key="option.value"
              type="button"
              :class="[
                $style.filterBtn,
                taskFilter === option.value && $style.filterBtnActive,
              ]"
              :aria-pressed="taskFilter === option.value"
              @click="taskFilter = option.value"
            >
              {{ option.label }}
            </button>
          </div>

          <label :class="$style.sortControl">
            <span :class="$style.sortLabel">Сортировка</span>
            <select v-model="taskSort" :class="$style.sortSelect">
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

        <ul v-if="filteredTasks.length" :class="$style.list">
          <li
            v-for="task in filteredTasks"
            :key="task.id"
            :class="$style.task"
            :aria-busy="isTaskBusy(task.id)"
          >
            <!-- Чекбокс toggle -->
            <input
              type="checkbox"
              :class="$style.checkbox"
              :checked="task.completed"
              :disabled="isTaskBusy(task.id) || isCreating"
              :aria-label="task.completed ? 'Отметить как активную' : 'Отметить как выполненную'"
              @change="handleToggle(task.id)"
            />

            <!-- Контент / режим редактирования -->
            <div :class="$style.taskContent">
              <template v-if="editingId === task.id">
                <input
                  v-model="editTitle"
                  :class="$style.input"
                  type="text"
                  placeholder="Название"
                  :disabled="isTaskBusy(task.id)"
                  @keyup.enter="saveEdit"
                  @keyup.esc="cancelEdit"
                />
                <textarea
                  v-model="editDesc"
                  :class="$style.textarea"
                  placeholder="Описание"
                  rows="2"
                  :disabled="isTaskBusy(task.id)"
                  @keyup.esc="cancelEdit"
                />
              </template>

              <template v-else>
                <p
                  :class="[
                    $style.taskTitle,
                    task.completed && $style.taskTitleDone,
                    (isTaskBusy(task.id) || isCreating) && $style.taskTitleDisabled,
                  ]"
                  title="Нажмите, чтобы редактировать"
                  @click="startEdit(task)"
                >
                  {{ task.title }}
                </p>
                <p v-if="task.description" :class="$style.taskDesc">
                  {{ task.description }}
                </p>
              </template>
            </div>

            <!-- Действия -->
            <div :class="$style.taskActions">
              <template v-if="editingId === task.id">
                <button
                  type="button"
                  :class="[$style.btn, $style.btnPrimary, $style.btnSm]"
                  :disabled="isTaskBusy(task.id)"
                  @click="saveEdit"
                >
                  {{ isTaskBusy(task.id) ? 'Сохранение…' : 'Сохранить' }}
                </button>
                <button
                  type="button"
                  :class="[$style.btn, $style.btnGhost, $style.btnSm]"
                  :disabled="isTaskBusy(task.id)"
                  @click="cancelEdit"
                >
                  Отмена
                </button>
              </template>

              <template v-else>
                <button
                  type="button"
                  :class="[$style.btn, $style.btnGhost, $style.btnSm]"
                  :disabled="isTaskBusy(task.id) || isCreating || isAnyTaskBusy"
                  @click="startEdit(task)"
                >
                  Изменить
                </button>
                <button
                  type="button"
                  :class="[$style.btn, $style.btnDanger, $style.btnSm]"
                  :disabled="isTaskBusy(task.id) || isCreating"
                  @click="handleDelete(task.id)"
                >
                  {{ isTaskBusy(task.id) ? 'Удаление…' : 'Удалить' }}
                </button>
              </template>
            </div>
          </li>
        </ul>

        <div v-else-if="isFilterEmpty" :class="$style.empty">
          <span :class="$style.stateIcon" aria-hidden="true">🔍</span>
          <h2 :class="$style.stateTitle">Нет задач по фильтру</h2>
          <p :class="$style.stateMessage">
            Попробуйте другой статус или сбросьте фильтр, чтобы увидеть все задачи.
          </p>
          <button type="button" :class="[$style.btn, $style.btnPrimary]" @click="resetFilter">
            Показать все
          </button>
        </div>

        <div v-else :class="$style.empty">
          <span :class="$style.stateIcon" aria-hidden="true">📋</span>
          <h2 :class="$style.stateTitle">Пока нет задач</h2>
          <p :class="$style.stateMessage">
            Список пуст — добавьте первую задачу и начните работу с Task Board.
          </p>
          <button
            type="button"
            :class="[$style.btn, $style.btnPrimary]"
            @click="focusCreateForm"
          >
            Создать задачу
          </button>
        </div>
      </div>
    </AppContainer>
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

.page {
  padding: var(--fs-space-3) var(--fs-space-2) var(--fs-space-4);
}

.header {
  margin-bottom: var(--fs-space-3);
}

.title {
  margin: 0 0 var(--fs-space-1);
  color: var(--fs-color-text);
  @include typo.fs-text-h1;
}

.subtitle {
  margin: 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}

.createSection {
  margin-bottom: var(--fs-space-4);
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-surface);
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

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--fs-space-2);
  margin-bottom: var(--fs-space-3);
  padding: var(--fs-space-2);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-surface);
}

.filterGroup {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-1);
}

.filterBtn {
  padding: fn.rem(6) fn.rem(12);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  background: var(--fs-color-bg);
  color: var(--fs-color-text-muted);
  @include typo.fs-text-tag;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    border-color: var(--fs-color-border);
    color: var(--fs-color-text);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.filterBtnActive {
  border-color: var(--fs-color-primary);
  background: rgb(235 153 20 / 0.1);
  color: var(--fs-color-primary-strong);
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

.task {
  display: flex;
  align-items: flex-start;
  gap: var(--fs-space-2);
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-bg);
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    border-color: var(--fs-color-border);
  }
}

.checkbox {
  width: fn.rem(20);
  height: fn.rem(20);
  margin-top: fn.rem(2);
  accent-color: var(--fs-color-primary);
  cursor: pointer;
  flex-shrink: 0;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.taskContent {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
}

.taskTitle {
  margin: 0;
  color: var(--fs-color-text);
  @include typo.fs-text-body;
  cursor: pointer;

  &:hover {
    color: var(--fs-color-primary-strong);
  }
}

.taskTitleDone {
  text-decoration: line-through;
  color: var(--fs-color-text-muted);
}

.taskTitleDisabled {
  cursor: not-allowed;
  pointer-events: none;
  opacity: 0.6;
}

.taskDesc {
  margin: 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
  font-size: 0.92em;
}

.taskActions {
  display: flex;
  gap: var(--fs-space-1);
  flex-shrink: 0;
  opacity: 0.6;
  transition: opacity 0.15s ease;

  .task:hover & {
    opacity: 1;
  }
}

/* Кнопки */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: fn.rem(8) fn.rem(14);
  border-radius: var(--fs-radius-md);
  border: 1px solid var(--fs-color-border-light);
  background: var(--fs-color-bg);
  color: var(--fs-color-text);
  @include typo.fs-text-header;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease,
    border-color 0.15s ease,
    transform 0.1s ease;

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

/* Состояния */
.skeletonList {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
}

.skeletonLabel {
  margin: 0 0 var(--fs-space-1);
  color: var(--fs-color-text-muted);
  @include typo.fs-text-tag;
}

.skeletonTask {
  display: flex;
  align-items: flex-start;
  gap: var(--fs-space-2);
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-bg);
}

.skeletonBlock {
  display: block;
  @include skeleton-surface;
}

.skeletonCheckbox {
  width: fn.rem(20);
  height: fn.rem(20);
  margin-top: fn.rem(2);
  border-radius: fn.rem(4);
  flex-shrink: 0;
}

.skeletonBody {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: var(--fs-space-1);
  min-width: 0;
}

.skeletonTitle {
  width: 68%;
  height: fn.rem(16);
}

.skeletonDesc {
  width: 42%;
  height: fn.rem(12);
}

.skeletonActions {
  display: flex;
  gap: var(--fs-space-1);
  flex-shrink: 0;
}

.skeletonBtn {
  width: fn.rem(72);
  height: fn.rem(32);
  border-radius: var(--fs-radius-md);
}

.empty,
.errorState {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--fs-space-2);
  padding: var(--fs-space-5) var(--fs-space-3);
  text-align: center;
  border-radius: var(--fs-radius-lg);
}

.empty {
  border: 1px dashed var(--fs-color-border-light);
  background: var(--fs-color-surface);
}

.errorState {
  border: 1px solid rgb(238 46 34 / 0.28);
  background: rgb(238 46 34 / 0.06);
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
