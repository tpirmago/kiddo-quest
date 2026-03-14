import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Child, Chore } from '../types/types'
import { loadData, addChore, removeChore, getChildChores, getStarsForChild } from '../utils/storage'
import NavBar from '../components/NavBar'
import QuestSetupMenu from '../components/QuestSetupMenu'
import Footer from '../components/Footer'
import HeroAvatar, { HERO_IMAGES } from '../components/HeroAvatar'
import ChildCard from '../components/ChildCard'

const SUGGESTED = ['Clean room', 'Brush teeth', 'Feed pet', 'Do homework', 'Make bed', 'Tidy up toys']

const DAY_LABELS: { d: number; label: string }[] = [
  { d: 1, label: 'Mon' }, { d: 2, label: 'Tue' }, { d: 3, label: 'Wed' },
  { d: 4, label: 'Thu' }, { d: 5, label: 'Fri' }, { d: 6, label: 'Sat' },
  { d: 0, label: 'Sun' },
]

function ChoresChild() {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const [child, setChild] = useState<Child | null>(null)
  const [chores, setChores] = useState<Chore[]>([])
  const [title, setTitle] = useState('')
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([])
  const [addError, setAddError] = useState('')
  const [selectedQuickAdd, setSelectedQuickAdd] = useState<string | null>(null)

  useEffect(() => {
    const data = loadData()
    const c = data.children.find(x => x.id === childId) ?? null
    setChild(c)
    setChores(getChildChores(childId ?? ''))
  }, [childId])

  function refresh() {
    setChores(getChildChores(childId ?? ''))
  }

  function toggleDay(d: number) {
    setAddError('')
    setDaysOfWeek(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d].sort((a, b) => a - b)
    )
  }

  function handleAdd() {
    if (!childId) return
    if (daysOfWeek.length === 0) {
      setAddError(selectedQuickAdd ? 'Please select at least one day first' : 'Please select at least one day')
      return
    }
    const choreToAdd = selectedQuickAdd ?? title.trim()
    if (!choreToAdd) {
      setAddError('Please enter a chore name or select a quick add')
      return
    }
    if (chores.some(c => c.title.toLowerCase() === choreToAdd.toLowerCase())) {
      setAddError('This chore already exists')
      return
    }
    setAddError('')
    setSelectedQuickAdd(null)
    addChore(childId, choreToAdd, daysOfWeek)
    setTitle('')
    setDaysOfWeek([])
    refresh()
  }

  function handleDelete(id: string) {
    removeChore(id)
    refresh()
  }

  function handleSuggest(s: string) {
    if (!childId || chores.some(c => c.title.toLowerCase() === s.toLowerCase())) return
    setSelectedQuickAdd(prev => (prev === s ? null : s))
    setAddError(daysOfWeek.length === 0 ? 'Please select at least one day first' : '')
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Child not found.</p>
          <button onClick={() => navigate('/chores')} className="text-[#6C63FF] font-semibold">← Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      <NavBar right={<QuestSetupMenu />} />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 pt-12 pb-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-800">{child.name}'s Chores</h1>
          <button
            onClick={() => navigate(`/rewards/${childId}`)}
            className="px-5 py-2.5 bg-[#6C63FF] hover:bg-purple-600 active:scale-95 text-white font-bold text-sm rounded-xl transition-all"
          >
            Manage rewards
          </button>
        </div>
        {/* Child header */}
        <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 flex items-center gap-4">
          <button
            onClick={() => navigate(`/dashboard/${childId}`)}
            className="shrink-0 p-0 bg-transparent border-0 rounded-full hover:ring-2 hover:ring-[#6C63FF] transition-all cursor-pointer"
            aria-label={`Go to ${child.name}'s dashboard`}
          >
            <HeroAvatar hero={child.hero} size="2xl" />
          </button>
          <div>
            <p className="text-2xl font-black text-gray-800">{child.name}</p>
            <p className="text-gray-500 text-sm mt-1">Manage chores for this child</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Add a chore</h2>
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={title}
              onChange={e => { setTitle(e.target.value); setSelectedQuickAdd(null); setAddError('') }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="e.g. Clean room"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
            />
            <button
              onClick={handleAdd}
              className="bg-[#6C63FF] hover:bg-purple-600 text-white font-bold px-5 py-3 rounded-xl"
            >
              +
            </button>
          </div>

          <p className="text-sm font-semibold text-gray-500 mb-2">Days of week (tap to select):</p>
          <p className="text-xs text-gray-400 mb-2">Chores repeat every week on the selected days.</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              type="button"
              onClick={() => { setAddError(''); setDaysOfWeek(daysOfWeek.length === 7 ? [] : [0, 1, 2, 3, 4, 5, 6]) }}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                daysOfWeek.length === 7
                  ? 'bg-[#6C63FF] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {DAY_LABELS.map(({ d, label }) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(d)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  daysOfWeek.includes(d)
                    ? 'bg-[#6C63FF] text-white shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {addError && <p className="text-red-400 text-sm mb-2">{addError}</p>}

          <p className="text-sm text-gray-400 mt-4 mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED
              .filter(s => !chores.some(c => c.title.toLowerCase() === s.toLowerCase()))
              .map(s => (
                <button
                  key={s}
                  onClick={() => handleSuggest(s)}
                  className={`text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
                    selectedQuickAdd === s
                      ? 'bg-[#6C63FF] text-white'
                      : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
                  }`}
                >
                  + {s}
                </button>
              ))}
          </div>
        </div>

        {/* List */}
        {chores.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3"></div>
            <p>No chores yet for {child.name}.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-gray-700">Chores ({chores.length})</h2>
            {chores.map(chore => {
              const days = chore.daysOfWeek ?? [0, 1, 2, 3, 4, 5, 6]
              const dayLabels = days.length === 7 ? 'Every day' : [...days].sort((a, b) => a - b).map(d => DAY_LABELS.find(x => x.d === d)?.label ?? '').filter(Boolean).join(', ')
              return (
              <div key={chore.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                <span className="text-2xl">📋</span>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{chore.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{dayLabels}</p>
                </div>
                <button
                  onClick={() => handleDelete(chore.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-xl p-1"
                >
                  ✕
                </button>
              </div>
            )})}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

function ChoresPicker() {
  const navigate = useNavigate()
  const [children, setChildren] = useState<Child[]>([])

  useEffect(() => {
    setChildren(loadData().children)
  }, [])

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      <NavBar right={<QuestSetupMenu />} />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 pt-12 pb-6 flex flex-col gap-6">
        <h1 className="text-2xl font-black text-gray-800">Chores</h1>
        <div className="text-center mb-2">
          <p className="text-gray-600">Select a child to manage their chores</p>
        </div>

        {children.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <img src={HERO_IMAGES.leopard} alt="" className="w-16 h-16 mx-auto mb-3 object-contain" />
            <p>No children yet — add one from the Children page.</p>
            <button onClick={() => navigate('/children')} className="mt-4 text-[#6C63FF] font-semibold">
              Go to Children →
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {children.map(child => (
              <div
                key={child.id}
                onClick={() => navigate(`/chores/${child.id}`)}
                className="cursor-pointer"
              >
                <ChildCard
                  child={child}
                  stars={getStarsForChild(child.id)}
                />
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default function Chores() {
  const { childId } = useParams<{ childId?: string }>()
  if (childId) return <ChoresChild />
  return <ChoresPicker />
}
