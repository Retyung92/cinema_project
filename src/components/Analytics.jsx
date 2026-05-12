import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Analytics.css'

function Analytics() {
  const [user, setUser] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    totalMovies: 0,
    totalScreenings: 0,
    activeScreenings: 0,
    recentBookings: [],
    topMovies: [],
    revenueByMonth: []
  })
  const navigate = useNavigate()

  useEffect(() => {
    checkAdminAccess()
  }, [])

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

      await fetchAnalytics()
      setLoading(false)
    } catch (err) {
      console.error('Ошибка:', err)
      navigate('/')
    }
  }

  const fetchAnalytics = async () => {
    try {
      // Общее количество продаж билетов
      const { count: ticketsCount } = await supabase
        .from('ticketsales')
        .select('*', { count: 'exact', head: true })

      // Общая выручка
      const { data: revenueData } = await supabase
        .from('tickets')
        .select('price')

      const totalRevenue = revenueData?.reduce((sum, ticket) => sum + parseFloat(ticket.price), 0) || 0

      // Количество клиентов
      const { count: customersCount } = await supabase
        .from('customers')
        .select('*', { count: 'exact', head: true })

      // Количество фильмов
      const { count: moviesCount } = await supabase
        .from('movies')
        .select('*', { count: 'exact', head: true })

      // Количество сеансов
      const { count: sessionsCount } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })

      // Активные сеансы (будущие)
      const { count: activeSessionsCount } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .gte('starttime', new Date().toISOString())

      // Последние продажи билетов
      const { data: recentSalesData } = await supabase
        .from('ticketsales')
        .select(`
          *,
          customers (
            fullname
          ),
          tickets (
            price,
            soldat,
            sessions (
              starttime,
              movies (
                title
              )
            )
          )
        `)
        .order('saleid', { ascending: false })
        .limit(10)

      // Топ фильмов по количеству проданных билетов
      const { data: topMoviesData } = await supabase
        .from('tickets')
        .select(`
          sessionid,
          sessions (
            movieid,
            movies (
              movieid,
              title,
              poster_url
            )
          )
        `)

      // Группируем по фильмам
      const movieTickets = {}
      topMoviesData?.forEach(ticket => {
        const movie = ticket.sessions?.movies
        if (movie) {
          if (!movieTickets[movie.movieid]) {
            movieTickets[movie.movieid] = {
              movie: movie,
              count: 0
            }
          }
          movieTickets[movie.movieid].count++
        }
      })

      const topMovies = Object.values(movieTickets)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setStats({
        totalBookings: ticketsCount || 0,
        totalRevenue: totalRevenue,
        totalCustomers: customersCount || 0,
        totalMovies: moviesCount || 0,
        totalScreenings: sessionsCount || 0,
        activeScreenings: activeSessionsCount || 0,
        recentBookings: recentSalesData || [],
        topMovies: topMovies,
        revenueByMonth: [] // Заглушка для будущей реализации
      })
    } catch (err) {
      console.error('Ошибка загрузки аналитики:', err)
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Ожидает',
      'confirmed': 'Подтверждено',
      'cancelled': 'Отменено'
    }
    return statusMap[status] || status
  }

  const getStatusClass = (status) => {
    const classMap = {
      'pending': 'status-pending',
      'confirmed': 'status-confirmed',
      'cancelled': 'status-cancelled'
    }
    return classMap[status] || ''
  }

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="loading-screen">
          <div className="loader"></div>
          <p>Загрузка аналитики...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="analytics-page">
      <div className="analytics-container">
        <div className="analytics-header">
          <h1>Аналитика</h1>
          <p className="analytics-subtitle">
            Статистика и показатели работы кинотеатра
          </p>
        </div>

        {/* Основные метрики */}
        <div className="metrics-grid">
          <div className="metric-card">
            <div className="metric-icon revenue">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
            </div>
            <div className="metric-info">
              <h3 className="metric-value">{formatCurrency(stats.totalRevenue)}</h3>
              <p className="metric-label">Общая выручка</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon bookings">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                <polyline points="17 2 12 7 7 2"/>
              </svg>
            </div>
            <div className="metric-info">
              <h3 className="metric-value">{stats.totalBookings}</h3>
              <p className="metric-label">Всего бронирований</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon customers">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div className="metric-info">
              <h3 className="metric-value">{stats.totalCustomers}</h3>
              <p className="metric-label">Клиентов</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon movies">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="3" width="20" height="14" rx="2"/>
                <path d="M7 3v14M12 3v14M17 3v14"/>
              </svg>
            </div>
            <div className="metric-info">
              <h3 className="metric-value">{stats.totalMovies}</h3>
              <p className="metric-label">Фильмов в каталоге</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon screenings">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
            </div>
            <div className="metric-info">
              <h3 className="metric-value">{stats.totalScreenings}</h3>
              <p className="metric-label">Всего сеансов</p>
            </div>
          </div>

          <div className="metric-card">
            <div className="metric-icon active">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div className="metric-info">
              <h3 className="metric-value">{stats.activeScreenings}</h3>
              <p className="metric-label">Активных сеансов</p>
            </div>
          </div>
        </div>

        {/* Топ фильмов */}
        <div className="analytics-section">
          <h2 className="section-title">Топ-5 популярных фильмов</h2>
          <div className="top-movies-list">
            {stats.topMovies.length > 0 ? (
              stats.topMovies.map((item, index) => (
                <div key={item.movie.movieid} className="top-movie-item">
                  <div className="movie-rank">#{index + 1}</div>
                  <div className="movie-poster-small">
                    {item.movie.poster_url ? (
                      <img src={item.movie.poster_url} alt={item.movie.title} />
                    ) : (
                      <div className="poster-placeholder-tiny">
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="2" y="3" width="20" height="14" rx="2"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="movie-info-small">
                    <h4>{item.movie.title}</h4>
                    <p>{item.count} {item.count === 1 ? 'билет' : 'билетов'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-data">Нет данных о бронированиях</p>
            )}
          </div>
        </div>

        {/* Последние продажи */}
        <div className="analytics-section">
          <h2 className="section-title">Последние продажи билетов</h2>
          <div className="recent-bookings-table">
            {stats.recentBookings.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Клиент</th>
                    <th>Фильм</th>
                    <th>Дата сеанса</th>
                    <th>Сумма</th>
                    <th>Дата покупки</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentBookings.map(sale => (
                    <tr key={sale.saleid}>
                      <td>{sale.customers?.fullname || 'Неизвестно'}</td>
                      <td>{sale.tickets?.sessions?.movies?.title || 'Неизвестно'}</td>
                      <td>{formatDate(sale.tickets?.sessions?.starttime)}</td>
                      <td className="price-cell">{formatCurrency(sale.tickets?.price)}</td>
                      <td>{formatDate(sale.tickets?.soldat)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-data">Нет продаж</p>
            )}
          </div>
        </div>

        {/* Заглушка для графиков */}
        <div className="analytics-section">
          <h2 className="section-title">Выручка по месяцам</h2>
          <div className="chart-placeholder">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <p>Графики будут реализованы в следующей версии</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
