<script setup lang="ts">
defineProps<{
  badge: string
  title: string
  lead: string
  titleId: string
}>()
</script>

<template>
  <AppContainer :class="$style.page">
    <section :class="$style.card" :aria-labelledby="titleId">
      <header :class="$style.header">
        <p :class="$style.badge">{{ badge }}</p>
        <h1 :id="titleId" :class="$style.title">{{ title }}</h1>
        <p :class="$style.lead">{{ lead }}</p>
      </header>

      <slot />

      <p v-if="$slots.footer" :class="$style.footer">
        <slot name="footer" />
      </p>
    </section>
  </AppContainer>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as fn;
@use '~/assets/styles/tools/typography' as typo;

.page {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--fs-space-4) var(--fs-space-2);
  min-height: calc(100dvh - 3.5rem);
}

.card {
  width: min(100%, fn.rem(420));
  padding: var(--fs-space-4);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-surface-elevated, #fff);
  box-shadow: 0 fn.rem(16) fn.rem(40) rgb(15 23 42 / 0.06);
}

.header {
  margin-bottom: var(--fs-space-4);
}

.badge {
  margin: 0 0 var(--fs-space-1);
  color: var(--fs-color-primary-strong);
  font-size: fn.rem(12);
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.title {
  margin: 0;
  @include typo.fs-text-h2;
}

.lead {
  margin: var(--fs-space-1) 0 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}

.footer {
  margin: var(--fs-space-4) 0 0;
  color: var(--fs-color-text-muted);
  text-align: center;
  @include typo.fs-text-body;
}
</style>
