/** Today as "YYYY-MM-DD" */
export function today(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Start of week as "YYYY-MM-DD". weekStartDay: 0=Sun, 1=Mon, ..., 6=Sat. Default 1 (Monday). */
export function currentWeekStart(weekStartDay: number = 1): string {
  const now = new Date()
  const day = now.getDay()  // 0=Sun, 1=Mon, ..., 6=Sat
  const daysDiff = (day - weekStartDay + 7) % 7
  const start = new Date(now)
  start.setDate(now.getDate() - daysDiff)
  return start.toISOString().slice(0, 10)
}

/** All 7 date strings for the current week. weekStartDay: 0=Sun, 1=Mon, ..., 6=Sat. Default 1. */
export function currentWeekDates(weekStartDay: number = 1): string[] {
  const start = new Date(currentWeekStart(weekStartDay))
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    return d.toISOString().slice(0, 10)
  })
}

/** Day of week for date "YYYY-MM-DD". Returns 0=Sun, 1=Mon, ..., 6=Sat */
export function getDayOfWeek(dateStr: string): number {
  return new Date(dateStr + 'T12:00:00').getDay()
}

/** Monday "YYYY-MM-DD" of the calendar week (Mon-Sun) containing the given date */
export function getMondayOfWeek(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const day = d.getDay()  // 0=Sun, 1=Mon, ..., 6=Sat
  const daysToMonday = day === 0 ? 6 : day - 1  // Sun -> -6, Mon -> 0, Tue -> -1, etc.
  d.setDate(d.getDate() - daysToMonday)
  return d.toISOString().slice(0, 10)
}

/** ISO week number (1–53) */
export function weekNumber(date: Date = new Date()): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

const WEEK_EMOJIS = ['⭐', '🍦', '🌸', '🍔', '🍟', '🍭', '🚗']

/** Emoji that rotates each week */
export function weekEmoji(): string {
  return WEEK_EMOJIS[weekNumber() % WEEK_EMOJIS.length]
}
