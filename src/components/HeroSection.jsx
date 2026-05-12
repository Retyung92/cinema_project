import { useNavigate } from 'react-router-dom'
import './HeroSection.css'

function HeroSection({ movie }) {
  const navigate = useNavigate()
  
  if (!movie) return null

  return (
    <div className="hero-section">
      {/* Контент */}
      <div className="hero-content">
        {/* Левая часть - информация о фильме */}
        <div className="hero-info">
          <h1 className="hero-title">{movie.title}</h1>
          
          <div className="hero-meta">
            <span className="hero-year">{movie.releaseyear}</span>
            <span className="hero-duration">{movie.durationmin} мин</span>
            {movie.agerating && (
              <span className="hero-rating">{movie.agerating}</span>
            )}
          </div>
          
          <p className="hero-description">
            {movie.description}
          </p>
          
          <div className="hero-actions">
            <button className="btn-play" onClick={() => alert('Просмотр фильмов онлайн будет добавлен позже')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
              Смотреть
            </button>
            <button className="btn-info" onClick={() => navigate('/sessions')}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              Подробнее
            </button>
          </div>
        </div>

        {/* Правая часть - постер */}
        <div className="hero-poster">
          <img 
            src={movie.poster_url || 'https://via.placeholder.com/400x600?text=No+Poster'} 
            alt={movie.title}
          />
        </div>
      </div>
    </div>
  )
}

export default HeroSection
