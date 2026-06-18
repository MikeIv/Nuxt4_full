<script setup lang="ts">
const navItems = [
  { to: '/', label: 'Главная' },
  { to: '/tasks', label: 'Задачи' },
  { to: '/notes', label: 'Заметки' },
  { to: '/roadmap', label: 'Roadmap' },
] as const

const { user, loggedIn, ready, signOut, isAdmin } = useAuth()

const isSigningOut = ref(false)

const displayName = computed(() => user.value?.name?.trim() || user.value?.email || 'Пользователь')

const handleSignOut = async () => {
  if (isSigningOut.value) return

  isSigningOut.value = true
  try {
    await signOut({ onSuccess: async () => { await navigateTo('/login') } })
  } finally {
    isSigningOut.value = false
  }
}
</script>

<template>
  <header :class="$style.root">
    <AppContainer :class="$style.inner">
      <NuxtLink to="/" :class="$style.brand">
        <AppLogoFull />
      </NuxtLink>

      <div :class="$style.right">
        <nav :class="$style.nav" aria-label="Основная навигация">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :class="$style.link"
            active-class=""
          >
            <span
              :class="[$style.linkInner, $route.path === item.to && $style.linkActive]"
            >
              {{ item.label }}
            </span>
          </NuxtLink>
        </nav>

        <div v-if="ready" :class="$style.auth">
          <template v-if="loggedIn">
            <span :class="$style.userMeta">
              <span :class="$style.userName">{{ displayName }}</span>
              <span v-if="isAdmin" :class="$style.roleBadge">ADMIN</span>
            </span>
            <button
              type="button"
              :class="$style.authBtn"
              :disabled="isSigningOut"
              @click="handleSignOut"
            >
              {{ isSigningOut ? 'Выход…' : 'Выйти' }}
            </button>
          </template>

          <template v-else>
            <NuxtLink to="/login" :class="$style.authLink">Вход</NuxtLink>
            <NuxtLink to="/register" :class="[$style.authLink, $style.authLinkPrimary]">
              Регистрация
            </NuxtLink>
          </template>
        </div>
      </div>
    </AppContainer>
  </header>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as fn;
@use '~/assets/styles/tools/typography' as typo;

.root {
  position: sticky;
  top: 0;
  z-index: 10;
  border-bottom: 1px solid var(--fs-color-border-light);
  background: rgb(255 255 255 / 0.86);
  backdrop-filter: blur(12px);
}

.inner {
  display: flex;
  gap: var(--fs-space-2);
  align-items: center;
  justify-content: space-between;
  padding: var(--fs-space-2);
}

.brand {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  flex-shrink: 0;

  &:focus-visible {
    border-radius: var(--fs-radius-sm);
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.right {
  display: flex;
  gap: fn.rem(12);
  align-items: center;
  min-width: 0;
}

.nav {
  display: flex;
  gap: fn.rem(8);
  flex-wrap: wrap;
}

.link {
  color: inherit;
}

.linkInner {
  display: inline-flex;
  padding: fn.rem(8) fn.rem(14);
  border: 1px solid transparent;
  border-radius: var(--fs-radius-md);
  color: var(--fs-color-text-muted);
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;
  @include typo.fs-text-header;

  &:hover {
    background: var(--fs-color-surface);
    color: var(--fs-color-text);
  }
}

.linkActive {
  border-color: rgb(235 153 20 / 0.28);
  background: rgb(235 153 20 / 0.08);
  color: var(--fs-color-primary-strong);
}

.auth {
  display: flex;
  gap: fn.rem(8);
  align-items: center;
  flex-shrink: 0;
}

.userMeta {
  display: none;
  align-items: center;
  gap: fn.rem(6);
  max-width: fn.rem(180);

  @media (width >= 768px) {
    display: inline-flex;
  }
}

.userName {
  overflow: hidden;
  color: var(--fs-color-text-muted);
  font-size: fn.rem(13);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.roleBadge {
  padding: fn.rem(2) fn.rem(6);
  border-radius: var(--fs-radius-sm);
  background: rgb(235 153 20 / 0.12);
  color: var(--fs-color-primary-strong);
  font-size: fn.rem(10);
  font-weight: 700;
  letter-spacing: 0.04em;
}

.authBtn,
.authLink {
  display: inline-flex;
  align-items: center;
  padding: fn.rem(8) fn.rem(12);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-md);
  background: transparent;
  color: var(--fs-color-text-muted);
  font: inherit;
  font-size: fn.rem(13);
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    border-color 0.2s ease;

  &:hover:not(:disabled) {
    background: var(--fs-color-surface);
    color: var(--fs-color-text);
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
}

.authLinkPrimary {
  border-color: rgb(235 153 20 / 0.35);
  background: rgb(235 153 20 / 0.08);
  color: var(--fs-color-primary-strong);
}
</style>
