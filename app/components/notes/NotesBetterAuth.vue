<script setup lang="ts">
import { BETTER_AUTH_HELP_CARDS } from '#shared/constants/betterAuthHelp'
</script>

<template>
  <NotesHelpArticle
    title="Авторизация Better Auth"
    hint="Модуль, API, защита маршрутов, роли USER/ADMIN и dev-аккаунты — раскройте карточку"
    panel-id="better-auth-help-detail"
    :cards="BETTER_AUTH_HELP_CARDS"
  />
</template>
