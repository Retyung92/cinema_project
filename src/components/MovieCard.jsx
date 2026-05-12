import './MovieCard.css'

function MovieCard({ movie }) {
  // Компонент карточки фильма
  // Принимает объект movie с данными о фильме
  
  return (
    <div className="movie-card">
      {/* Постер фильма */}
      <div className="movie-poster">
        <img 
          src={movie.poster_url || 'https://via.placeholder.com/300x450?text=No+Poster'} 
          alt={movie.title}
        />
        
        {/* Оверлей с информацией при наведении */}
        <div className="movie-overlay">
          <div className="movie-info">
            <h3 className="movie-title">{movie.title}</h3>
            <div className="movie-meta">
              <span className="movie-year">{movie.releaseyear}</span>
              <span className="movie-duration">{movie.durationmin} мин</span>
              {movie.agerating && (
                <span className="movie-rating">{movie.agerating}</span>
              )}
            </div>
            <p className="movie-description">
              {movie.description?.substring(0, 100)}...
            </p>
            <button className="btn-watch" onClick={() => alert('Просмотр фильмов онлайн будет добавлен позже')}>Смотреть</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MovieCard
