// Импортируем React Router для навигации между страницами
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Home from './components/Home.jsx'
import AboutUs from './components/AboutUs.jsx'
import Movies from './components/Movies.jsx'
import Sessions from './components/Sessions.jsx'
import Profile from './components/Profile.jsx'
import MyTickets from './components/MyTickets.jsx'
import AdminMovies from './components/AdminMovies.jsx'
import Analytics from './components/Analytics.jsx'
import BookingPage from './components/BookingPage.jsx'
import Header from './components/Header.jsx'
import Modal from './components/Modal.jsx'
import Login from './Login.jsx'
import Register from './Register.jsx'
import './App.css'

function App() {
  // Состояния для модальных окон
  const [isLoginOpen, setIsLoginOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  
  // Состояние авторизации
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Проверяем текущую сессию
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Слушаем изменения авторизации
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Функции для управления модальными окнами
  const openLogin = () => {
    setIsLoginOpen(true)
    setIsRegisterOpen(false)
  }

  const openRegister = () => {
    setIsRegisterOpen(true)
    setIsLoginOpen(false)
  }

  const closeModals = () => {
    setIsLoginOpen(false)
    setIsRegisterOpen(false)
  }

  const handleLogout = () => {
    setUser(null)
    window.location.reload()
  }

  if (loading) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="loader"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        {/* Header на всех страницах */}
        <Header 
          user={user}
          onOpenLogin={openLogin} 
          onOpenRegister={openRegister}
          onLogout={handleLogout}
        />
        
        <Routes>
          {/* Главная страница */}
          <Route path="/" element={<Home />} />
          
          {/* Страница Фильмы */}
          <Route path="/movies" element={<Movies />} />
          
          {/* Страница Сеансы */}
          <Route path="/sessions" element={<Sessions />} />
          
          {/* Страница О нас */}
          <Route path="/about" element={<AboutUs />} />
          
          {/* Профиль пользователя */}
          <Route path="/profile" element={<Profile />} />
          
          {/* Мои билеты */}
          <Route path="/my-tickets" element={<MyTickets />} />
          
          {/* Бронирование билетов */}
          <Route path="/booking/:sessionId" element={<BookingPage />} />
          
          {/* Админ-панель */}
          <Route path="/admin/movies" element={<AdminMovies />} />
          <Route path="/admin/analytics" element={<Analytics />} />
        </Routes>

        {/* Модальное окно входа */}
        <Modal isOpen={isLoginOpen} onClose={closeModals}>
          <Login onSwitchToRegister={openRegister} onClose={closeModals} />
        </Modal>

        {/* Модальное окно регистрации */}
        <Modal isOpen={isRegisterOpen} onClose={closeModals}>
          <Register onSwitchToLogin={openLogin} onClose={closeModals} />
        </Modal>
      </div>
    </Router>
  )
}

export default App
