import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Sessions.css'

function Sessions() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [cinemas, setCinemas] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Фильтры
  const [selectedDate, setSelectedDate] = useState('all')
  const [selectedCinema, setSelectedCinema] = useState('all')
  const [selectedMovie, setSelectedMovie] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      // Получаем все сеансы с информацией о фильмах, залах и кинотеатрах
      // Показываем сеансы начиная с сегодняшнего дня (включая прошедшие)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          *,
          movies (
            movieid,
            title,
            originaltitle,
            durationmin,
            agerating,
            poster_url
          ),
          halls (
            hallid,
            hallname,
            seatscount,
            cinemas (
              cinemaid,
              cinemaname,
              address,
              city
            )
          )
        `)
        .gte('starttime', today.toISOString())
        .order('starttime', { ascending: true })

      if (sessionsError) throw sessionsError

      // Получаем список кинотеатров
      const { data: cinemasData, error: cinemasError } = await supabase
        .from('cinemas')
        .select('*')
        .order('cinemaname')

      if (cinemasError) throw cinemasError

      setSessions(sessionsData || [])
      setCinemas(cinemasData || [])
      setLoading(false)
    } catch (err) {
      console.error('Ошибка загрузки данных:', err)
      setLoading(false)
    }
  }

  const getFilteredSessions = () => {
    let filtered = [...sessions]

    // Фильтр по дате
    if (selectedDate !== 'all') {
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.starttime).toISOString().split('T')[0]
        return sessionDate === selectedDate
      })
    }

    // Фильтр по кинотеатру
    if (selectedCinema !== 'all') {
      filtered = filtered.filter(session => 
        session.halls?.cinemas?.cinemaid === parseInt(selectedCinema)
      )
    }

    // Фильтр по фильму
    if (selectedMovie !== 'all') {
      filtered = filtered.filter(session => session.movies?.title === selectedMovie)
    }

    return filtered
  }

  const getAvailableDates = () => {
    const dates = [...new Set(sessions.map(s => 
      new Date(s.starttime).toISOString().split('T')[0]
    ))].sort()
    return dates
  }

  const getAvailableMovies = () => {
    const movies = [...new Set(sessions.map(s => s.movies?.title))].sort()
    return movies
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const dateOnly = date.toISOString().split('T')[0]

    // 13 мая = Сегодня, 14 мая = Завтра
    if (dateOnly === '2026-05-13') return 'Сегодня'
    if (dateOnly === '2026-05-14') return 'Завтра'

    return date.toLocaleDateString('ru-RU', { 
      day: 'numeric', 
      month: 'long',
      weekday: 'short'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const groupSessionsByDate = (sessions) => {
    const grouped = {}
    sessions.forEach(session => {
      const date = new Date(session.starttime).toISOString().split('T')[0]
      if (!grouped[date]) {
        grouped[date] = []
      }
      grouped[date].push(session)
    })
    return grouped
  }

  if (loading) {
    return (
      <div className="sessions-page">
        <div className="loading-screen">
          <div className="loader"></div>
          <p>Загрузка сеансов...</p>
        </div>
      </div>
    )
  }

  const filteredSessions = getFilteredSessions()
  const groupedSessions = groupSessionsByDate(filteredSessions)

  return (
    <div className="sessions-page">
      {/* Hero секция */}
      <div className="sessions-hero">
        <div className="sessions-hero-content">
          <h1 className="sessions-title">Расписание сеансов</h1>
          <p className="sessions-subtitle">
            Выберите удобное время и забронируйте билеты онлайн
          </p>
        </div>
      </div>

      {/* Фильтры */}
      <div className="sessions-filters-section">
        <div className="sessions-container">
          <div className="filters-row">
            <div className="filter-group">
              <label>Дата</label>
              <select 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)}
                className="filter-select"
              >
                <option value="all">Все даты</option>
                {getAvailableDates().map(date => (
                  <option key={date} value={date}>
                    {formatDate(date)}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Кинотеатр</label>
              <select 
                value={selectedCinema} 
                onChange={(e) => setSelectedCinema(e.target.value)}
                className="filter-select"
              >
                <option value="all">Все кинотеатры</option>
                {cinemas.map(cinema => (
                  <option key={cinema.cinemaid} value={cinema.cinemaid}>
                    {cinema.cinemaname} - {cinema.city}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Фильм</label>
              <select 
                value={selectedMovie} 
                onChange={(e) => setSelectedMovie(e.target.value)}
                className="filter-select"
              >
                <option value="all">Все фильмы</option>
                {getAvailableMovies().map(movie => (
                  <option key={movie} value={movie}>{movie}</option>
                ))}
              </select>
            </div>

            {(selectedDate !== 'all' || selectedCinema !== 'all' || selectedMovie !== 'all') && (
              <button 
                className="reset-filters-btn"
                onClick={() => {
                  setSelectedDate('all')
                  setSelectedCinema('all')
                  setSelectedMovie('all')
                }}
              >
                Сбросить
              </button>
            )}
          </div>

          <div className="results-info">
            Найдено сеансов: <span className="results-count">{filteredSessions.length}</span>
          </div>
        </div>
      </div>

      {/* Список сеансов */}
      <div className="sessions-list-section">
        <div className="sessions-container">
          {Object.keys(groupedSessions).length > 0 ? (
            Object.keys(groupedSessions).sort().map(date => (
              <div key={date} className="sessions-day-group">
                <h2 className="day-title">{formatDate(date)}</h2>
                <div className="sessions-grid">
                  {groupedSessions[date].map(session => (
                    <div key={session.sessionid} className="session-card">
                      <div className="session-poster">
                        <img 
                          src={session.movies?.poster_url || 'https://via.placeholder.com/200x300?text=No+Poster'} 
                          alt={session.movies?.title}
                        />
                      </div>
                      <div className="session-info">
                        <h3 className="session-movie-title">{session.movies?.title}</h3>
                        <div className="session-details">
                          <div className="session-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span>{formatTime(session.starttime)}</span>
                          </div>
                          <div className="session-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                            </svg>
                            <span>{session.halls?.cinemas?.cinemaname}</span>
                          </div>
                          <div className="session-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                              <polyline points="17 2 12 7 7 2"/>
                            </svg>
                            <span>{session.halls?.hallname}</span>
                          </div>
                          <div className="session-detail">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            <span>{session.movies?.durationmin} мин</span>
                          </div>
                        </div>
                        <div className="session-footer">
                          <div className="session-price">
                            <span className="price-label">Цена:</span>
                            <span className="price-value">{session.price} ₽</span>
                          </div>
                          <button className="btn-book" onClick={() => navigate(`/booking/${session.sessionid}`)}>Купить билет</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="no-results">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                <polyline points="17 2 12 7 7 2"/>
              </svg>
              <h3>Сеансы не найдены</h3>
              <p>Попробуйте изменить параметры фильтров</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sessions
