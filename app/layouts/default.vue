<script setup lang="ts"></script>

<template>
  <div :class="$style.root">
    <slot />
  </div>
</template>

<style module lang="scss">
.root {
  min-height: 100dvh;
}
</style>
