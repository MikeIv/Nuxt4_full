<script setup lang="ts">
import type { UiTabItem } from '~/components/ui/UiTabs.vue'

useHead({
  title: 'Roadmap — прогресс обучения',
})

const { weeks, isDone, toggle, weekStats, overallStats } = useRoadmapProgress()

const activeWeekId = ref('1')

const tabItems = computed<UiTabItem[]>(() =>
  weeks.map((week) => {
    const stats = weekStats(week)

    const complete = stats.total > 0 && stats.percent === 100

    return {
      value: String(week.id),
      label: `Нед ${week.id}`,
      badge: stats.total > 0 ? `${stats.percent}%` : undefined,
      complete,
    }
  }),
)

const activeWeek = computed(() => weeks.find((week) => String(week.id) === activeWeekId.value))

const overall = computed(() => overallStats())
const activeWeekProgress = computed(() => {
  const week = activeWeek.value
  return week ? weekStats(week) : { done: 0, total: 0, percent: 0 }
})
</script>

<template>
  <div :class="$style.page">
    <div :class="$style.backdrop" aria-hidden="true" />

    <div :class="$style.shell">
      <header :class="$style.hero">
        <p :class="$style.badge">12-недельный план</p>
        <h1 :class="$style.title">Roadmap — прогресс</h1>
        <p :class="$style.lead">
          Отмечай выполненные пункты по неделям. Пункты с ✅ в roadmap засчитываются автоматически;
          снятие галочки сохраняется локально в браузере.
        </p>

        <div :class="$style.stats">
          <div :class="$style.stat">
            <span :class="$style.statLabel">Всего</span>
            <span :class="$style.statValue">{{ overall.done }} / {{ overall.total }}</span>
          </div>
          <div :class="$style.statDivider" aria-hidden="true" />
          <div :class="$style.stat">
            <span :class="$style.statLabel">Текущая неделя</span>
            <span :class="$style.statValue">
              {{ activeWeekProgress.done }} / {{ activeWeekProgress.total }}
            </span>
          </div>
          <div :class="$style.statDivider" aria-hidden="true" />
          <div :class="$style.stat">
            <span :class="$style.statLabel">Общий прогресс</span>
            <span :class="$style.statValue">{{ overall.percent }}%</span>
          </div>
        </div>
      </header>

      <UiTabs
        v-model="activeWeekId"
        :items="tabItems"
        aria-label="Недели roadmap"
        :class="$style.tabs"
      />

      <div
        v-if="activeWeek"
        :id="`panel-${activeWeekId}`"
        role="tabpanel"
        :aria-labelledby="`tab-${activeWeekId}`"
        :class="$style.panelWrap"
      >
        <RoadmapWeekPanel :week="activeWeek" :is-done="isDone" @toggle="toggle" />
      </div>
    </div>
  </div>
</template>

<style module lang="scss">
@use '~/assets/styles/tools/functions' as fn;
@use '~/assets/styles/tools/typography' as typo;
@use '~/assets/styles/tools/margin' as margin;

.page {
  position: relative;
  min-height: calc(100dvh - fn.rem(56));
  padding: var(--fs-space-3) var(--fs-space-2) var(--fs-space-4);
  overflow: hidden;
}

.backdrop {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 10% 10%, rgb(23 53 87 / 0.1), transparent 40%),
    radial-gradient(circle at 90% 20%, rgb(235 153 20 / 0.12), transparent 38%),
    linear-gradient(180deg, var(--fs-figma-metallic-gradient-grey-1) 0%, var(--fs-color-bg) 50%);
  pointer-events: none;
}

.shell {
  position: relative;
  z-index: 1;
  width: min(100%, fn.rem(960));
  margin-inline: auto;
}

.hero {
  padding: var(--fs-space-4);
  border: 1px solid var(--fs-color-border-light);
  border-radius: var(--fs-radius-xl);
  background: rgb(255 255 255 / 0.82);
  box-shadow: var(--fs-shadow-md);
  backdrop-filter: blur(12px);
}

.badge {
  display: inline-flex;
  margin: 0;
  padding: fn.rem(6) fn.rem(12);
  border-radius: 999px;
  background: var(--fs-color-primary-strong);
  color: var(--fs-figma-achromatic-white);
  @include typo.fs-text-tag;
}

.title {
  margin: var(--fs-margin-title-subtitle-block) 0 0;
  color: var(--fs-color-primary-strong);
  @include typo.fs-text-h1;
}

.lead {
  max-width: fn.rem(720);
  margin: var(--fs-margin-title-subtitle-block) 0 0;
  color: var(--fs-color-text-muted);
  @include typo.fs-text-h5-subtitle;
}

.stats {
  display: flex;
  flex-wrap: wrap;
  gap: var(--fs-space-2);
  align-items: center;
  margin-top: var(--fs-margin-title-content);
  padding-top: var(--fs-space-2);
  border-top: 1px solid var(--fs-color-border-light);
}

.stat {
  display: flex;
  flex-direction: column;
  gap: fn.rem(4);
}

.statLabel {
  color: var(--fs-color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  @include typo.fs-text-tag;
}

.statValue {
  color: var(--fs-color-text);
  @include typo.fs-text-header;
}

.statDivider {
  width: 1px;
  height: fn.rem(32);
  background: var(--fs-color-border-light);
}

.tabs {
  margin-top: var(--fs-margin-title-content);
}

.panelWrap {
  margin-top: var(--fs-margin-content-block);
}
</style>
