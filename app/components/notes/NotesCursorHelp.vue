<script setup lang="ts">
import { CURSOR_HELP_CARDS } from '#shared/constants/cursorHelp'
</script>

<template>
  <NotesHelpArticle
    title="Cursor справка"
    hint="Команды, шаблоны и workflow агента — раскройте карточку для подробностей"
    panel-id="cursor-help-detail"
    :cards="CURSOR_HELP_CARDS"
  />
</template>
