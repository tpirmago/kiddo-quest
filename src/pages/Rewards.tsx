import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Child, Reward } from '../types/types'
import { loadData, addReward, removeReward, getChildRewards, getStarsForChild } from '../utils/storage'
import NavBar from '../components/NavBar'
import QuestSetupMenu from '../components/QuestSetupMenu'
import Footer from '../components/Footer'
import HeroAvatar, { HERO_IMAGES } from '../components/HeroAvatar'
import ChildCard from '../components/ChildCard'

const SUGGESTED = ['Ice cream', 'Movie night', 'Candy', 'Park visit', 'Extra screen time', 'Choose dinner', 'Game time']

function RewardsChild() {
  const { childId } = useParams<{ childId: string }>()
  const navigate = useNavigate()
  const [child, setChild] = useState<Child | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [value, setValue] = useState('')

  useEffect(() => {
    const data = loadData()
    const c = data.children.find(x => x.id === childId) ?? null
    setChild(c)
    setRewards(getChildRewards(childId ?? ''))
  }, [childId])

  function refresh() {
    setRewards(getChildRewards(childId ?? ''))
  }

  function handleAdd() {
    if (!childId || !value.trim()) return
    addReward(childId, value.trim())
    setValue('')
    refresh()
  }

  function handleDelete(id: string) {
    removeReward(id)
    refresh()
  }

  function handleSuggest(s: string) {
    if (!childId || rewards.some(r => r.title === s)) return
    addReward(childId, s)
    refresh()
  }

  if (!child) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Child not found.</p>
          <button onClick={() => navigate('/rewards')} className="text-[#6C63FF] font-semibold">← Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      <NavBar right={<QuestSetupMenu />} />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 pt-12 pb-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-800">{child.name}'s Rewards</h1>
          <button
            onClick={() => navigate(`/chores/${childId}`)}
            className="px-5 py-2.5 bg-[#6C63FF] hover:bg-purple-600 active:scale-95 text-white font-bold text-sm rounded-xl transition-all"
          >
            Manage chores
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
            <p className="text-gray-500 text-sm mt-1">Manage rewards for this child</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6">
          <h2 className="text-lg font-bold text-gray-700 mb-4">Add a reward</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="e.g. Ice cream"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#6C63FF]"
            />
            <button
              onClick={handleAdd}
              className="bg-[#6C63FF] hover:bg-purple-600 text-white font-bold px-5 py-3 rounded-xl"
            >
              +
            </button>
          </div>

          <p className="text-sm text-gray-400 mt-4 mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED
              .filter(s => !rewards.some(r => r.title === s))
              .map(s => (
                <button
                  key={s}
                  onClick={() => handleSuggest(s)}
                  className="bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-medium px-3 py-1.5 rounded-full transition-colors"
                >
                  + {s}
                </button>
              ))}
          </div>
        </div>

        {/* List */}
        {rewards.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-5xl mb-3"></div>
            <p>No rewards yet for {child.name}.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-gray-700">Rewards ({rewards.length})</h2>
            {rewards.map(reward => (
              <div key={reward.id} className="bg-white rounded-2xl shadow-sm border border-purple-100 p-4 flex items-center gap-3">
                <span className="text-2xl">🎁</span>
                <p className="flex-1 font-medium text-gray-800">{reward.title}</p>
                <button
                  onClick={() => handleDelete(reward.id)}
                  className="text-gray-300 hover:text-red-400 transition-colors text-xl p-1"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-400">
          Rewards appear on the wheel when {child.name} completes a full week!
        </p>
      </main>
      <Footer />
    </div>
  )
}

function RewardsPicker() {
  const navigate = useNavigate()
  const [children, setChildren] = useState<Child[]>([])

  useEffect(() => {
    setChildren(loadData().children)
  }, [])

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      <NavBar right={<QuestSetupMenu />} />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 pt-12 pb-6 flex flex-col gap-6">
        <h1 className="text-2xl font-black text-gray-800">Rewards</h1>
        <div className="text-center mb-2">
          <p className="text-gray-600">Select a child to manage their rewards</p>
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
                onClick={() => navigate(`/rewards/${child.id}`)}
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

export default function Rewards() {
  const { childId } = useParams<{ childId?: string }>()
  if (childId) return <RewardsChild />
  return <RewardsPicker />
}
