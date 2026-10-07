import { useEffect, useState } from 'react'
import './App.css'
import DrobeLogo from './DrobeLogo'
import LandingPage from './LandingPage'
import SignUp from './SignUp'
import Login from './Login'
import AddClothes from './AddClothes'
import Home from './Home'
import Closet from './Closet'
import ItemDetail from './ItemDetail'
import Profile from './Profile'
import Outfits from './Outfits'

type View = 'landing' | 'signup' | 'login' | 'home' | 'closet' | 'add-clothes' | 'outfits' | 'profile' | 'item-detail'
const API = 'http://localhost:3001/api'

function App() {
  const [view, setView] = useState<View>('landing')
  const [user, setUser] = useState<any>(null)
  const [weather, setWeather] = useState<any>(null)
  const [weatherError, setWeatherError] = useState('')
  const [recommendation, setRecommendation] = useState<any>(null)
  const [recommendationLoading, setRecommendationLoading] = useState(false)
  const [recommendationError, setRecommendationError] = useState('')
  const [clothesCount, setClothesCount] = useState(0)
  const [clothes, setClothes] = useState<any[]>([])
  const [outfits, setOutfits] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [outfitSelection, setOutfitSelection] = useState<any[]>([])

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (!savedUser || !localStorage.getItem('token')) return
    try {
      setUser(JSON.parse(savedUser))
      setView('home')
      void loadOverview(); void loadOutfits()
    } catch {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  }, [])

  const loadOverview = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    setWeather(null)
    setWeatherError('')
    setRecommendation(null)
    setRecommendationError('')
    setRecommendationLoading(true)

    let freshWeather = null
    try {
      const response = await fetch(`${API}/weather`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not load current Espoo weather')
      freshWeather = data
      setWeather(freshWeather)
    } catch (error) {
      console.error('Espoo weather refresh failed:', error)
      setWeatherError(error instanceof Error ? error.message : 'Could not load live Espoo weather')
    }

    try {
      const response = await fetch(`${API}/recommendation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ weather: freshWeather }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Could not generate a closet recommendation')
      setRecommendation(data.recommendation)
      setClothesCount(data.clothesCount ?? 0)
    } catch (error) {
      console.error('Closet recommendation failed:', error)
      setRecommendationError(error instanceof Error ? error.message : 'Could not generate an outfit idea')
    } finally {
      setRecommendationLoading(false)
    }
  }

  const loadClothes = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const response = await fetch(`${API}/clothes`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await response.json()
      if (response.ok) { setClothes(data); setClothesCount(data.length) }
      else console.error(data.message || 'Failed to load clothes')
    } catch (error) { console.error('Clothes error:', error) }
  }

  const loadOutfits = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const response = await fetch(`${API}/outfits`, { headers: { Authorization: `Bearer ${token}` } })
      const data = await response.json()
      if (response.ok) setOutfits(data)
      else console.error(data.message || 'Failed to load outfits')
    } catch (error) { console.error('Outfits error:', error) }
  }

  const handleRegister = async (form: { name: string; email: string; password: string }) => {
    try {
      const response = await fetch(`${API}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await response.json()
      if (!response.ok) { alert(data.message || 'Registration failed'); return }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      setView('home')
      void loadOverview(); void loadOutfits()
    } catch (error) { console.error(error); alert('Could not connect to the backend') }
  }

  const handleLogin = async (form: { email: string; password: string }) => {
    try {
      const response = await fetch(`${API}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await response.json()
      if (!response.ok) { alert(data.message || 'Login failed'); return }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      setView('home')
      void loadOverview(); void loadOutfits()
    } catch (error) { console.error(error); alert('Could not connect to the backend') }
  }

  const handleLogout = () => {
    localStorage.removeItem('token'); localStorage.removeItem('user')
    setUser(null); setClothes([]); setClothesCount(0); setOutfits([]); setWeather(null); setWeatherError(''); setRecommendation(null); setRecommendationError(''); setView('landing')
  }

  const navigate = async (page: string) => {
    if (page === 'add' || page === 'add-clothes') { setView('add-clothes'); return }
    if (page === 'outfit' || page === 'add-outfit') { setView('outfits'); return }
    if (page === 'home' || page === 'closet' || page === 'profile' || page === 'outfits') {
      if (page === 'home') { setView('home'); await loadOverview(); return }
      if (page === 'closet') await loadClothes()
      if (page === 'outfits') { await loadClothes(); await loadOutfits() }
      setView(page)
    }
  }

  const handleDeleteClothing = async (item: any) => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const response = await fetch(`${API}/clothes/${item.id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } })
      const data = await response.json()
      if (!response.ok) { alert(data.message || 'Failed to delete clothing item'); return }
      await loadClothes(); setSelectedItem(null); setView('closet')
    } catch (error) { console.error('Delete clothing error:', error); alert('Could not connect to the backend') }
  }

  const handleWearToday = async (item: any) => {
    const token = localStorage.getItem('token')
    if (!token) { alert('Please log in again.'); return }
    try {
      const response = await fetch(`${API}/wear-history`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ notes: `Wore clothing item: ${item.name}` }) })
      const data = await response.json()
      if (!response.ok) { alert(data.message || 'Failed to save wear history'); return }
      alert(`${item.name} marked as worn today!`)
    } catch (error) { console.error('Wear today error:', error); alert('Could not connect to the backend') }
  }

  const createOutfit = async ({ name, clothesIds }: { name: string; clothesIds: number[] }) => {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API}/outfits`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ name, clothesIds }) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Could not save outfit')
    setOutfits((current) => [data.outfit, ...current])
    setOutfitSelection([])
    return true
  }

  const handleClothesUpdated = async () => { await Promise.all([loadClothes(), loadOverview()]); setView('closet') }
  const mappedClothes = clothes.map((item) => ({ id: item.id, name: item.name, category: item.category, color: item.color, season: item.season, style: item.style, imageUrl: item.image_url }))
  const appViews: View[] = ['home', 'closet', 'add-clothes', 'outfits', 'profile', 'item-detail']
  const isWorkspace = appViews.includes(view)
  const navItems = [{ id: 'home', label: 'Overview' }, { id: 'closet', label: 'My closet' }, { id: 'add-clothes', label: 'Add clothes' }, { id: 'outfits', label: 'Outfits' }, { id: 'profile', label: 'Profile' }]

  return <>
    {view === 'landing' && <LandingPage onSignUp={() => setView('signup')} onLogin={() => setView('login')} />}
    {view === 'signup' && <SignUp onSubmit={handleRegister} onLogin={() => setView('login')} onBack={() => setView('landing')} />}
    {view === 'login' && <Login onSubmit={handleLogin} onSignUp={() => setView('signup')} onBack={() => setView('landing')} />}
    {isWorkspace && <div className="workspace">
      <header className="workspace-nav"><button className="workspace-logo-button" onClick={() => navigate('home')} aria-label="Drobe home"><DrobeLogo /></button><nav className="workspace-links" aria-label="Your wardrobe">{navItems.map((item) => <button key={item.id} className={`workspace-link${view === item.id || (view === 'item-detail' && item.id === 'closet') ? ' active' : ''}`} onClick={() => navigate(item.id)}>{item.label}</button>)}</nav><button className="workspace-user" onClick={() => navigate('profile')}><span className="workspace-avatar">{user?.name?.[0]?.toUpperCase() || 'D'}</span><span>{user?.name || 'Your profile'}</span></button></header>
      <main className="workspace-main">
        {view === 'home' && <Home user={user || { name: 'Drobe member' }} itemCount={clothesCount} weather={weather} weatherError={weatherError} recommendation={recommendation} recommendationLoading={recommendationLoading} recommendationError={recommendationError} onNavigate={navigate} onBuildRecommendation={async () => { await Promise.all([loadClothes(), loadOutfits()]); setOutfitSelection((recommendation?.items || []).map((item: any) => item.id)); setView('outfits') }} />}
        {view === 'closet' && <Closet items={mappedClothes} onSelectItem={(item) => { setSelectedItem(item); setView('item-detail') }} onFilter={() => {}} onNavigate={navigate} />}
        {view === 'add-clothes' && <AddClothes onSkip={() => { void loadClothes(); setView('closet') }} onAnalyze={handleClothesUpdated} />}
        {view === 'outfits' && <Outfits outfits={outfits} items={mappedClothes} initialSelection={outfitSelection} onCreate={createOutfit} onNavigate={navigate} />}
        {view === 'profile' && <Profile user={user || {}} itemCount={clothesCount} outfitCount={outfits.length} onLogout={handleLogout} onNavigate={navigate} />}
        {view === 'item-detail' && <ItemDetail item={selectedItem} onBack={() => { setSelectedItem(null); setView('closet') }} onAddToOutfit={(item) => { setOutfitSelection([item.id]); setView('outfits') }} onWearToday={handleWearToday} onDelete={handleDeleteClothing} />}
      </main>
    </div>}
  </>
}

export default App
