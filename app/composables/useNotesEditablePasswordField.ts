export function useNotesEditablePasswordField(fallback?: string) {
  const toast = useAppToast()
  const passwordInputRef = ref<HTMLInputElement | null>(null)
  const { savedPassword, persistPassword } = useNotesDbPassword(fallback)

  const password = ref(savedPassword.value)
  const isEditing = ref(false)

  watch(savedPassword, (value) => {
    if (!isEditing.value) {
      password.value = value
    }
  })

  const hasChanges = computed(() => password.value !== savedPassword.value)
  const showCheck = computed(() => isEditing.value && hasChanges.value)

  const cancelEditing = () => {
    password.value = savedPassword.value
    isEditing.value = false
  }

  const confirmEdit = async () => {
    try {
      await persistPassword(password.value)
      isEditing.value = false
      toast.success('Пароль сохранён')
    } catch {
      toast.error('Не удалось сохранить пароль')
    }
  }

  const startEditing = async () => {
    isEditing.value = true
    await nextTick()
    passwordInputRef.value?.focus()
    passwordInputRef.value?.select()
  }

  const handleAction = () => {
    if (showCheck.value) {
      void confirmEdit()
      return
    }

    if (isEditing.value) {
      cancelEditing()
      return
    }

    void startEditing()
  }

  const handleInputKeydown = async (event: KeyboardEvent) => {
    if (event.key === 'Enter' && showCheck.value) {
      event.preventDefault()
      await confirmEdit()
      return
    }

    if (event.key === 'Escape' && isEditing.value) {
      event.preventDefault()
      cancelEditing()
    }
  }

  return {
    savedPassword,
    password,
    passwordInputRef,
    isEditing,
    showCheck,
    handleAction,
    handleInputKeydown,
  }
}
