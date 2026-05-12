import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import MovieCard from './MovieCard'
import './Movies.css'

function Movies() {
  const [movies, setMovies] = useState([])
  const [filteredMovies, setFilteredMovies] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Фильтры
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedYear, setSelectedYear] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [movies, searchQuery, selectedGenre, selectedYear, sortBy])

  const fetchData = async () => {
    try {
      // Получаем все фильмы с жанрами
      const { data: moviesData, error: moviesError } = await supabase
        .from('movies')
        .select(`
          *,
          moviegenres (
            genres (
              genreid,
              genrename
            )
          )
        `)
        .order('releaseyear', { ascending: false })

      if (moviesError) throw moviesError

      // Получаем все жанры
      const { data: genresData, error: genresError } = await supabase
        .from('genres')
        .select('*')
        .order('genrename')

      if (genresError) throw genresError

      setMovies(moviesData || [])
      setGenres(genresData || [])
      setLoading(false)
    } catch (err) {
      console.error('Ошибка загрузки данных:', err)
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let result = [...movies]

    // Поиск по названию
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(movie => 
        movie.title.toLowerCase().includes(query) ||
        movie.originaltitle?.toLowerCase().includes(query) ||
        movie.description?.toLowerCase().includes(query)
      )
    }

    // Фильтр по жанру
    if (selectedGenre !== 'all') {
      result = result.filter(movie => 
        movie.moviegenres?.some(mg => 
          mg.genres?.genrename === selectedGenre
        )
      )
    }

    // Фильтр по году
    if (selectedYear !== 'all') {
      const year = parseInt(selectedYear)
      result = result.filter(movie => movie.releaseyear === year)
    }

    // Сортировка
    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => b.releaseyear - a.releaseyear)
        break
      case 'oldest':
        result.sort((a, b) => a.releaseyear - b.releaseyear)
        break
      case 'title':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
      case 'duration':
        result.sort((a, b) => b.durationmin - a.durationmin)
        break
      default:
        break
    }

    setFilteredMovies(result)
  }

  const getAvailableYears = () => {
    const years = [...new Set(movies.map(m => m.releaseyear))].sort((a, b) => b - a)
    return years
  }

  if (loading) {
    return (
      <div className="movies-page">
        <div className="loading-screen">
          <div className="loader"></div>
          <p>Загрузка фильмов...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="movies-page">
      {/* Hero секция */}
      <div className="movies-hero">
        <div className="movies-hero-content">
          <h1 className="movies-title">Каталог фильмов</h1>
          <p className="movies-subtitle">
            Найдите свой идеальный фильм из нашей коллекции
          </p>
        </div>
      </div>

      {/* Фильтры и поиск */}
      <div className="movies-filters-section">
        <div className="movies-container">
          {/* Поиск */}
          <div className="search-bar">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Поиск по названию, описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button 
                className="search-clear"
                onClick={() => setSearchQuery('')}
              >
                ✕
              </button>
            )}
          </div>

          {/* Фильтры */}
          <div className="filters-row">
            <div className="filter-group">
              <label>Жанр</label>
              <select 
                value={selectedGenre} 
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="filter-select"
              >
                <option value="all">Все жанры</option>
                {genres.map(genre => (
                  <option key={genre.genreid} value={genre.genrename}>
                    {genre.genrename}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Год</label>
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(e.target.value)}
                className="filter-select"
              >
                <option value="all">Все годы</option>
                {getAvailableYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Сортировка</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
                <option value="title">По названию</option>
                <option value="duration">По длительности</option>
              </select>
            </div>

            {/* Кнопка сброса фильтров */}
            {(searchQuery || selectedGenre !== 'all' || selectedYear !== 'all' || sortBy !== 'newest') && (
              <button 
                className="reset-filters-btn"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedGenre('all')
                  setSelectedYear('all')
                  setSortBy('newest')
                }}
              >
                Сбросить фильтры
              </button>
            )}
          </div>

          {/* Результаты */}
          <div className="results-info">
            Найдено фильмов: <span className="results-count">{filteredMovies.length}</span>
          </div>
        </div>
      </div>

      {/* Сетка фильмов */}
      <div className="movies-grid-section">
        <div className="movies-container">
          {filteredMovies.length > 0 ? (
            <div className="movies-grid">
              {filteredMovies.map(movie => (
                <MovieCard key={movie.movieid} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="no-results">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <h3>Фильмы не найдены</h3>
              <p>Попробуйте изменить параметры поиска или фильтры</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Movies
