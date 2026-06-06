import {
  getAllRoadmapTaskIds,
  getRoadmapTaskLabelMap,
  getRoadmapWeekTaskIds,
  isRoadmapLabelCompletedByDefault,
  ROADMAP_WEEKS,
  type RoadmapWeek,
} from '#shared/constants/roadmapWeeks'

const TASK_LABELS = getRoadmapTaskLabelMap()

const STORAGE_KEY = 'nuxt4-full-roadmap-progress'

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

export function useRoadmapProgress() {
  const completed = useState<Record<string, boolean>>('roadmap-progress', () => ({}))

  onMounted(() => {
    completed.value = readStorage()
  })

  watch(
    completed,
    (value) => {
      writeStorage(value)
    },
    { deep: true },
  )

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

  return {
    weeks: ROADMAP_WEEKS,
    isDone,
    toggle,
    weekStats,
    overallStats,
  }
}
