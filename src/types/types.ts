export type HeroType = 'cat' | 'dog' | 'sloth' | 'lion' | 'leopard' | 'zebra' | 'panda' | 'monkey'

/** 0=Sun, 1=Mon, ..., 6=Sat. Default 1 (Monday). */
export interface Child {
  id: string
  name: string
  hero: HeroType
  weekStartDay?: number  // When this child's week begins. Default 1 (Monday).
  firstWeekKey?: string  // "YYYY-MM-DD" - start of child's first week. Used to show reduced days (start day → Sunday) only in first week.
}

/** 0=Sun, 1=Mon, ..., 6=Sat. If empty/undefined, chore applies to all days. */
export interface Chore {
  id: string
  childId: string
  title: string
  daysOfWeek?: number[]
}

export interface Reward {
  id: string
  childId: string
  title: string
}

export interface Progress {
  childId: string
  choreId: string
  date: string   // "YYYY-MM-DD"
}

export interface LastReward {
  childId: string
  title: string
  date: string   // "YYYY-MM-DD"
}

/** Tracks that child claimed their reward for a given week. weekKey = currentWeekStart(). */
export interface RewardClaimedForWeek {
  childId: string
  weekKey: string  // "YYYY-MM-DD" (start of week)
}

/** 0=Sun, 1=Mon, ..., 6=Sat. Default 1 (Monday). */
export interface AppData {
  children: Child[]
  chores:   Chore[]
  rewards:  Reward[]
  progress: Progress[]
  lastReward?: LastReward | null
  rewardClaimedForWeek?: RewardClaimedForWeek[]
  weekStartDay?: number
}
