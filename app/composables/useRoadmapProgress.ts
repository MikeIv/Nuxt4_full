import {
  CURRENT_ROADMAP_WEEK_ID,
  getAllRoadmapTaskIds,
  getRoadmapTaskLabelMap,
  getRoadmapWeekTaskIds,
  isRoadmapLabelCompletedByDefault,
  ROADMAP_WEEKS,
  type RoadmapWeek,
} from '#shared/constants/roadmapWeeks'

const TASK_LABELS = getRoadmapTaskLabelMap()

const STORAGE_KEY = 'nuxt4-full-roadmap-progress'
const CURRENT_WEEK_STORAGE_KEY = 'nuxt4-full-roadmap-current-week'

function readStorage(): Record<string, boolean> {
  if (!import.meta.client) {
    return {}
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return {}
    }

    const parsed: unknown = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') {
      return {}
    }

    return parsed as Record<string, boolean>
  } catch {
    return {}
  }
}

function writeStorage(value: Record<string, boolean>): void {
  if (!import.meta.client) {
    return
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

function readCurrentWeek(): number {
  if (!import.meta.client) {
    return CURRENT_ROADMAP_WEEK_ID
  }

  try {
    const raw = localStorage.getItem(CURRENT_WEEK_STORAGE_KEY)
    const parsed = raw ? parseInt(raw, 10) : NaN
    return Number.isFinite(parsed) ? parsed : CURRENT_ROADMAP_WEEK_ID
  } catch {
    return CURRENT_ROADMAP_WEEK_ID
  }
}

function writeCurrentWeek(weekId: number): void {
  if (!import.meta.client) {
    return
  }
  localStorage.setItem(CURRENT_WEEK_STORAGE_KEY, String(weekId))
}

export function useRoadmapProgress() {
  const completed = useState<Record<string, boolean>>('roadmap-progress', () => ({}))

  // Persisted "current working week" — the week where the user is actively progressing.
  // Starts from the constant CURRENT_ROADMAP_WEEK_ID on first visit.
  // Automatically advances to the next week when the current one reaches 100% completion.
  const currentWeekId = useState<number>('roadmap-current-week', () => CURRENT_ROADMAP_WEEK_ID)

  onMounted(() => {
    completed.value = readStorage()
    currentWeekId.value = readCurrentWeek()

    // Check for auto-advance on initial load (in case previous session already hit 100%)
    checkAndAdvanceCurrentWeek()
  })

  watch(
    completed,
    (value) => {
      writeStorage(value)
      // Re-evaluate advancement whenever progress changes
      checkAndAdvanceCurrentWeek()
    },
    { deep: true },
  )

  watch(currentWeekId, (val) => {
    writeCurrentWeek(val)
  })

  function isDone(taskId: string): boolean {
    if (Object.hasOwn(completed.value, taskId)) {
      return Boolean(completed.value[taskId])
    }

    const label = TASK_LABELS.get(taskId)
    return label ? isRoadmapLabelCompletedByDefault(label) : false
  }

  function toggle(taskId: string): void {
    completed.value = {
      ...completed.value,
      [taskId]: !isDone(taskId),
    }
  }

  function weekStats(week: RoadmapWeek): { done: number; total: number; percent: number } {
    const ids = getRoadmapWeekTaskIds(week)
    const done = ids.filter((id) => isDone(id)).length
    const total = ids.length

    return {
      done,
      total,
      percent: total === 0 ? 0 : Math.round((done / total) * 100),
    }
  }

  function overallStats(): { done: number; total: number; percent: number } {
    const ids = getAllRoadmapTaskIds()
    const done = ids.filter((id) => isDone(id)).length
    const total = ids.length

    return {
      done,
      total,
      percent: total === 0 ? 0 : Math.round((done / total) * 100),
    }
  }

  function getCurrentWorkingWeek(): RoadmapWeek {
    return ROADMAP_WEEKS.find((w) => w.id === currentWeekId.value) || ROADMAP_WEEKS[0]
  }

  function checkAndAdvanceCurrentWeek() {
    const week = getCurrentWorkingWeek()
    const stats = weekStats(week)

    if (stats.percent === 100) {
      const currentIndex = ROADMAP_WEEKS.findIndex((w) => w.id === currentWeekId.value)
      const nextWeek = ROADMAP_WEEKS[currentIndex + 1]
      if (nextWeek) {
        currentWeekId.value = nextWeek.id
      }
    }
  }

  return {
    weeks: ROADMAP_WEEKS,
    isDone,
    toggle,
    weekStats,
    overallStats,
    // The week the user should be actively working on (auto-advances on 100% completion of previous).
    currentWorkingWeekId: currentWeekId,
  }
}
