<script setup lang="ts">
const sshCommand = 'ssh root@80.78.247.58'
</script>

<template>
  <article :class="$style.article">
    <header :class="$style.hero">
      <p :class="$style.kicker">Защищённый раздел</p>
      <h2 :class="$style.title">Серверные доступы</h2>
      <p :class="$style.lead">
        Здесь хранятся пароли и строки подключения для env, PostgreSQL и psql. Добавляйте
        чувствительные данные по мере необходимости.
      </p>
    </header>

    <section :class="$style.section">
      <h3 :class="$style.sectionTitle">SSH</h3>
      <NotesCodeBlock :code="sshCommand" label="Подключение к серверу" />
    </section>

    <section :class="$style.section">
      <h3 :class="$style.sectionTitle">SQL</h3>
      <NotesSqlPasswordBlock />
    </section>

    <section :class="$style.section">
      <h3 :class="$style.sectionTitle">DATABASE_URL (.env)</h3>
      <p :class="$style.placeholder">
        Добавьте строку подключения PostgreSQL для production.
      </p>
      <NotesCodeBlock
        code="# postgresql://USER:PASSWORD@host:5432/DBNAME"
        label="Шаблон DATABASE_URL"
      />
    </section>

    <section :class="$style.section">
      <h3 :class="$style.sectionTitle">psql</h3>
      <p :class="$style.placeholder">Команда входа в psql на сервере.</p>
      <NotesCodeBlock
        code="# psql -U postgres -d nuxt4full"
        label="Шаблон psql"
      />
    </section>
  </article>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as fn;
@use '~/assets/styles/tools/typography' as typo;

.article {
  display: flex;
  flex-direction: column;
  gap: var(--fs-space-3);
}

.hero {
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: linear-gradient(
    135deg,
    rgb(255 255 255 / 0.95) 0%,
    rgb(23 53 87 / 0.06) 100%
  );
  box-shadow: var(--fs-shadow-sm);
}

.kicker {
  margin: 0;
  color: var(--fs-color-primary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  @include typo.fs-text-tag;
}

.title {
  margin: var(--fs-space-1) 0;
  color: var(--fs-color-primary-strong);
  @include typo.fs-text-h3;
}

.lead {
  margin: 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}

.section {
  padding: var(--fs-space-3);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-lg);
  background: var(--fs-color-bg);
}

.sectionTitle {
  margin: 0 0 var(--fs-space-2);
  color: var(--fs-color-text);
  @include typo.fs-text-h4;
}

.placeholder {
  margin: 0 0 var(--fs-space-2);
  color: var(--fs-color-text-muted);
  @include typo.fs-text-body;
}
</style>
