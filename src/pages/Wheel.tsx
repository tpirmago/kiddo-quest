import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { loadData, getChildRewards, setLastReward, getStarsForChild, getTotalDaysForChild, wasRewardClaimedThisWeek } from '../utils/storage'
import type { Child } from '../types/types'
import HeroAvatar from '../components/HeroAvatar'
import RewardWheel from '../components/RewardWheel'
import NavBar from '../components/NavBar'
import QuestSetupMenu from '../components/QuestSetupMenu'
import Footer from '../components/Footer'

export default function Wheel() {
  const { childId } = useParams<{ childId: string }>()
  const navigate    = useNavigate()

  const [child,   setChild]   = useState<Child | null>(null)
  const [rewards, setRewards] = useState<string[]>([])
  const [stars,   setStars]   = useState(0)

  useEffect(() => {
    const data = loadData()
    const c = data.children.find(c => c.id === childId) ?? null
    const childRewards = getChildRewards(childId ?? '')

    setChild(c)
    setRewards(childRewards.map(r => r.title))
    setStars(getStarsForChild(childId ?? ''))
  }, [childId])

  if (!child) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <p className="text-gray-400">Loading…</p>
      </div>
    )
  }

  const totalDays = getTotalDaysForChild(childId ?? '')
  if (wasRewardClaimedThisWeek(childId ?? '')) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
        <NavBar right={<QuestSetupMenu />} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4 pt-12">
          <h1 className="text-2xl font-black text-gray-800">Reward Wheel</h1>
          <div className="text-6xl">✅</div>
          <h1 className="text-2xl font-black text-gray-700">Already received!</h1>
          <p className="text-gray-500">{child.name} already received their reward this week.</p>
          <button
            onClick={() => navigate(`/dashboard/${childId}`)}
            className="mt-4 bg-[#6C63FF] text-white font-bold px-8 py-3 rounded-xl"
          >
            Back to dashboard
          </button>
        </div>
        <Footer />
      </div>
    )
  }
  if (totalDays === 0) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
        <NavBar right={<QuestSetupMenu />} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4 pt-12">
          <h1 className="text-2xl font-black text-gray-800">Reward Wheel</h1>
          <div className="text-6xl"></div>
          <h1 className="text-2xl font-black text-gray-700">No chores set up!</h1>
          <p className="text-gray-500">Add chores from Quest Setup → Manage chores first.</p>
          <button
            onClick={() => navigate(`/chores/${childId}`)}
            className="mt-4 bg-[#6C63FF] text-white font-bold px-8 py-3 rounded-xl"
          >
            Manage Chores
          </button>
        </div>
        <Footer />
      </div>
    )
  }
  if (stars < totalDays) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
        <NavBar right={<QuestSetupMenu />} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4 pt-12">
          <h1 className="text-2xl font-black text-gray-800">Reward Wheel</h1>
          <div className="text-6xl">🔒</div>
          <h1 className="text-2xl font-black text-gray-700">Not yet!</h1>
          <p className="text-gray-500">{child.name} needs to complete all chore days to unlock the wheel.</p>
          <p className="text-lg font-bold text-[#6C63FF]">{stars} / {totalDays} days</p>
          <button
            onClick={() => navigate(`/dashboard/${childId}`)}
            className="mt-4 bg-[#6C63FF] text-white font-bold px-8 py-3 rounded-xl"
          >
            Back to dashboard
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  if (rewards.length === 0) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
        <NavBar right={<QuestSetupMenu />} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4 pt-12">
          <h1 className="text-2xl font-black text-gray-800">Reward Wheel</h1>
          <div className="text-6xl">🎁</div>
          <h1 className="text-2xl font-black text-gray-700">No rewards set up!</h1>
          <p className="text-gray-500">Ask a parent to add some rewards first.</p>
          <button onClick={() => navigate(`/rewards/${childId}`)} className="mt-4 bg-[#6C63FF] hover:bg-purple-600 text-white font-bold px-8 py-3 rounded-xl">
            Add Rewards
          </button>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      <NavBar right={<QuestSetupMenu />} />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 pt-12 pb-6 flex flex-col items-center gap-6">
        <h1 className="text-2xl font-black text-gray-800 w-full text-center">Reward Wheel</h1>
        {/* Header */}
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={() => navigate(`/dashboard/${childId}`)}
            className="shrink-0 p-0 bg-transparent border-0 rounded-full hover:ring-2 hover:ring-[#6C63FF] transition-all cursor-pointer"
            aria-label={`Go to ${child.name}'s dashboard`}
          >
            <HeroAvatar hero={child.hero} size="lg" />
          </button>
          <div className="text-center">
            <p className="text-2xl font-black text-gray-800">🎉 {child.name} earned a spin!</p>
            <p className="text-gray-500 text-sm mt-1">7/7 days completed this week!</p>
          </div>
        </div>

        {/* Wheel */}
        <div className="bg-white rounded-3xl shadow-md border border-purple-100 p-6 w-full max-w-sm">
          <RewardWheel
            rewards={rewards}
            onRewardSelected={(reward) => {
              if (childId) setLastReward(childId, reward)
            }}
            onRewardModalClose={() => navigate(`/dashboard/${childId}`)}
          />
        </div>

        <button onClick={() => navigate(`/dashboard/${childId}`)} className="text-[#6C63FF] font-semibold text-sm">
          ← Back to dashboard
        </button>
      </main>
      <Footer />
    </div>
  )
}
