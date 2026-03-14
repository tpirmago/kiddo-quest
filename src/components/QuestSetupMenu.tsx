import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function QuestSetupMenu() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  const go = (path: string) => {
    navigate(path)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="text-[#6C63FF] font-semibold text-sm hover:opacity-80 transition-opacity py-1 px-2"
      >
        Quest Setup
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-2 min-w-[180px] z-20">
          <button
            onClick={() => go('/children')}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
          >
            Your Kiddos
          </button>
          <button
            onClick={() => go('/children?addChild=1')}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
          >
            Add a child
          </button>
          <button
            onClick={() => go('/chores')}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
          >
            Manage chores
          </button>
          <button
            onClick={() => go('/rewards')}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
          >
            Manage rewards
          </button>
          <div className="border-t border-gray-100 my-1" />
          <button
            onClick={() => go('/settings')}
            className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-purple-50 transition-colors"
          >
            Settings
          </button>
        </div>
      )}
    </div>
  )
}
