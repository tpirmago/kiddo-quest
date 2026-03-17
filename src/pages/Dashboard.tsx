import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Child, Chore } from '../types/types'
import {
  loadData,
  addProgress,
  removeChore,
  getChildChores,
  getChildChoresForDate,
  getLastReward,
  clearLastReward,
  setRewardClaimedForWeek,
  wasRewardClaimedThisWeek,
  fillWeekForTesting,
  getStarsForChild,
  getTotalDaysForChild,
  getWeekStartDayForChild,
  setWeekStartDayForChild,
} from '../utils/storage'
import { today, currentWeekDates } from '../utils/dateUtils'
import HeroAvatar from '../components/HeroAvatar'
import ChoreCard from '../components/ChoreCard'
import ProgressBar from '../components/ProgressBar'
import NavBar from '../components/NavBar'
import QuestSetupMenu from '../components/QuestSetupMenu'
import Footer from '../components/Footer'

export default function Dashboard() {
  const { childId } = useParams<{ childId: string }>()
  const navigate    = useNavigate()

  const [child, setChild]       = useState<Child | null>(null)
  const [chores, setChores]     = useState<Chore[]>([])
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set())
  const [stars, setStars]       = useState(0)
  const [lastReward, setLastRewardState] = useState<{ title: string } | null>(null)
  const [cardMenuOpen, setCardMenuOpen] = useState(false)
  const [weekStartFormOpen, setWeekStartFormOpen] = useState(false)
  const cardMenuRef = useRef<HTMLDivElement>(null)

  const WEEK_DAYS = [
    { d: 1, label: 'Monday' },
    { d: 2, label: 'Tuesday' },
    { d: 3, label: 'Wednesday' },
    { d: 4, label: 'Thursday' },
    { d: 5, label: 'Friday' },
    { d: 6, label: 'Saturday' },
    { d: 0, label: 'Sunday' },
  ]

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cardMenuRef.current && !cardMenuRef.current.contains(e.target as Node)) {
        setCardMenuOpen(false)
      }
    }
    if (cardMenuOpen) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [cardMenuOpen])

  const refresh = useCallback(() => {
    const data = loadData()
    const c    = data.children.find(c => c.id === childId) ?? null
    const todayStr = today()
    const choresToday = getChildChoresForDate(childId ?? '', todayStr)

    setChild(c)
    setChores(choresToday)
    setCompletedToday(
      new Set(data.progress.filter(p => p.childId === childId && p.date === todayStr).map(p => p.choreId))
    )
    setStars(getStarsForChild(childId ?? ''))
    const lr = getLastReward(childId ?? '')
    setLastRewardState(lr ? { title: lr.title } : null)
  }, [childId])

  useEffect(() => { refresh() }, [refresh])

  if (!child) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Child not found.</p>
          <button onClick={() => navigate('/children')} className="text-[#6C63FF] font-semibold">← Back</button>
        </div>
      </div>
    )
  }

  const allDoneToday = chores.length > 0 && chores.every(chore => completedToday.has(chore.id))

  function handleComplete(choreId: string) {
    addProgress({ childId: childId!, choreId, date: today() })
    refresh()
  }

  function handleRemoveChore(id: string) {
    removeChore(id)
    refresh()
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      <NavBar right={<QuestSetupMenu />} />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 py-6 flex flex-col gap-5">
        {/* Hero card */}
        <div ref={cardMenuRef} className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 flex items-center gap-4 relative">
          <HeroAvatar hero={child.hero} size="xl" />
          <div className="flex-1">
            <p className="text-2xl font-black text-gray-800">{child.name}</p>
            <p className="text-gray-500 text-sm mt-1">
              {allDoneToday
                ? '🎉 All done for today!'
                : `${completedToday.size} / ${chores.length} chores today`}
            </p>
          </div>
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setCardMenuOpen(o => !o)}
              className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Settings"
            >
              ⚙️
            </button>
            {cardMenuOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[180px] z-20">
                <button
                  onClick={() => { navigate(`/chores/${childId}`); setCardMenuOpen(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                >
                  Manage chores
                </button>
                <button
                  onClick={() => { navigate(`/rewards/${childId}`); setCardMenuOpen(false) }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                >
                  Manage rewards
                </button>
                <button
                  onClick={() => { setCardMenuOpen(false); setWeekStartFormOpen(true) }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
                >
                  Week starts on
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        <ProgressBar stars={stars} total={Math.max(getTotalDaysForChild(childId ?? ''), 1)} />

        {stars < getTotalDaysForChild(childId ?? '') && chores.length > 0 && (
          <button
            onClick={() => {
              const weekStart = getWeekStartDayForChild(childId ?? '')
              fillWeekForTesting(childId!, currentWeekDates(weekStart))
              refresh()
            }}
            className="text-xs text-gray-400 hover:text-[#6C63FF] underline"
          >
            {/* Test: Fill all 7 days */}
          </button>
        )}

        {/* Reward from last week */}
        {lastReward && (
          <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6">
            <p className="text-sm font-semibold text-gray-500 mb-2">Reward from last week</p>
            <div className="flex items-center justify-between gap-4">
              <p className="text-xl font-black text-[#3b1a5a]">{lastReward.title}</p>
              <button
                onClick={() => {
                  clearLastReward()
                  if (childId) setRewardClaimedForWeek(childId)
                  setLastRewardState(null)
                }}
                className="shrink-0 px-4 py-2 bg-[#6C63FF] hover:bg-purple-600 text-white font-semibold text-sm rounded-xl transition-colors"
              >
                Reward received
              </button>
            </div>
          </div>
        )}

        {/* Today's quests: only when not yet 7 stars */}
        {stars < 7 && (
          <div>
            <h2 className="text-lg font-bold text-gray-700 mb-3">📋 Today's quests</h2>
            {chores.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-8 text-center text-gray-400">
                <div className="text-4xl mb-2"></div>
                <p>{getChildChores(childId ?? '').length === 0 ? 'No chores set up yet.' : 'No chores for today.'}</p>
                <button
                  onClick={() => navigate(`/chores/${childId}`)}
                  className="text-sm mt-2 text-[#6C63FF] font-semibold hover:underline"
                >
                  Add chores
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {chores.map(chore => (
                  <ChoreCard
                    key={chore.id}
                    title={chore.title}
                    completed={completedToday.has(chore.id)}
                    onComplete={() => handleComplete(chore.id)}
                    onDelete={() => handleRemoveChore(chore.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Spin the Reward Wheel: only when all stars and no reward yet this cycle */}
        {stars >= getTotalDaysForChild(childId ?? '') && stars > 0 && !lastReward && !wasRewardClaimedThisWeek(childId ?? '') && (
          <div className="flex justify-center">
            <button
              onClick={() => navigate(`/wheel/${childId}`)}
              className="px-8 py-4 bg-[#6C63FF] hover:bg-purple-600 active:scale-95 text-white font-bold text-lg rounded-2xl shadow-md transition-all"
            >
              Spin the Reward Wheel
            </button>
          </div>
        )}

        {allDoneToday && (
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-6 text-white text-center shadow-lg">
            <div className="text-5xl mb-2">🌟</div>
            <p className="text-xl font-black">Amazing job, {child.name}!</p>
            <p className="text-purple-200 text-sm mt-1">You completed all your quests today!</p>
          </div>
        )}

        <Footer />
      </main>

      {/* Week starts on modal */}
      {weekStartFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setWeekStartFormOpen(false)}
        >
          <div
            className="bg-white rounded-3xl shadow-xl border border-purple-100 p-6 max-w-sm w-full relative"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setWeekStartFormOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Close"
            >
              <span className="text-xl font-bold leading-none">×</span>
            </button>
            <h2 className="text-lg font-bold text-gray-700 pr-8">Week starts on</h2>
            <p className="text-sm text-gray-500 mt-1 mb-4">Choose the day of the week when the child begins using the app. Default: Monday.</p>
            <div className="flex items-center gap-3 mb-4">
              <HeroAvatar hero={child.hero} size="md" />
              <span className="font-bold text-gray-800">{child.name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {WEEK_DAYS.map(({ d, label }) => {
                const selected = getWeekStartDayForChild(childId ?? '') === d
                return (
                  <button
                    key={d}
                    onClick={() => {
                      setWeekStartDayForChild(childId ?? '', d)
                      refresh()
                      setWeekStartFormOpen(false)
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selected
                        ? 'bg-[#6C63FF] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
