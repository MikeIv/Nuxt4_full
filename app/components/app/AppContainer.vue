<template>
  <div :class="$style.root">
    <slot />
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/variables/resolutions' as bp;

.root {
  width: min(100%, bp.$desktopMedium);
  margin-inline: auto;
}
</style>
