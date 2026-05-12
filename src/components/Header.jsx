import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import UserProfile from './UserProfile'
import './Header.css'

function Header({ user, onOpenLogin, onOpenRegister, onLogout }) {
  // Состояние для отслеживания прокрутки страницы
  const [scrolled, setScrolled] = useState(false)
  
  // Получаем текущий путь
  const location = useLocation()

  // useEffect для отслеживания скролла
  useEffect(() => {
    const handleScroll = () => {
      // Если прокрутили больше 50px, меняем стиль header
      setScrolled(window.scrollY > 50)
    }

    // Добавляем слушатель события прокрутки
    window.addEventListener('scroll', handleScroll)

    // Очищаем слушатель при размонтировании компонента
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`header ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-content">
        {/* Логотип */}
        <Link to="/" className="logo">
          <h1>CINEMA</h1>
        </Link>

        {/* Навигация */}
        <nav className="nav">
          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Главная</Link>
          <Link to="/movies" className={`nav-link ${location.pathname === '/movies' ? 'active' : ''}`}>Фильмы</Link>
          <Link to="/sessions" className={`nav-link ${location.pathname === '/sessions' ? 'active' : ''}`}>Сеансы</Link>
          <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>О нас</Link>
        </nav>

        {/* Правая часть с кнопками или профилем */}
        <div className="header-actions">
          {user ? (
            <UserProfile onLogout={onLogout} />
          ) : (
            <>
              <button className="btn-secondary" onClick={onOpenLogin}>Войти</button>
              <button className="btn-primary" onClick={onOpenRegister}>Регистрация</button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
