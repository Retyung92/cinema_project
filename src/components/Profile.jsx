import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './Profile.css'

function Profile() {
  const [user, setUser] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [cards, setCards] = useState([])
  const [showAddCard, setShowAddCard] = useState(false)
  const [showEditPhone, setShowEditPhone] = useState(false)
  const [newPhone, setNewPhone] = useState('')
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardHolder: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        navigate('/')
        return
      }

      setUser(user)
      
      const { data: customerData, error } = await supabase
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

      if (error) {
        console.error('Ошибка загрузки данных:', error)
      } else {
        setCustomer(customerData)
        setRole(customerData?.roles?.rolename || 'user')
        setNewPhone(customerData?.phone || '')
        
        // Загружаем карты пользователя
        if (customerData?.customerid) {
          const { data: cardsData } = await supabase
            .from('payment_cards')
            .select('*')
            .eq('customerid', customerData.customerid)
            .order('is_default', { ascending: false })
          
          if (cardsData) {
            setCards(cardsData)
          }
        }
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Ошибка:', err)
      setLoading(false)
    }
  }

  const handleUpdatePhone = async () => {
    if (!customer?.customerid) return
    
    const phoneRegex = /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/
    if (!phoneRegex.test(newPhone.replace(/\s/g, ''))) {
      alert('Введите корректный номер телефона')
      return
    }

    const { error } = await supabase
      .from('customers')
      .update({ phone: newPhone })
      .eq('customerid', customer.customerid)

    if (error) {
      alert('Ошибка обновления телефона')
    } else {
      setCustomer({ ...customer, phone: newPhone })
      setShowEditPhone(false)
      alert('Телефон успешно обновлён')
    }
  }

  const handleAddCard = async (e) => {
    e.preventDefault()
    
    if (!customer?.customerid) return

    // Валидация
    if (cardForm.cardNumber.length !== 16) {
      alert('Номер карты должен содержать 16 цифр')
      return
    }

    const { error } = await supabase
      .from('payment_cards')
      .insert([{
        customerid: customer.customerid,
        card_number_last4: cardForm.cardNumber.slice(-4),
        card_holder_name: cardForm.cardHolder,
        expiry_month: parseInt(cardForm.expiryMonth),
        expiry_year: parseInt(cardForm.expiryYear),
        card_type: detectCardType(cardForm.cardNumber),
        is_default: cards.length === 0
      }])

    if (error) {
      alert('Ошибка добавления карты')
    } else {
      setShowAddCard(false)
      setCardForm({ cardNumber: '', cardHolder: '', expiryMonth: '', expiryYear: '', cvv: '' })
      fetchUserData()
      alert('Карта успешно добавлена')
    }
  }

  const handleDeleteCard = async (cardid) => {
    if (!confirm('Удалить эту карту?')) return

    const { error } = await supabase
      .from('payment_cards')
      .delete()
      .eq('cardid', cardid)

    if (error) {
      alert('Ошибка удаления карты')
    } else {
      fetchUserData()
    }
  }

  const handleSetDefaultCard = async (cardid) => {
    if (!customer?.customerid) return

    // Сначала убираем флаг default со всех карт
    await supabase
      .from('payment_cards')
      .update({ is_default: false })
      .eq('customerid', customer.customerid)

    // Затем ставим флаг на выбранную карту
    const { error } = await supabase
      .from('payment_cards')
      .update({ is_default: true })
      .eq('cardid', cardid)

    if (error) {
      alert('Ошибка установки карты по умолчанию')
    } else {
      fetchUserData()
    }
  }

  const detectCardType = (number) => {
    if (number.startsWith('4')) return 'Visa'
    if (number.startsWith('5')) return 'MasterCard'
    if (number.startsWith('2')) return 'Мир'
    return 'Unknown'
  }

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading-screen">
          <div className="loader"></div>
          <p>Загрузка профиля...</p>
        </div>
      </div>
    )
  }

  const displayName = customer?.fullname || user?.email?.split('@')[0] || 'Пользователь'
  const isAdmin = role === 'admin'

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-large">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="profile-header-info">
            <h1>{displayName}</h1>
            <p className="profile-email">{user?.email}</p>
            {isAdmin && (
              <span className="role-badge-large">Администратор</span>
            )}
          </div>
        </div>

        <div className="profile-content">
          <div className="profile-section">
            <h2>Личная информация</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Имя</label>
                <p>{customer?.fullname || 'Не указано'}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
              <div className="info-item">
                <label>Телефон</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <p>{customer?.phone || 'Не указан'}</p>
                  <button 
                    className="edit-btn-small"
                    onClick={() => setShowEditPhone(true)}
                  >
                    Изменить
                  </button>
                </div>
              </div>
              <div className="info-item">
                <label>Роль</label>
                <p>{isAdmin ? 'Администратор' : 'Пользователь'}</p>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h2>Статистика</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">🎫</div>
                <div className="stat-value">0</div>
                <div className="stat-label">Куплено билетов</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎬</div>
                <div className="stat-value">0</div>
                <div className="stat-label">Просмотрено фильмов</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-value">0</div>
                <div className="stat-label">Оставлено отзывов</div>
              </div>
            </div>
          </div>

          <div className="profile-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Банковские карты</h2>
              <button 
                className="add-card-btn"
                onClick={() => setShowAddCard(true)}
              >
                + Добавить карту
              </button>
            </div>
            
            {cards.length === 0 ? (
              <p style={{ color: '#94A3B8' }}>Нет привязанных карт</p>
            ) : (
              <div className="cards-grid">
                {cards.map(card => (
                  <div key={card.cardid} className="card-item">
                    <div className="card-header">
                      <span className="card-type">{card.card_type}</span>
                      {card.is_default && <span className="default-badge">По умолчанию</span>}
                    </div>
                    <div className="card-number">•••• {card.card_number_last4}</div>
                    <div className="card-holder">{card.card_holder_name}</div>
                    <div className="card-expiry">Действует до: {card.expiry_month}/{card.expiry_year}</div>
                    <div className="card-actions">
                      {!card.is_default && (
                        <button 
                          className="set-default-btn"
                          onClick={() => handleSetDefaultCard(card.cardid)}
                        >
                          Сделать основной
                        </button>
                      )}
                      <button 
                        className="delete-card-btn"
                        onClick={() => handleDeleteCard(card.cardid)}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Модальное окно редактирования телефона */}
        {showEditPhone && (
          <div className="modal-overlay" onClick={() => setShowEditPhone(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Изменить телефон</h3>
                <button className="modal-close" onClick={() => setShowEditPhone(false)}>✕</button>
              </div>
              <div className="modal-body">
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  className="phone-input"
                />
              </div>
              <div className="modal-footer">
                <button className="btn-cancel" onClick={() => setShowEditPhone(false)}>Отмена</button>
                <button className="btn-save" onClick={handleUpdatePhone}>Сохранить</button>
              </div>
            </div>
          </div>
        )}

        {/* Модальное окно добавления карты */}
        {showAddCard && (
          <div className="modal-overlay" onClick={() => setShowAddCard(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Добавить банковскую карту</h3>
                <button className="modal-close" onClick={() => setShowAddCard(false)}>✕</button>
              </div>
              <form onSubmit={handleAddCard}>
                <div className="modal-body">
                  <div className="form-group">
                    <label>Номер карты</label>
                    <input
                      type="text"
                      value={cardForm.cardNumber}
                      onChange={(e) => setCardForm({...cardForm, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16)})}
                      placeholder="1234 5678 9012 3456"
                      required
                      maxLength="16"
                    />
                  </div>
                  <div className="form-group">
                    <label>Имя держателя</label>
                    <input
                      type="text"
                      value={cardForm.cardHolder}
                      onChange={(e) => setCardForm({...cardForm, cardHolder: e.target.value.toUpperCase()})}
                      placeholder="IVAN IVANOV"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Месяц</label>
                      <input
                        type="number"
                        value={cardForm.expiryMonth}
                        onChange={(e) => setCardForm({...cardForm, expiryMonth: e.target.value})}
                        placeholder="MM"
                        min="1"
                        max="12"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Год</label>
                      <input
                        type="number"
                        value={cardForm.expiryYear}
                        onChange={(e) => setCardForm({...cardForm, expiryYear: e.target.value})}
                        placeholder="YYYY"
                        min="2026"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>CVV</label>
                      <input
                        type="text"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({...cardForm, cvv: e.target.value.replace(/\D/g, '').slice(0, 3)})}
                        placeholder="123"
                        maxLength="3"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={() => setShowAddCard(false)}>Отмена</button>
                  <button type="submit" className="btn-save">Добавить</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
