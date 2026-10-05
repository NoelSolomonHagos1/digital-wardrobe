import { useEffect, useState } from 'react'
import SignUp from './SignUp'
import Login from './Login'
import AddClothes from './AddClothes'
import Home from './Home'
import Closet from './Closet'
import ItemDetail from './ItemDetail'

function App() {
  const [view, setView] = useState('signup')
  const [user, setUser] = useState<any>(null)
  const [weather, setWeather] = useState<any>(null)
  const [clothes, setClothes] = useState<any[]>([])
  const [selectedItem, setSelectedItem] = useState<any>(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')

    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
  }, [])

  const loadWeather = async () => {
    try {
      const response = await fetch(
        'http://localhost:3001/api/weather?latitude=60.1699&longitude=24.9384'
      )

      const data = await response.json()

      if (response.ok) {
        setWeather(data)
      }
    } catch (error) {
      console.error('Weather error:', error)
    }
  }

  const loadClothes = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      return
    }

    try {
      const response = await fetch('http://localhost:3001/api/clothes', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        console.error(data.message || 'Failed to load clothes')
        return
      }

      setClothes(data)
    } catch (error) {
      console.error('Clothes error:', error)
    }
  }

  const handleRegister = async (form: {
    name: string
    email: string
    password: string
  }) => {
    try {
      const response = await fetch('http://localhost:3001/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Registration failed')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      setUser(data.user)

      alert('Account created successfully!')
      setView('add-clothes')
    } catch (error) {
      console.error(error)
      alert('Could not connect to the backend')
    }
  }

  const handleLogin = async (form: {
    email: string
    password: string
  }) => {
    try {
      const response = await fetch('http://localhost:3001/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      })

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Login failed')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))

      setUser(data.user)

      await loadWeather()
      await loadClothes()

      alert('Login successful!')
      setView('home')
    } catch (error) {
      console.error(error)
      alert('Could not connect to the backend')
    }
  }

  const handleDeleteClothing = async (item: any) => {
    const token = localStorage.getItem('token')

    if (!token) {
      return
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/clothes/${item.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Failed to delete clothing item')
        return
      }

      await loadClothes()
      setSelectedItem(null)
      setView('closet')
    } catch (error) {
      console.error('Delete clothing error:', error)
      alert('Could not connect to the backend')
    }
  }

  const handleWearToday = async (item: any) => {
    const token = localStorage.getItem('token')

    if (!token) {
      alert('Please log in again.')
      return
    }

    try {
      const response = await fetch(
        'http://localhost:3001/api/wear-history',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            notes: `Wore clothing item: ${item.name}`,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        alert(data.message || 'Failed to save wear history')
        return
      }

      alert(`${item.name} marked as worn today!`)
    } catch (error) {
      console.error('Wear today error:', error)
      alert('Could not connect to the backend')
    }
  }

  const handleHomeNavigate = async (page: string) => {
    if (page === 'add') {
      setView('add-clothes')
      return
    }

    if (page === 'home') {
      setView('home')
      return
    }

    if (page === 'closet') {
      await loadClothes()
      setView('closet')
      return
    }

    console.log('Navigate to:', page)
  }

  const handleClothesUpdated = async () => {
    await loadClothes()
    setView('home')
  }

  const mappedClothes = clothes.map((item) => ({
    id: item.id,
    name: item.name,
    category: item.category,
    color: item.color,
    season: item.season,
    style: item.style,
    imageUrl: item.image_url,
  }))

  return (
    <>
      {view === 'signup' && (
        <SignUp
          onSubmit={handleRegister}
          onLogin={() => setView('login')}
        />
      )}

      {view === 'login' && (
        <Login
          onSubmit={handleLogin}
          onSignUp={() => setView('signup')}
        />
      )}

      {view === 'add-clothes' && (
        <AddClothes
          onSkip={() => {
            loadClothes()
            setView('home')
          }}
          onAnalyze={handleClothesUpdated}
        />
      )}

      {view === 'home' && (
        <Home
          user={user || { name: 'User' }}
          itemCount={clothes.length}
          weather={
            weather
              ? {
                  temp: weather.current?.temperature_2m,
                  condition: 'Current Weather',
                  hint: `${weather.current?.precipitation ?? 0} mm precipitation, ${weather.current?.wind_speed_10m ?? 0} km/h wind`,
                }
              : undefined
          }
          onNavigate={handleHomeNavigate}
        />
      )}

      {view === 'closet' && (
        <Closet
          items={mappedClothes}
          onSelectItem={(item) => {
            setSelectedItem(item)
            setView('item-detail')
          }}
          onFilter={() => {
            console.log('Filter clicked')
          }}
          onNavigate={handleHomeNavigate}
        />
      )}

      {view === 'item-detail' && (
        <ItemDetail
          item={selectedItem}
          onBack={() => {
            setSelectedItem(null)
            setView('closet')
          }}
          onAddToOutfit={(item) => {
            console.log('Add to outfit:', item)
          }}
          onWearToday={handleWearToday}
          onDelete={handleDeleteClothing}
        />
      )}
    </>
  )
}

export default App