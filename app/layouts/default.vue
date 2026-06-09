<script setup lang="ts"></script>

<template>
  <div :class="$style.layout">
    <AppNav />
    <main :class="$style.main">
      <slot />
    </main>
    <UiToastHost />
  </div>
</template>

<style module lang="scss">
.layout {
  min-height: 100dvh;
  background-color: var(--fs-color-bg);
}

.main {
  min-height: calc(100dvh - 3.5rem);
}
</style>
