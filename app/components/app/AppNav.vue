<script setup lang="ts">
const navItems = [
  { to: '/', label: 'Главная' },
  { to: '/tasks', label: 'Задачи' },
  { to: '/roadmap', label: 'Roadmap' },
] as const
</script>

<template>
  <header :class="$style.root">
    <div :class="$style.inner">
      <NuxtLink to="/" :class="$style.brand">
        <span :class="$style.brandMark" aria-hidden="true" />
        <span :class="$style.brandText">Nuxt4_full</span>
      </NuxtLink>

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
    </div>
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
  width: min(100%, fn.rem(960));
  margin-inline: auto;
  padding: var(--fs-space-2);
}

.brand {
  display: inline-flex;
  gap: fn.rem(10);
  align-items: center;
  min-width: 0;
  color: var(--fs-color-text);

  &:focus-visible {
    border-radius: var(--fs-radius-sm);
    outline: 2px solid var(--fs-color-primary);
    outline-offset: 2px;
  }
}

.brandMark {
  width: fn.rem(12);
  height: fn.rem(12);
  border-radius: 999px;
  background: var(--fs-gradient-auth);
  box-shadow: var(--fs-shadow-glow);
}

.brandText {
  @include typo.fs-text-h4;
}

.nav {
  display: flex;
  gap: fn.rem(8);
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
</style>
