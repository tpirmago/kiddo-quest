import { useNavigate } from 'react-router-dom'
import { initFamily } from '../utils/storage'
import Footer from '../components/Footer'

export default function CreateFamily() {
  const navigate = useNavigate()

  function handleStart() {
    initFamily()
    navigate('/children')
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col items-center justify-center px-6">
      <div className="flex-1 flex flex-col items-center justify-center">
      <div className="bg-white rounded-3xl shadow-md border border-purple-100 p-8 w-full max-w-sm text-center flex flex-col items-center gap-6">
        <div className="text-7xl">👨‍👩‍👧</div>

        <div>
          <h1 className="text-3xl font-black text-gray-800 mb-2">Create your family</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Welcome to Kiddos!<br />
            Set up your family to start turning chores into daily quests.
          </p>
        </div>

        <button
          onClick={handleStart}
          className="w-full bg-[#6C63FF] hover:bg-purple-600 active:scale-95 text-white font-bold text-lg py-4 rounded-2xl shadow-md transition-all"
        >
          Start
        </button>

        <p className="text-xs text-gray-400">Your progress is saved on this device.</p>
      </div>
      </div>
      <Footer />
    </div>
  )
}
