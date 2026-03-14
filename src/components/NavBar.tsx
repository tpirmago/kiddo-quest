import { useNavigate } from 'react-router-dom'

interface Props {
  /** When set, show Kiddos logo (clickable) linking to this path */
  logoTo?: string
  right?: React.ReactNode
}

export default function NavBar({ logoTo = '/children', right }: Props) {
  const navigate = useNavigate()

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-100 shadow-sm">
      <div className="w-full max-w-[900px] mx-auto px-4 py-3 flex items-center justify-between min-h-[56px]">
        <button
          onClick={() => navigate(logoTo)}
          className="font-black text-[#6C63FF] text-lg hover:opacity-80 transition-opacity shrink-0"
        >
          Kiddos
        </button>
        <div className="flex items-center gap-2 shrink-0">
          {right}
        </div>
      </div>
    </header>
  )
}
