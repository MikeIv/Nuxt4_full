<script setup lang="ts">
import { getAuthActionError } from '#shared/utils/authActionError'
import { getSafeRedirectPath } from '#shared/utils/safeRedirect'

definePageMeta({
  layout: 'default',
  auth: { only: 'guest', redirectTo: '/tasks' },
})

useHead({
  title: 'Регистрация — Nuxt4_full',
})

const route = useRoute()
const signUpEmail = useSignUp('email')

const name = ref('')
const email = ref('')
const password = ref('')
const formError = ref('')

const redirectTo = computed(() => getSafeRedirectPath(route.query.redirect))
const isPending = computed(() => signUpEmail.status.value === 'pending')
const submitError = computed(() =>
  getAuthActionError(signUpEmail.error.value, 'Не удалось зарегистрироваться.'),
)

const handleSubmit = async () => {
  formError.value = ''

  const trimmedName = name.value.trim()
  const trimmedEmail = email.value.trim()

  if (!trimmedName || !trimmedEmail || !password.value) {
    formError.value = 'Заполните все поля.'
    return
  }

  if (password.value.length < 8) {
    formError.value = 'Пароль — минимум 8 символов.'
    return
  }

  await signUpEmail.execute(
    { name: trimmedName, email: trimmedEmail, password: password.value },
    { onSuccess: async () => { await navigateTo(redirectTo.value) } },
  )
}
</script>

<template>
  <AuthPageShell
    badge="Task Board"
    title="Регистрация"
    lead="Создайте аккаунт — после входа доступны ваши задачи."
    title-id="register-title"
  >
    <form :class="$style.form" novalidate @submit.prevent="handleSubmit">
      <div :class="$style.field">
        <label :class="$style.label" for="register-name">Имя</label>
        <input
          id="register-name"
          v-model="name"
          :class="$style.input"
          type="text"
          name="name"
          autocomplete="name"
          required
          :disabled="isPending"
        />
      </div>

      <div :class="$style.field">
        <label :class="$style.label" for="register-email">Email</label>
        <input
          id="register-email"
          v-model="email"
          :class="$style.input"
          type="email"
          name="email"
          autocomplete="email"
          required
          :disabled="isPending"
        />
      </div>

      <div :class="$style.field">
        <label :class="$style.label" for="register-password">Пароль</label>
        <input
          id="register-password"
          v-model="password"
          :class="$style.input"
          type="password"
          name="password"
          autocomplete="new-password"
          minlength="8"
          required
          :disabled="isPending"
        />
      </div>

      <p v-if="formError || submitError" :class="$style.error" role="alert">
        {{ formError || submitError }}
      </p>

      <button :class="$style.submit" type="submit" :disabled="isPending">
        {{ isPending ? 'Создание…' : 'Зарегистрироваться' }}
      </button>
    </form>

    <template #footer>
      Уже есть аккаунт?
      <NuxtLink :class="$style.link" to="/login">Войти</NuxtLink>
    </template>
  </AuthPageShell>
</template>

<style module lang="scss">
@use '~/assets/styles/components/auth-form';
</style>
