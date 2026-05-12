import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './AdminMovies.css'

function AdminMovies() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [movies, setMovies] = useState([])
  const [sessions, setSessions] = useState([])
  const [filteredSessions, setFilteredSessions] = useState([])
  const [genres, setGenres] = useState([])
  const [cinemas, setCinemas] = useState([])
  const [halls, setHalls] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('movies')
  
  // Фильтры для сеансов
  const [selectedCinema, setSelectedCinema] = useState('all')
  const [selectedDate, setSelectedDate] = useState('all')
  
  // Модальные окна
  const [showMovieModal, setShowMovieModal] = useState(false)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [editingMovie, setEditingMovie] = useState(null)
  const [editingSession, setEditingSession] = useState(null)
  
  // Форма фильма
  const [movieForm, setMovieForm] = useState({
    title: '',
    originaltitle: '',
    releaseyear: '',
    durationmin: '',
    agerating: '',
    description: '',
    poster_url: ''
  })
  
  // Форма сеанса
  const [sessionForm, setSessionForm] = useState({
    movieid: '',
    hallid: '',
    starttime: '',
    price: ''
  })
  
  const navigate = useNavigate()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    applySessionFilters()
  }, [sessions, selectedCinema, selectedDate])

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        navigate('/')
        return
      }

      setUser(user)
      
      const { data: customerData } = await supabase
        .from('customers')
        .select(`
          *,
          roles (
            roleid,
            rolename
          )
        `)
        .eq('user_id', user.id)
        .single()

      const userRole = customerData?.roles?.rolename || 'user'
      setRole(userRole)

      if (userRole !== 'admin') {
        navigate('/')
        return
      }

      await fetchData()
      setLoading(false)
    } catch (err) {
      console.error('Ошибка:', err)
      navigate('/')
    }
  }

  const fetchData = async () => {
    try {
      // Получаем фильмы
      const { data: moviesData } = await supabase
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
        .order('movieid', { ascending: false })

      // Получаем сеансы
      const { data: sessionsData } = await supabase
        .from('sessions')
        .select(`
          *,
          movies (
            movieid,
            title,
            poster_url
          ),
          halls (
            hallid,
            hallname,
            seatscount,
            cinemas (
              cinemaid,
              cinemaname
            )
          )
        `)
        .order('starttime', { ascending: false })

      // Получаем жанры
      const { data: genresData } = await supabase
        .from('genres')
        .select('*')
        .order('genrename')

      // Получаем кинотеатры
      const { data: cinemasData } = await supabase
        .from('cinemas')
        .select('*')
        .order('cinemaname')

      // Получаем залы
      const { data: hallsData } = await supabase
        .from('halls')
        .select(`
          *,
          cinemas (
            cinemaid,
            cinemaname
          )
        `)
        .order('hallname')

      setMovies(moviesData || [])
      setSessions(sessionsData || [])
      setGenres(genresData || [])
      setCinemas(cinemasData || [])
      setHalls(hallsData || [])
    } catch (err) {
      console.error('Ошибка загрузки данных:', err)
    }
  }

  const applySessionFilters = () => {
    let result = [...sessions]

    if (selectedCinema !== 'all') {
      result = result.filter(session => 
        session.halls?.cinemas?.cinemaid === parseInt(selectedCinema)
      )
    }

    if (selectedDate !== 'all') {
      result = result.filter(session => {
        const sessionDate = new Date(session.starttime)
        const sessionDay = new Date(Date.UTC(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate())).toISOString()
        return sessionDay === selectedDate
      })
    }

    setFilteredSessions(result)
  }

  const getAvailableDates = () => {
    // Получаем уникальные даты из сеансов
    const uniqueDates = [...new Set(sessions.map(s => {
      const date = new Date(s.starttime)
      // Нормализуем дату к началу дня в UTC
      return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString()
    }))]
    
    // Сортируем по дате
    return uniqueDates.sort((a, b) => new Date(a) - new Date(b))
  }

  // Управление фильмами
  const handleAddMovie = () => {
    setEditingMovie(null)
    setMovieForm({
      title: '',
      originaltitle: '',
      releaseyear: '',
      durationmin: '',
      agerating: '',
      description: '',
      poster_url: ''
    })
    setShowMovieModal(true)
  }

  const handleEditMovie = (movie) => {
    setEditingMovie(movie)
    setMovieForm({
      title: movie.title || '',
      originaltitle: movie.originaltitle || '',
      releaseyear: movie.releaseyear || '',
      durationmin: movie.durationmin || '',
      agerating: movie.agerating || '',
      description: movie.description || '',
      poster_url: movie.poster_url || ''
    })
    setShowMovieModal(true)
  }

  const handleSaveMovie = async () => {
    try {
      if (editingMovie) {
        // Обновление
        const { error } = await supabase
          .from('movies')
          .update(movieForm)
          .eq('movieid', editingMovie.movieid)

        if (error) throw error
        alert('Фильм успешно обновлен')
      } else {
        // Добавление
        const { error } = await supabase
          .from('movies')
          .insert([movieForm])

        if (error) throw error
        alert('Фильм успешно добавлен')
      }

      setShowMovieModal(false)
      await fetchData()
    } catch (err) {
      console.error('Ошибка сохранения фильма:', err)
      alert('Ошибка при сохранении фильма: ' + err.message)
    }
  }

  const handleDeleteMovie = async (movieId) => {
    if (!confirm('Вы уверены, что хотите удалить этот фильм? Все связанные сеансы также будут удалены.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('movieid', movieId)

      if (error) throw error

      await fetchData()
      alert('Фильм успешно удален')
    } catch (err) {
      console.error('Ошибка удаления фильма:', err)
      alert('Ошибка при удалении фильма: ' + err.message)
    }
  }

  // Управление сеансами
  const handleAddSession = () => {
    setEditingSession(null)
    setSessionForm({
      movieid: '',
      hallid: '',
      starttime: '',
      price: ''
    })
    setShowSessionModal(true)
  }

  const handleEditSession = (session) => {
    setEditingSession(session)
    setSessionForm({
      movieid: session.movieid || '',
      hallid: session.hallid || '',
      starttime: session.starttime ? new Date(session.starttime).toISOString().slice(0, 16) : '',
      price: session.price || ''
    })
    setShowSessionModal(true)
  }

  const handleSaveSession = async () => {
    try {
      if (editingSession) {
        // Обновляем только фильм и цену, зал и время остаются неизменными
        const { error } = await supabase
          .from('sessions')
          .update({
            movieid: sessionForm.movieid,
            price: sessionForm.price
          })
          .eq('sessionid', editingSession.sessionid)

        if (error) throw error
        alert('Сеанс успешно обновлен')
      } else {
        // Добавление нового сеанса
        const { error } = await supabase
          .from('sessions')
          .insert([{
            movieid: sessionForm.movieid,
            hallid: sessionForm.hallid,
            starttime: sessionForm.starttime,
            price: sessionForm.price
          }])

        if (error) throw error
        alert('Сеанс успешно добавлен')
      }

      setShowSessionModal(false)
      await fetchData()
    } catch (err) {
      console.error('Ошибка сохранения сеанса:', err)
      alert('Ошибка при сохранении сеанса: ' + err.message)
    }
  }

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Вы уверены, что хотите удалить этот сеанс?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('sessions')
        .delete()
        .eq('sessionid', sessionId)

      if (error) throw error

      await fetchData()
      alert('Сеанс успешно удален')
    } catch (err) {
      console.error('Ошибка удаления сеанса:', err)
      alert('Ошибка при удалении сеанса: ' + err.message)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="admin-movies-page">
        <div className="loading-screen">
          <div className="loader"></div>
          <p>Загрузка...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-movies-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Управление фильмами и сеансами</h1>
          <p className="admin-subtitle">
            Добавляйте, редактируйте и удаляйте фильмы и сеансы
          </p>
        </div>

        {/* Табы */}
        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
              <path d="M7 3v14M12 3v14M17 3v14"/>
            </svg>
            Фильмы ({movies.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            Сеансы ({sessions.length})
          </button>
        </div>

        {/* Контент */}
        {activeTab === 'movies' ? (
          <div className="admin-content">
            {/* Кнопка добавления и дисклеймер */}
            <div className="content-header-section">
              <button className="add-btn" onClick={handleAddMovie}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Добавить фильм
              </button>
              <div className="disclaimer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="16" x2="12" y2="12"/>
                  <line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                <span>Для добавления фильма потребуется: название, описание, год выпуска, длительность, возрастной рейтинг и ссылка на постер</span>
              </div>
            </div>

            {/* Список фильмов */}
            <div className="movies-grid-admin">
              {movies.map(movie => (
                <div key={movie.movieid} className="movie-card-admin">
                  <div className="movie-poster-admin">
                    {movie.poster_url ? (
                      <img src={movie.poster_url} alt={movie.title} />
                    ) : (
                      <div className="poster-placeholder">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="2" y="3" width="20" height="14" rx="2"/>
                          <path d="M7 3v14M12 3v14M17 3v14"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="movie-info-admin">
                    <h3 className="movie-title-admin">{movie.title}</h3>
                    <p className="movie-year-admin">{movie.releaseyear} • {movie.durationmin} мин</p>
                    <div className="movie-genres-admin">
                      {movie.moviegenres?.slice(0, 3).map((mg, idx) => (
                        <span key={idx} className="genre-tag-admin">
                          {mg.genres?.genrename}
                        </span>
                      ))}
                    </div>
                    <div className="movie-actions-admin">
                      <button 
                        className="edit-btn-admin"
                        onClick={() => handleEditMovie(movie)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                        Редактировать
                      </button>
                      <button 
                        className="delete-btn-admin"
                        onClick={() => handleDeleteMovie(movie.movieid)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="admin-content">
            {/* Кнопка добавления сеанса */}
            <div className="content-header-section">
              <button className="add-btn" onClick={handleAddSession}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Добавить сеанс
              </button>
            </div>

            {/* Фильтры для сеансов */}
            <div className="sessions-filters">
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
                      {cinema.cinemaname}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Дата</label>
                <select 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Все даты</option>
                  {getAvailableDates().map((dateISO, idx) => {
                    const date = new Date(dateISO)
                    return (
                      <option key={idx} value={dateISO}>
                        {date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </option>
                    )
                  })}
                </select>
              </div>

              {(selectedCinema !== 'all' || selectedDate !== 'all') && (
                <button 
                  className="reset-filters-btn"
                  onClick={() => {
                    setSelectedCinema('all')
                    setSelectedDate('all')
                  }}
                >
                  Сбросить фильтры
                </button>
              )}
            </div>

            {/* Список сеансов */}
            <div className="sessions-grid-admin">
              {filteredSessions.map(session => (
                <div key={session.sessionid} className="session-card-admin">
                  <button 
                    className="delete-session-btn"
                    onClick={() => handleDeleteSession(session.sessionid)}
                    title="Удалить сеанс"
                  >
                    🗑️
                  </button>
                  
                  <div className="session-poster-admin">
                    {session.movies?.poster_url ? (
                      <img src={session.movies.poster_url} alt={session.movies.title} />
                    ) : (
                      <div className="poster-placeholder-small">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="2" y="3" width="20" height="14" rx="2"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="session-info-admin">
                    <h3>{session.movies?.title || 'Фильм не найден'}</h3>
                    <div className="session-details-admin">
                      <span className="detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                          <line x1="16" y1="2" x2="16" y2="6"/>
                          <line x1="8" y1="2" x2="8" y2="6"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        {formatDate(session.starttime)}
                      </span>
                      <span className="detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        </svg>
                        {session.halls?.cinemas?.cinemaname}
                      </span>
                      <span className="detail">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                        {session.halls?.hallname}
                      </span>
                      <span className="detail price">
                        {session.price} ₽
                      </span>
                    </div>
                    <button 
                      className="edit-session-btn"
                      onClick={() => handleEditSession(session)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Редактировать
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Модальное окно для фильма */}
        {showMovieModal && (
          <div className="modal-overlay" onClick={() => setShowMovieModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingMovie ? 'Редактировать фильм' : 'Добавить фильм'}</h2>
                <button className="close-btn" onClick={() => setShowMovieModal(false)}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Название *</label>
                  <input
                    type="text"
                    value={movieForm.title}
                    onChange={(e) => setMovieForm({...movieForm, title: e.target.value})}
                    placeholder="Введите название фильма"
                  />
                </div>
                <div className="form-group">
                  <label>Оригинальное название</label>
                  <input
                    type="text"
                    value={movieForm.originaltitle}
                    onChange={(e) => setMovieForm({...movieForm, originaltitle: e.target.value})}
                    placeholder="Введите оригинальное название"
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Год выпуска *</label>
                    <input
                      type="number"
                      value={movieForm.releaseyear}
                      onChange={(e) => setMovieForm({...movieForm, releaseyear: e.target.value})}
                      placeholder="2024"
                    />
                  </div>
                  <div className="form-group">
                    <label>Длительность (мин) *</label>
                    <input
                      type="number"
                      value={movieForm.durationmin}
                      onChange={(e) => setMovieForm({...movieForm, durationmin: e.target.value})}
                      placeholder="120"
                    />
                  </div>
                  <div className="form-group">
                    <label>Возрастной рейтинг</label>
                    <input
                      type="text"
                      value={movieForm.agerating}
                      onChange={(e) => setMovieForm({...movieForm, agerating: e.target.value})}
                      placeholder="12+"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Описание</label>
                  <textarea
                    value={movieForm.description}
                    onChange={(e) => setMovieForm({...movieForm, description: e.target.value})}
                    placeholder="Введите описание фильма"
                    rows="4"
                  />
                </div>
                <div className="form-group">
                  <label>Ссылка на постер *</label>
                  <input
                    type="url"
                    value={movieForm.poster_url}
                    onChange={(e) => setMovieForm({...movieForm, poster_url: e.target.value})}
                    placeholder="https://example.com/poster.jpg"
                  />
                </div>
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setShowMovieModal(false)}>
                    Отмена
                  </button>
                  <button className="save-btn" onClick={handleSaveMovie}>
                    {editingMovie ? 'Сохранить изменения' : 'Добавить фильм'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно для сеанса */}
        {showSessionModal && (
          <div className="modal-overlay" onClick={() => setShowSessionModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingSession ? 'Редактировать сеанс' : 'Добавить сеанс'}</h2>
                <button className="close-btn" onClick={() => setShowSessionModal(false)}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Фильм *</label>
                  <select
                    value={sessionForm.movieid}
                    onChange={(e) => setSessionForm({...sessionForm, movieid: e.target.value})}
                  >
                    <option value="">Выберите фильм</option>
                    {movies.map(movie => (
                      <option key={movie.movieid} value={movie.movieid}>
                        {movie.title}
                      </option>
                    ))}
                  </select>
                </div>
                
                {!editingSession && (
                  <>
                    <div className="form-group">
                      <label>Зал *</label>
                      <select
                        value={sessionForm.hallid}
                        onChange={(e) => setSessionForm({...sessionForm, hallid: e.target.value})}
                      >
                        <option value="">Выберите зал</option>
                        {halls.map(hall => (
                          <option key={hall.hallid} value={hall.hallid}>
                            {hall.cinemas?.cinemaname} - {hall.hallname}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Дата и время *</label>
                      <input
                        type="datetime-local"
                        value={sessionForm.starttime}
                        onChange={(e) => setSessionForm({...sessionForm, starttime: e.target.value})}
                      />
                    </div>
                  </>
                )}
                
                <div className="form-group">
                  <label>Цена *</label>
                  <input
                    type="number"
                    value={sessionForm.price}
                    onChange={(e) => setSessionForm({...sessionForm, price: e.target.value})}
                    placeholder="500"
                  />
                </div>
                
                {editingSession && (
                  <div className="info-box">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="16" x2="12" y2="12"/>
                      <line x1="12" y1="8" x2="12.01" y2="8"/>
                    </svg>
                    <span>Зал, кинотеатр и время сеанса изменить нельзя. Можно только изменить фильм и цену.</span>
                  </div>
                )}
                
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={() => setShowSessionModal(false)}>
                    Отмена
                  </button>
                  <button className="save-btn" onClick={handleSaveSession}>
                    {editingSession ? 'Сохранить изменения' : 'Добавить сеанс'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminMovies
