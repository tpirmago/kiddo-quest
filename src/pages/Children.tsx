import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Child, HeroType } from '../types/types'
import { loadData, addChild, removeChild, getStarsForChild } from '../utils/storage'
import ChildCard from '../components/ChildCard'
import NavBar from '../components/NavBar'
import QuestSetupMenu from '../components/QuestSetupMenu'
import Footer from '../components/Footer'
import { HERO_IMAGES } from '../components/HeroAvatar'

const HEROES: HeroType[] = ['cat', 'dog', 'sloth', 'lion', 'leopard', 'zebra', 'panda', 'monkey']

function AddChildForm({
  name,
  setName,
  hero,
  setHero,
  error,
  onAdd,
  onClose,
  showClose,
}: {
  name: string
  setName: (v: string) => void
  hero: HeroType
  setHero: (v: HeroType) => void
  error: string
  onAdd: () => void
  onClose: () => void
  showClose: boolean
}) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-purple-100 p-6 relative">
      {showClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      )}
      <h2 className={`text-lg font-bold text-gray-700 mb-4 ${showClose ? 'pr-10' : ''}`}>Add a child</h2>

      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onAdd()}
        placeholder="Child's name"
        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-[#6C63FF] mb-4"
      />

      <p className="text-sm font-semibold text-gray-500 mb-3">Pick a hero</p>
      <div className="flex gap-3 mb-4">
        {HEROES.map(h => (
          <button
            key={h}
            onClick={() => setHero(h)}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
              hero === h ? 'bg-[#6C63FF] shadow-md scale-110' : 'bg-purple-50 hover:bg-purple-100'
            }`}
          >
            <img src={HERO_IMAGES[h]} alt={h} className="w-8 h-8" />
          </button>
        ))}
      </div>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      <button
        onClick={onAdd}
        className="w-full bg-[#6C63FF] hover:bg-purple-600 active:scale-95 text-white font-bold py-3 rounded-xl transition-all"
      >
        + Add Child
      </button>
    </div>
  )
}

export default function Children() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [children, setChildren] = useState<Child[]>([])
  const [name, setName] = useState('')
  const [hero, setHero] = useState<HeroType>('cat')
  const [error, setError] = useState('')
  const [addModalOpen, setAddModalOpen] = useState(false)

  useEffect(() => { setChildren(loadData().children) }, [])

  useEffect(() => {
    if (searchParams.get('addChild') === '1') {
      setAddModalOpen(true)
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  function handleAdd() {
    if (!name.trim()) { setError('Please enter a name'); return }
    if (children.length >= 5) { setError('Maximum 5 children'); return }
    addChild({ id: crypto.randomUUID(), name: name.trim(), hero })
    setChildren(loadData().children)
    setName('')
    setError('')
    setAddModalOpen(false)
  }

  function closeAddModal() {
    setAddModalOpen(false)
    setName('')
    setError('')
  }

  function handleDelete(id: string) {
    removeChild(id)
    setChildren(loadData().children)
  }

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col">
      <NavBar right={<QuestSetupMenu />} />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-4 pt-12 pb-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-gray-800">Your Kiddos</h1>
          {children.length < 5 && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-5 py-2.5 bg-[#6C63FF] hover:bg-purple-600 active:scale-95 text-white font-bold text-sm rounded-xl transition-all"
            >
              + Add child
            </button>
          )}
        </div>
        {children.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <img src={HERO_IMAGES.leopard} alt="" className="w-16 h-16 mx-auto mb-3 object-contain" />
            <p>No children yet — add one above!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {children.map(child => (
              <ChildCard
                key={child.id}
                child={child}
                stars={getStarsForChild(child.id)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Modal for add child */}
        {addModalOpen && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
            onClick={closeAddModal}
          >
            <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
              <AddChildForm
                name={name}
                setName={setName}
                hero={hero}
                setHero={setHero}
                error={error}
                onAdd={handleAdd}
                onClose={closeAddModal}
                showClose={true}
              />
            </div>
          </div>
        )}

        <Footer />
      </main>
    </div>
  )
}
