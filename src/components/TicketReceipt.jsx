import { useRef } from 'react'
import './TicketReceipt.css'

function TicketReceipt({ ticket }) {
  const receiptRef = useRef(null)

  if (!ticket) return null

  const {
    saleid,
    paymentmethod,
    tickets: {
      ticketid,
      price,
      soldat,
      sessions: {
        starttime,
        movies: {
          title,
          poster_url,
          durationmin
        },
        halls: {
          hallname,
          cinemas: {
            cinemaname,
            address
          }
        }
      },
      seats: {
        rownumber,
        seatnumber
      }
    }
  } = ticket

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatTime = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatPurchaseDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const orderNumber = `TKT-${String(saleid).padStart(6, '0')}`

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const styles = Array.from(document.styleSheets)
      .map(sheet => {
        try {
          return Array.from(sheet.cssRules || [])
            .map(rule => rule.cssText)
            .join('\n')
        } catch { return '' }
      })
      .join('\n')

    printWindow.document.write(`
      <html>
        <head><title>Билет #${orderNumber}</title><style>${styles}</style></head>
        <body style="background:#fff;display:flex;justify-content:center;padding:40px">
          ${receiptRef.current?.outerHTML || ''}
        </body>
      </html>
    `)
    printWindow.document.close()
    setTimeout(() => printWindow.print(), 300)
  }

  return (
    <div className="ticket-receipt-wrapper">
      <div className="ticket-receipt" ref={receiptRef}>
        <div className="ticket-main">
          <div className="ticket-header">
            <div className="ticket-brand">
              <span className="ticket-brand-icon">🎬</span>
              <span className="ticket-brand-name">КИНОТЕАТР</span>
            </div>
            <div className="ticket-order">{orderNumber}</div>
          </div>

          <div className="ticket-body">
            <div className="ticket-poster-section">
              <img
                src={poster_url || 'https://via.placeholder.com/100x150'}
                alt={title}
                className="ticket-poster-img"
              />
            </div>

            <div className="ticket-movie-section">
              <h2 className="ticket-film-title">{title}</h2>

              <div className="ticket-info-grid">
                <div className="ticket-info-item">
                  <span className="info-label">Дата</span>
                  <span className="info-value">{formatDate(starttime)}</span>
                </div>
                <div className="ticket-info-item">
                  <span className="info-label">Время</span>
                  <span className="info-value">{formatTime(starttime)}</span>
                </div>
                <div className="ticket-info-item">
                  <span className="info-label">Зал</span>
                  <span className="info-value">{hallname}</span>
                </div>
                <div className="ticket-info-item">
                  <span className="info-label">Кинотеатр</span>
                  <span className="info-value">{cinemaname}</span>
                </div>
                <div className="ticket-info-item">
                  <span className="info-label">Ряд</span>
                  <span className="info-value">{rownumber}</span>
                </div>
                <div className="ticket-info-item">
                  <span className="info-label">Место</span>
                  <span className="info-value">{seatnumber}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="ticket-divider">
            <div className="divider-dots"></div>
          </div>

          <div className="ticket-footer-section">
            <div className="ticket-payment-info">
              <span>Оплата: {paymentmethod || 'Банковская карта'}</span>
              {soldat && <span>Куплен: {formatPurchaseDate(soldat)}</span>}
              <span>Билет ID: {ticketid}</span>
            </div>
            <div className="ticket-price-section">
              <span className="ticket-price-label">ИТОГО</span>
              <span className="ticket-price-amount">{price} ₽</span>
            </div>
          </div>
        </div>

        <div className="ticket-stub">
          <div className="stub-brand">{title}</div>
          <div className="stub-datetime">
            <div>{formatDate(starttime)}</div>
            <div>{formatTime(starttime)}</div>
          </div>
          <div className="stub-seat">
            Ряд {rownumber} / Место {seatnumber}
          </div>
          <div className="stub-cinema">{cinemaname}</div>
          <div className="stub-barcode">
            <div className="barcode-text">{orderNumber}</div>
          </div>
        </div>
      </div>

      <button className="receipt-print-btn" onClick={handlePrint}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
          <path d="M6 14h12v8H6z"/>
        </svg>
        Распечатать билет
      </button>
    </div>
  )
}

export default TicketReceipt
