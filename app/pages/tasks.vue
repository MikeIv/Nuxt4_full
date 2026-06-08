<script setup lang="ts">
import type { Task } from '#shared/types/tasks'

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
} = useTasks()

const newTitle = ref('')
const newDesc = ref('')

const editingId = ref<string | null>(null)
const editTitle = ref('')
const editDesc = ref('')

// tasks from useTasks is already a readonly Ref<Task[]> (useAsyncData with default: [])
// No extra computed wrapper needed.

const handleCreate = async () => {
  const title = newTitle.value.trim()
  if (!title) return

  try {
    await createTask({
      title,
      description: newDesc.value.trim() || undefined,
    })
    // refresh() уже выполняется внутри createTask в useTasks()
    newTitle.value = ''
    newDesc.value = ''
  } catch (e) {
    // Ошибка будет обработана на уровне UI позже (toast / error state)
    console.error('Create task failed', e)
  }
}

const startEdit = (task: Task) => {
  editingId.value = task.id
  editTitle.value = task.title
  editDesc.value = task.description ?? ''
}

const saveEdit = async () => {
  const id = editingId.value
  if (!id) return

  const title = editTitle.value.trim()
  if (!title) {
    cancelEdit()
    return
  }

  try {
    await updateTask(id, {
      title,
      description: editDesc.value.trim() || undefined,
    })
    // refresh() уже выполняется внутри updateTask в useTasks()
    cancelEdit()
  } catch (e) {
    console.error('Update task failed', e)
  }
}

const cancelEdit = () => {
  editingId.value = null
  editTitle.value = ''
  editDesc.value = ''
}

const handleDelete = async (id: string) => {
  // Простое подтверждение для учебного проекта
  if (!confirm('Удалить задачу?')) return

  try {
    await deleteTask(id)
  } catch (e) {
    console.error('Delete task failed', e)
  }
}
</script>

<template>
  <div :class="$style.page">
    <div :class="$style.shell">
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
              v-model="newTitle"
              :class="$style.input"
              type="text"
              placeholder="Название задачи *"
              required
              autocomplete="off"
            />

            <button
              type="submit"
              :class="[$style.btn, $style.btnPrimary]"
              :disabled="!newTitle.trim()"
            >
              Добавить
            </button>
          </div>

          <textarea
            v-model="newDesc"
            :class="$style.textarea"
            placeholder="Описание (необязательно)"
            rows="2"
          />
        </form>
      </section>

      <!-- Состояния и список -->
      <div v-if="pending" :class="$style.state">
        Загрузка задач…
      </div>

      <div v-else-if="error" :class="$style.errorState">
        <p>Не удалось загрузить задачи.</p>
        <button :class="[$style.btn, $style.btnGhost]" @click="() => refresh()">
          Повторить
        </button>
      </div>

      <div v-else>
        <!--
          TODO (Дни 6-7 / рефакторинг):
          Вынести карточку задачи + инлайн-редактирование в отдельный компонент TaskItem.vue.
          Сейчас инлайн-редактирование реализовано прямо в списке для скорости Дня 2.
        -->
        <ul v-if="tasks.length" :class="$style.list">
          <li
            v-for="task in tasks"
            :key="task.id"
            :class="$style.task"
          >
            <!-- Чекбокс toggle -->
            <input
              type="checkbox"
              :class="$style.checkbox"
              :checked="task.completed"
              :aria-label="task.completed ? 'Отметить как активную' : 'Отметить как выполненную'"
              @change="toggleTask(task.id)"
            />

            <!-- Контент / режим редактирования -->
            <div :class="$style.taskContent">
              <template v-if="editingId === task.id">
                <input
                  v-model="editTitle"
                  :class="$style.input"
                  type="text"
                  placeholder="Название"
                  @keyup.enter="saveEdit"
                  @keyup.esc="cancelEdit"
                />
                <textarea
                  v-model="editDesc"
                  :class="$style.textarea"
                  placeholder="Описание"
                  rows="2"
                  @keyup.esc="cancelEdit"
                />
              </template>

              <template v-else>
                <p
                  :class="[$style.taskTitle, task.completed && $style.taskTitleDone]"
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
                  @click="saveEdit"
                >
                  Сохранить
                </button>
                <button
                  type="button"
                  :class="[$style.btn, $style.btnGhost, $style.btnSm]"
                  @click="cancelEdit"
                >
                  Отмена
                </button>
              </template>

              <template v-else>
                <button
                  type="button"
                  :class="[$style.btn, $style.btnGhost, $style.btnSm]"
                  @click="startEdit(task)"
                >
                  Изменить
                </button>
                <button
                  type="button"
                  :class="[$style.btn, $style.btnDanger, $style.btnSm]"
                  @click="handleDelete(task.id)"
                >
                  Удалить
                </button>
              </template>
            </div>
          </li>
        </ul>

        <div v-else :class="$style.empty">
          <p>Пока нет задач</p>
          <p :class="$style.emptyHint">Создайте первую задачу в форме выше</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as fn;
@use '~/assets/styles/tools/typography' as typo;
@use '~/assets/styles/tools/margin' as margin;

.page {
  padding: var(--fs-space-3) var(--fs-space-2) var(--fs-space-4);
}

.shell {
  width: min(100%, fn.rem(960));
  margin-inline: auto;
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
}

.textarea {
  resize: vertical;
  min-height: fn.rem(60);
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
.state,
.empty,
.errorState {
  padding: var(--fs-space-4);
  text-align: center;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
  border: 1px dashed var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
}

.emptyHint {
  margin-top: var(--fs-space-1);
  font-size: 0.92em;
}

.errorState {
  color: var(--fs-color-error);
  border-style: solid;
  border-color: rgb(238 46 34 / 0.3);
}
</style>
