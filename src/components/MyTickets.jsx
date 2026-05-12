import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import TicketReceipt from './TicketReceipt'
import './MyTickets.css'

function MyTickets() {
  const [user, setUser] = useState(null)
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('active')
  const [selectedReceiptTicket, setSelectedReceiptTicket] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    fetchUserAndTickets()
  }, [])

  const fetchUserAndTickets = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        navigate('/')
        return
      }

      setUser(user)
      
      // Получаем данные о клиенте
      const { data: customerData } = await supabase
        .from('customers')
        .select('customerid')
        .eq('user_id', user.id)
        .single()

      if (customerData) {
        // Получаем все билеты пользователя через ticketsales
        const { data: ticketsData, error } = await supabase
          .from('ticketsales')
          .select(`
            saleid,
            paymentmethod,
            tickets (
              ticketid,
              price,
              soldat,
              sessions (
                sessionid,
                starttime,
                price,
                movies (
                  movieid,
                  title,
                  poster_url,
                  durationmin
                ),
                halls (
                  hallid,
                  hallname,
                  cinemas (
                    cinemaid,
                    cinemaname
                  )
                )
              ),
              seats (
                seatid,
                rownumber,
                seatnumber
              )
            )
          `)
          .eq('customerid', customerData.customerid)
          .order('saleid', { ascending: false })

        if (error) {
          console.error('Ошибка загрузки билетов:', error)
        } else {
          setTickets(ticketsData || [])
        }
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Ошибка:', err)
      setLoading(false)
    }
  }

  const isTicketActive = (ticket) => {
    if (!ticket.tickets?.sessions?.starttime) return false
    const sessionDate = new Date(ticket.tickets.sessions.starttime)
    const now = new Date()
    return sessionDate > now
  }

  const getActiveTickets = () => tickets.filter(isTicketActive)
  const getInactiveTickets = () => tickets.filter(ticket => !isTicketActive(ticket))

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleShowReceipt = (ticket) => {
    setSelectedReceiptTicket(ticket)
  }

  if (loading) {
    return (
      <div className="my-tickets-page">
        <div className="loading-screen">
          <div className="loader"></div>
          <p>Загрузка билетов...</p>
        </div>
      </div>
    )
  }

  const activeTickets = getActiveTickets()
  const inactiveTickets = getInactiveTickets()
  const displayTickets = activeTab === 'active' ? activeTickets : inactiveTickets

  return (
    <div className="my-tickets-page">
      <div className="tickets-container">
        <div className="tickets-header">
          <h1>Мои билеты</h1>
          <p className="tickets-subtitle">
            Здесь вы можете просмотреть все свои билеты и получить квитанции
          </p>
        </div>

        {/* Табы */}
        <div className="tickets-tabs">
          <button
            className={`tab-button ${activeTab === 'active' ? 'active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Активные ({activeTickets.length})
          </button>
          <button
            className={`tab-button ${activeTab === 'inactive' ? 'active' : ''}`}
            onClick={() => setActiveTab('inactive')}
          >
            Неактивные ({inactiveTickets.length})
          </button>
        </div>

        {/* Список билетов */}
        <div className="tickets-list">
          {displayTickets.length > 0 ? (
            displayTickets.map(ticket => (
              <div key={ticket.saleid} className="ticket-card">
                <div className="ticket-poster">
                  {ticket.tickets?.sessions?.movies?.poster_url ? (
                    <img 
                      src={ticket.tickets.sessions.movies.poster_url} 
                      alt={ticket.tickets.sessions.movies.title}
                    />
                  ) : (
                    <div className="poster-placeholder">
                      <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="2" y="3" width="20" height="14" rx="2"/>
                        <path d="M7 3v14M12 3v14M17 3v14"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="ticket-info">
                  <div className="ticket-main-info">
                    <h3 className="ticket-movie-title">
                      {ticket.tickets?.sessions?.movies?.title || 'Название фильма'}
                    </h3>
                    <span className={`ticket-status ${isTicketActive(ticket) ? 'status-confirmed' : 'status-cancelled'}`}>
                      {isTicketActive(ticket) ? 'Активный' : 'Неактивный'}
                    </span>
                  </div>

                  <div className="ticket-details">
                    <div className="detail-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span>{formatDate(ticket.tickets?.sessions?.starttime)}</span>
                    </div>

                    <div className="detail-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>{formatTime(ticket.tickets?.sessions?.starttime)}</span>
                    </div>

                    <div className="detail-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      <span>{ticket.tickets?.sessions?.halls?.hallname || 'Зал'}</span>
                    </div>

                    <div className="detail-item">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                      <span>Ряд {ticket.tickets?.seats?.rownumber}, Место {ticket.tickets?.seats?.seatnumber}</span>
                    </div>
                  </div>

                  <div className="ticket-footer">
                    <div className="ticket-price">
                      <span className="price-label">Цена:</span>
                      <span className="price-value">{ticket.tickets?.price} ₽</span>
                    </div>

                    {activeTab === 'active' && isTicketActive(ticket) && (
                      <button 
                        className="download-receipt-btn"
                        onClick={() => handleShowReceipt(ticket)}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                        Получить квитанцию
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-tickets">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                <polyline points="17 2 12 7 7 2"/>
              </svg>
              <h3>
                {activeTab === 'active' 
                  ? 'У вас нет активных билетов' 
                  : 'У вас нет неактивных билетов'}
              </h3>
              <p>
                {activeTab === 'active'
                  ? 'Забронируйте билеты на интересующие вас сеансы'
                  : 'Здесь будут отображаться прошедшие билеты'}
              </p>
              {activeTab === 'active' && (
                <button 
                  className="browse-movies-btn"
                  onClick={() => navigate('/sessions')}
                >
                  Посмотреть сеансы
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Модалка с квитанцией */}
      {selectedReceiptTicket && (
        <div className="modal-overlay" onClick={() => setSelectedReceiptTicket(null)}>
          <div className="modal-content receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎬 Билет</h3>
              <button className="modal-close" onClick={() => setSelectedReceiptTicket(null)}>✕</button>
            </div>
            <div className="receipt-body">
              <TicketReceipt ticket={selectedReceiptTicket} />
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn-cancel" onClick={() => setSelectedReceiptTicket(null)}>
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyTickets
