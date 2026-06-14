<script setup lang="ts">
import type { UiTabItem } from '~/components/ui/UiTabs.vue'
import {
  isProtectedNotesDocument,
  isNotesDocumentVisible,
  NOTE_LINKS,
  NOTES_DOCUMENTS,
  USEFUL_ITEMS,
  type NotesDocumentId,
} from '#shared/constants/notesContent'
import { formatApiError } from '#shared/utils/formatApiError'

definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Заметки — Nuxt4_full',
})

type NotesTab = 'documents' | 'links' | 'useful'

const SERVER_ACCESS_ID: NotesDocumentId = 'server-access'

const activeTab = ref<NotesTab>('documents')
const activeDocument = ref<NotesDocumentId>('project-docs')

const visibleDocuments = computed(() => NOTES_DOCUMENTS.filter(isNotesDocumentVisible))

if (process.env.NODE_ENV === 'production' && activeDocument.value === SERVER_ACCESS_ID) {
  activeDocument.value = 'project-docs'
}

const {
  isConfigured,
  isUnlocked,
  refresh: refreshAccessStatus,
  setupPassword,
  unlock,
  forgotPassword,
} = useNotesAccess()

const toast = useToast()
const accessDialogOpen = ref(false)
const accessDialogMode = ref<'setup' | 'unlock'>('unlock')
const accessDialogLoading = ref(false)
const pendingDocument = ref<NotesDocumentId | null>(null)

const tabItems: UiTabItem[] = [
  { value: 'documents', label: 'Документы' },
  { value: 'links', label: 'Ссылки' },
  { value: 'useful', label: 'Полезное' },
]

const openAccessDialog = (mode: 'setup' | 'unlock', docId: NotesDocumentId) => {
  pendingDocument.value = docId
  accessDialogMode.value = mode
  accessDialogOpen.value = true
}

const selectDocument = async (docId: NotesDocumentId) => {
  const doc = NOTES_DOCUMENTS.find((item) => item.id === docId)
  if (!doc || !isNotesDocumentVisible(doc)) {
    return
  }

  if (isProtectedNotesDocument(doc)) {
    await refreshAccessStatus()

    if (isUnlocked.value) {
      activeDocument.value = docId
      return
    }

    openAccessDialog(isConfigured.value ? 'unlock' : 'setup', docId)
    return
  }

  activeDocument.value = docId
}

const completeAccess = async () => {
  const docId = pendingDocument.value
  accessDialogOpen.value = false
  await refreshAccessStatus()

  if (docId) {
    activeDocument.value = docId
  }

  pendingDocument.value = null
}

const handleAccessClose = () => {
  accessDialogOpen.value = false
  pendingDocument.value = null
}

const handleAccessAction = async (
  action: () => Promise<unknown>,
  successMessage: string,
  errorMessage: string,
  complete = false,
) => {
  accessDialogLoading.value = true

  try {
    await action()
    toast.success(successMessage)
    if (complete) {
      await completeAccess()
    }
  } catch (error) {
    toast.error(formatApiError(error, errorMessage))
  } finally {
    accessDialogLoading.value = false
  }
}

const handleSetupSubmit = (password: string, confirmPassword: string) =>
  handleAccessAction(
    () => setupPassword({ password, confirmPassword }),
    'Пароль установлен',
    'Не удалось установить пароль',
    true,
  )

const handleUnlockSubmit = (password: string) =>
  handleAccessAction(
    () => unlock({ password }),
    'Доступ открыт',
    'Неверный пароль',
    true,
  )

const handleForgotPassword = () =>
  handleAccessAction(
    forgotPassword,
    'Пароль отправлен на gagarahome@yandex.ru',
    'Не удалось отправить пароль на почту',
  )
</script>

<template>
  <div :class="$style.page">
    <AppContainer>
      <header :class="$style.header">
        <h1 :class="$style.title">Заметки</h1>
        <p :class="$style.subtitle">
          Документы, ссылки и полезные материалы по проекту
        </p>
      </header>

      <UiTabs
        v-model="activeTab"
        :items="tabItems"
        aria-label="Разделы заметок"
        :class="$style.tabs"
      />

      <div
        :id="`panel-${activeTab}`"
        role="tabpanel"
        :aria-labelledby="`tab-${activeTab}`"
        :class="$style.panel"
      >
        <!-- Документы -->
        <section v-if="activeTab === 'documents'" :class="$style.section">
          <div :class="$style.docLayout">
            <aside :class="$style.docNav" aria-label="Подразделы документов">
              <p :class="$style.docNavTitle">Подразделы</p>
              <ul :class="$style.docNavList">
                <li v-for="doc in visibleDocuments" :key="doc.id">
                  <button
                    type="button"
                    :class="[
                      $style.docNavBtn,
                      activeDocument === doc.id && $style.docNavBtnActive,
                    ]"
                    :aria-current="activeDocument === doc.id ? 'true' : undefined"
                    @click="selectDocument(doc.id)"
                  >
                    <span :class="$style.docNavBtnTitle">{{ doc.title }}</span>
                    <span :class="$style.docNavBtnDesc">{{ doc.description }}</span>
                  </button>
                </li>
              </ul>
            </aside>

            <div :class="$style.docContent">
              <NotesProjectDocs v-if="activeDocument === 'project-docs'" />
              <NotesDeploymentCheatsheet v-else-if="activeDocument === 'deployment-cheatsheet'" />
              <NotesServerAccess v-else-if="activeDocument === SERVER_ACCESS_ID && isUnlocked" />
              <p
                v-else-if="activeDocument === SERVER_ACCESS_ID"
                :class="$style.lockedHint"
              >
                Раздел «Общие настройки» закрыт. Нажмите подраздел слева и введите пароль.
              </p>
            </div>
          </div>

          <NotesAccessDialog
            :open="accessDialogOpen"
            :mode="accessDialogMode"
            :loading="accessDialogLoading"
            @close="handleAccessClose"
            @submit-setup="handleSetupSubmit"
            @submit-unlock="handleUnlockSubmit"
            @forgot-password="handleForgotPassword"
          />
        </section>

        <!-- Ссылки -->
        <section v-else-if="activeTab === 'links'" :class="$style.section">
          <ul :class="$style.linkList">
            <li v-for="link in NOTE_LINKS" :key="link.href">
              <a
                :href="link.href"
                :class="$style.linkCard"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span :class="$style.linkTitle">{{ link.title }}</span>
                <span :class="$style.linkDesc">{{ link.description }}</span>
                <span :class="$style.linkExternal" aria-hidden="true">↗</span>
              </a>
            </li>
          </ul>
        </section>

        <!-- Полезное -->
        <section v-else :class="$style.section">
          <ul :class="$style.usefulList">
            <li
              v-for="item in USEFUL_ITEMS"
              :key="item.title"
              :class="$style.usefulItem"
            >
              <h3 :class="$style.usefulTitle">{{ item.title }}</h3>
              <p :class="$style.usefulDesc">{{ item.description }}</p>
            </li>
          </ul>
        </section>
      </div>
    </AppContainer>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as fn;
@use '~/assets/styles/tools/typography' as typo;

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

.tabs {
  margin-bottom: var(--fs-space-3);
}

.panel {
  min-height: fn.rem(200);
}

.section {
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-surface);
}

.docLayout {
  display: grid;
  grid-template-columns: min(fn.rem(240), 100%) 1fr;
  gap: var(--fs-space-3);
  align-items: start;

  @media (width <= fn.rem(768)) {
    grid-template-columns: 1fr;
  }
}

.docNav {
  position: sticky;
  top: fn.rem(72);
  padding: var(--fs-space-2);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  background: var(--fs-color-bg);
}

.docNavTitle {
  margin: 0 0 var(--fs-space-2);
  color: var(--fs-color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  @include typo.fs-text-tag;
}

.docNavList {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-1);
}

.docNavBtn {
  display: flex;
  flex-direction: column;
  gap: fn.rem(4);
  width: 100%;
  padding: var(--fs-space-2);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  background: var(--fs-color-surface);
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;

  &:hover {
    border-color: var(--fs-color-border);
    background: var(--fs-color-bg);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.docNavBtnActive {
  border-color: rgb(235 153 20 / 0.32);
  background: rgb(235 153 20 / 0.08);
}

.docNavBtnTitle {
  color: var(--fs-color-text);
  @include typo.fs-text-header;
}

.docNavBtnDesc {
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
  font-size: 0.88em;
}

.docContent {
  min-width: 0;
}

.lockedHint {
  margin: 0;
  padding: var(--fs-space-3);
  border: 1px dashed var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}

.linkList,
.usefulList {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-2);
}

.linkCard {
  display: grid;
  grid-template-columns: 1fr auto;
  grid-template-rows: auto auto;
  gap: fn.rem(4) var(--fs-space-2);
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  background: var(--fs-color-bg);
  color: inherit;
  text-decoration: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    border-color: var(--fs-color-border);
    box-shadow: var(--fs-shadow-sm);
  }

  &:focus-visible {
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.linkTitle {
  grid-column: 1;
  color: var(--fs-color-text);
  @include typo.fs-text-header;
}

.linkDesc {
  grid-column: 1;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
  font-size: 0.92em;
}

.linkExternal {
  grid-row: 1 / span 2;
  grid-column: 2;
  align-self: center;
  color: var(--fs-color-primary-strong);
  @include typo.fs-text-header;
}

.usefulItem {
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  background: var(--fs-color-bg);
}

.usefulTitle {
  margin: 0 0 var(--fs-space-1);
  color: var(--fs-color-text);
  @include typo.fs-text-header;
}

.usefulDesc {
  margin: 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}
</style>
