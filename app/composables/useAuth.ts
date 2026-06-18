/**
 * Обёртка над `useUserSession()` + хелперы ролей (Неделя 4).
 * Sign-in/up — через `useSignIn('email')` / `useSignUp('email')` на страницах auth.
 */
export function useAuth() {
  const { user, loggedIn, ready, signOut } = useUserSession()

  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  return {
    user,
    loggedIn,
    ready,
    isAdmin,
    signOut,
  }
}
