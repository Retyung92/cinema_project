import { useRef } from 'react'
import MovieCard from './MovieCard'
import './MovieRow.css'

function MovieRow({ title, movies }) {
  // Компонент горизонтального ряда фильмов с прокруткой
  const rowRef = useRef(null)

  // Функция прокрутки влево
  const scrollLeft = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({
        left: -800,
        behavior: 'smooth'
      })
    }
  }

  // Функция прокрутки вправо
  const scrollRight = () => {
    if (rowRef.current) {
      rowRef.current.scrollBy({
        left: 800,
        behavior: 'smooth'
      })
    }
  }

  if (!movies || movies.length === 0) return null

  return (
    <div className="movie-row">
      <h2 className="row-title">{title}</h2>
      
      <div className="row-container">
        {/* Кнопка прокрутки влево */}
        <button 
          className="scroll-btn scroll-btn-left" 
          onClick={scrollLeft}
          aria-label="Прокрутить влево"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>

        {/* Контейнер с фильмами */}
        <div className="row-content" ref={rowRef}>
          {movies.map((movie) => (
            <div key={movie.movieid} className="row-item">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>

        {/* Кнопка прокрутки вправо */}
        <button 
          className="scroll-btn scroll-btn-right" 
          onClick={scrollRight}
          aria-label="Прокрутить вправо"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

export default MovieRow
