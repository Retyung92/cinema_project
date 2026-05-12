import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import TicketReceipt from './TicketReceipt'
import './BookingPage.css'

function BookingPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  
  const [session, setSession] = useState(null)
  const [seats, setSeats] = useState([])
  const [bookedSeats, setBookedSeats] = useState([])
  const [selectedSeats, setSelectedSeats] = useState([])
  const [customer, setCustomer] = useState(null)
  const [cards, setCards] = useState([])
  const [selectedCard, setSelectedCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showPhoneWarning, setShowPhoneWarning] = useState(false)
  const [showCardWarning, setShowCardWarning] = useState(false)
  const [purchasedTickets, setPurchasedTickets] = useState([])
  const [showReceipt, setShowReceipt] = useState(false)

  useEffect(() => {
    fetchData()
  }, [sessionId])

const fetchData = async () => {
  try {
    // Получаем данные пользователя
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      navigate('/')
      return
    }

    // Получаем данные клиента
    const { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .single()

    setCustomer(customerData)

    // Получаем карты клиента
    if (customerData?.customerid) {
      const { data: cardsData } = await supabase
        .from('payment_cards')
        .select('*')
        .eq('customerid', customerData.customerid)
        .order('is_default', { ascending: false })
      
      if (cardsData && cardsData.length > 0) {
        setCards(cardsData)
        setSelectedCard(cardsData.find(c => c.is_default) || cardsData[0])
      }
    }

    // Получаем данные сеанса
    const { data: sessionData } = await supabase
      .from('sessions')
      .select(`
        *,
        movies (
          movieid,
          title,
          poster_url,
          durationmin
        ),
        halls (
          hallid,
          hallname,
          seatscount,
          cinemas (
            cinemaid,
            cinemaname,
            address
          )
        )
      `)
      .eq('sessionid', sessionId)
      .single()

    setSession(sessionData)

    // Получаем все места в зале
    const { data: seatsData } = await supabase
      .from('seats')
      .select('*')
      .eq('hallid', sessionData.halls.hallid)
      .order('rownumber')
      .order('seatnumber')

    setSeats(seatsData || [])

    // Получаем уже проданные билеты на этот сеанс
    const { data: ticketsData } = await supabase
      .from('tickets')
      .select('seatid')
      .eq('sessionid', sessionId)

    setBookedSeats(ticketsData?.map(t => t.seatid) || [])
    
    setLoading(false)
  } catch (err) {
    console.error('Ошибка загрузки данных:', err)
    setLoading(false)
  }
}

  const handleSeatClick = (seat) => {
    if (bookedSeats.includes(seat.seatid)) return

    if (selectedSeats.find(s => s.seatid === seat.seatid)) {
      setSelectedSeats(selectedSeats.filter(s => s.seatid !== seat.seatid))
    } else {
      setSelectedSeats([...selectedSeats, seat])
    }
  }

  const handleBooking = async () => {
    // Проверка телефона
    if (!customer?.phone) {
      setShowPhoneWarning(true)
      return
    }

    // Проверка карты
    if (cards.length === 0) {
      setShowCardWarning(true)
      return
    }

    if (selectedSeats.length === 0) {
      alert('Выберите хотя бы одно место')
      return
    }

    if (!selectedCard) {
      alert('Выберите карту для оплаты')
      return
    }

    try {
      // Создаём билеты
      const ticketsToInsert = selectedSeats.map(seat => ({
        sessionid: parseInt(sessionId),
        seatid: seat.seatid,
        price: session.price
      }))

      const { data: insertedTickets, error: ticketsError } = await supabase
        .from('tickets')
        .insert(ticketsToInsert)
        .select()

      if (ticketsError) {
        alert('Ошибка создания билетов: ' + ticketsError.message)
        return
      }

      // Создаём записи о продажах
      const salesToInsert = insertedTickets.map(ticket => ({
        ticketid: ticket.ticketid,
        customerid: customer.customerid,
        paymentmethod: `Card *${selectedCard.card_number_last4}`
      }))

      const { data: insertedSales, error: salesError } = await supabase
        .from('ticketsales')
        .insert(salesToInsert)
        .select()

      if (salesError) {
        alert('Ошибка создания продаж: ' + salesError.message)
        return
      }

      // Строим данные для квитанций
      const receiptData = insertedSales.map((sale, idx) => ({
        saleid: sale.saleid,
        paymentmethod: sale.paymentmethod,
        tickets: {
          ticketid: insertedTickets[idx].ticketid,
          price: insertedTickets[idx].price,
          soldat: insertedTickets[idx].soldat,
          sessions: session,
          seats: selectedSeats[idx]
        }
      }))

      setPurchasedTickets(receiptData)
      setShowReceipt(true)
    } catch (err) {
      console.error('Ошибка покупки:', err)
      alert('Произошла ошибка при покупке билетов')
    }
  }

  if (loading) {
    return (
      <div className="booking-page">
        <div className="loading">Загрузка...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="booking-page">
        <div className="error">Сеанс не найден</div>
      </div>
    )
  }

  // Группируем места по рядам
  const seatsByRow = seats.reduce((acc, seat) => {
    if (!acc[seat.rownumber]) {
      acc[seat.rownumber] = []
    }
    acc[seat.rownumber].push(seat)
    return acc
  }, {})

  const totalPrice = selectedSeats.length * parseFloat(session.price)

  return (
    <div className="booking-page">
      <div className="booking-container">
        <div className="booking-header">
          <div className="booking-movie-info">
            <img src={session.movies.poster_url} alt={session.movies.title} />
            <div>
              <h1>{session.movies.title}</h1>
              <p className="session-details">
                {new Date(session.starttime).toLocaleString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="cinema-details">
                {session.halls.cinemas.cinemaname} • {session.halls.hallname}
              </p>
            </div>
          </div>
        </div>

        <div className="booking-content">
          <div className="seats-section">
            <h2>Выберите места</h2>
            <div className="screen">ЭКРАН</div>
            
            <div className="seats-grid">
              {Object.keys(seatsByRow).sort((a, b) => a - b).map(rowNum => (
                <div key={rowNum} className="seat-row">
                  <span className="row-number">Ряд {rowNum}</span>
                  <div className="seats">
                    {seatsByRow[rowNum].map(seat => {
                      const isBooked = bookedSeats.includes(seat.seatid)
                      const isSelected = selectedSeats.find(s => s.seatid === seat.seatid)
                      
                      return (
                        <button
                          key={seat.seatid}
                          className={`seat ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                          onClick={() => handleSeatClick(seat)}
                          disabled={isBooked}
                        >
                          {seat.seatnumber}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="legend">
              <div className="legend-item">
                <div className="seat available"></div>
                <span>Свободно</span>
              </div>
              <div className="legend-item">
                <div className="seat selected"></div>
                <span>Выбрано</span>
              </div>
              <div className="legend-item">
                <div className="seat booked"></div>
                <span>Занято</span>
              </div>
            </div>
          </div>

          <div className="booking-summary">
            <h2>Ваш заказ</h2>
            
            {selectedSeats.length === 0 ? (
              <p className="no-seats">Места не выбраны</p>
            ) : (
              <>
                <div className="selected-seats-list">
                  {selectedSeats.map(seat => (
                    <div key={seat.seatid} className="selected-seat-item">
                      <span>Ряд {seat.rownumber}, Место {seat.seatnumber}</span>
                      <span>{parseFloat(session.price).toFixed(0)} ₽</span>
                    </div>
                  ))}
                </div>

                <div className="total">
                  <span>Итого:</span>
                  <span className="total-price">{totalPrice.toFixed(0)} ₽</span>
                </div>
              </>
            )}

            {cards.length > 0 && (
              <div className="payment-method">
                <h3>Способ оплаты</h3>
                {cards.map(card => (
                  <div 
                    key={card.cardid} 
                    className={`payment-card ${selectedCard?.cardid === card.cardid ? 'active' : ''}`}
                    onClick={() => setSelectedCard(card)}
                  >
                    <span>{card.card_type} •••• {card.card_number_last4}</span>
                    {card.is_default && <span className="default-badge">По умолчанию</span>}
                  </div>
                ))}
              </div>
            )}

            <button 
              className="book-btn"
              onClick={handleBooking}
              disabled={selectedSeats.length === 0}
            >
              Купить билеты
            </button>
          </div>
        </div>
      </div>

      {/* Предупреждение о телефоне */}
      {showPhoneWarning && (
        <div className="modal-overlay" onClick={() => setShowPhoneWarning(false)}>
          <div className="modal-content warning" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Требуется номер телефона</h3>
              <button className="modal-close" onClick={() => setShowPhoneWarning(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Для покупки билетов необходимо указать номер телефона в профиле.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowPhoneWarning(false)}>Отмена</button>
              <button className="btn-save" onClick={() => navigate('/profile')}>Перейти в профиль</button>
            </div>
          </div>
        </div>
      )}

      {/* Квитанция после покупки */}
      {showReceipt && (
        <div className="modal-overlay" onClick={() => setShowReceipt(false)}>
          <div className="modal-content receipt-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎉 Билеты успешно куплены!</h3>
              <button className="modal-close" onClick={() => { setShowReceipt(false); navigate('/my-tickets') }}>✕</button>
            </div>
            <div className="receipt-list">
              {purchasedTickets.map(receipt => (
                <TicketReceipt key={receipt.saleid} ticket={receipt} />
              ))}
            </div>
            <div className="modal-footer" style={{ justifyContent: 'center' }}>
              <button className="btn-cancel" onClick={() => { setShowReceipt(false); navigate('/my-tickets') }}>
                Перейти в мои билеты
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Предупреждение о карте */}
      {showCardWarning && (
        <div className="modal-overlay" onClick={() => setShowCardWarning(false)}>
          <div className="modal-content warning" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>⚠️ Требуется банковская карта</h3>
              <button className="modal-close" onClick={() => setShowCardWarning(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p>Для покупки билетов необходимо привязать банковскую карту в профиле.</p>
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowCardWarning(false)}>Отмена</button>
              <button className="btn-save" onClick={() => navigate('/profile')}>Перейти в профиль</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingPage
