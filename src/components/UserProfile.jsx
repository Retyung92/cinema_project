import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import './UserProfile.css'

function UserProfile({ onLogout }) {
  const [user, setUser] = useState(null)
  const [customer, setCustomer] = useState(null)
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchUserData = async () => {
    try {
      // Получаем текущего пользователя
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setUser(user)
        
        // Получаем данные клиента и роль
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
          console.error('Ошибка загрузки данных клиента:', error)
        } else {
          setCustomer(customerData)
          setRole(customerData?.roles?.rolename || 'user')
          console.log('Роль пользователя:', customerData?.roles?.rolename)
        }
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Ошибка:', err)
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    onLogout()
  }

  if (loading) {
    return (
      <div className="user-profile-loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!user) return null

  const displayName = customer?.fullname || user.email?.split('@')[0] || 'Пользователь'
  const isAdmin = role === 'admin'

  return (
    <div className="user-profile">
      <button 
        className="profile-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <div className="profile-avatar">
          {displayName.charAt(0).toUpperCase()}
        </div>
        <span className="profile-name">{displayName}</span>
        <svg 
          className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}
          width="12" 
          height="12" 
          viewBox="0 0 12 12" 
          fill="currentColor"
        >
          <path d="M6 9L1 4h10z"/>
        </svg>
      </button>

      {showDropdown && (
        <div className="profile-dropdown">
          <div className="dropdown-header">
            <div className="dropdown-avatar">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="dropdown-info">
              <div className="dropdown-name">{displayName}</div>
              <div className="dropdown-email">{user.email}</div>
              {isAdmin && (
                <div className="dropdown-role">
                  <span className="role-badge">Администратор</span>
                </div>
              )}
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-menu">
            <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              Мой профиль
            </Link>

            <Link to="/my-tickets" className="dropdown-item" onClick={() => setShowDropdown(false)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
                <polyline points="17 2 12 7 7 2"/>
              </svg>
              Мои билеты
            </Link>

            {isAdmin && (
              <>
                <div className="dropdown-divider"></div>
                <Link to="/admin/movies" className="dropdown-item admin-item" onClick={() => setShowDropdown(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                  Управление фильмами
                </Link>
                <Link to="/admin/analytics" className="dropdown-item admin-item" onClick={() => setShowDropdown(false)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23"/>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                  </svg>
                  Аналитика
                </Link>
              </>
            )}

            <div className="dropdown-divider"></div>

            <button onClick={handleLogout} className="dropdown-item logout-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Выйти
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfile
