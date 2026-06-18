<script setup lang="ts">
import { getAuthActionError } from '#shared/utils/authActionError'
import { getSafeRedirectPath } from '#shared/utils/safeRedirect'

definePageMeta({
  layout: 'default',
  auth: { only: 'guest', redirectTo: '/tasks' },
})

useHead({
  title: 'Вход — Nuxt4_full',
})

const route = useRoute()
const signInEmail = useSignIn('email')

const email = ref('')
const password = ref('')
const formError = ref('')

const redirectTo = computed(() => getSafeRedirectPath(route.query.redirect))
const isPending = computed(() => signInEmail.status.value === 'pending')
const submitError = computed(() =>
  getAuthActionError(signInEmail.error.value, 'Не удалось войти. Проверьте email и пароль.'),
)

const handleSubmit = async () => {
  formError.value = ''

  const trimmedEmail = email.value.trim()
  if (!trimmedEmail || !password.value) {
    formError.value = 'Заполните email и пароль.'
    return
  }

  await signInEmail.execute(
    { email: trimmedEmail, password: password.value },
    { onSuccess: async () => { await navigateTo(redirectTo.value) } },
  )
}
</script>

<template>
  <AuthPageShell
    badge="Better Auth"
    title="Вход"
    lead="Email и пароль — cookie-сессия на 30 дней."
    title-id="login-title"
  >
    <form :class="$style.form" novalidate @submit.prevent="handleSubmit">
      <div :class="$style.field">
        <label :class="$style.label" for="login-email">Email</label>
        <input
          id="login-email"
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
        <label :class="$style.label" for="login-password">Пароль</label>
        <input
          id="login-password"
          v-model="password"
          :class="$style.input"
          type="password"
          name="password"
          autocomplete="current-password"
          minlength="8"
          required
          :disabled="isPending"
        />
      </div>

      <p v-if="formError || submitError" :class="$style.error" role="alert">
        {{ formError || submitError }}
      </p>

      <button :class="$style.submit" type="submit" :disabled="isPending">
        {{ isPending ? 'Вход…' : 'Войти' }}
      </button>
    </form>

    <template #footer>
      Нет аккаунта?
      <NuxtLink :class="$style.link" to="/register">Регистрация</NuxtLink>
    </template>
  </AuthPageShell>
</template>

<style module lang="scss">
@use '~/assets/styles/components/auth-form';
</style>
