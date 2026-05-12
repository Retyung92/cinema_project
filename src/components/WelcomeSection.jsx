import { useNavigate } from 'react-router-dom'
import './WelcomeSection.css'

function WelcomeSection() {
  const navigate = useNavigate()
  return (
    <div className="welcome-section">
      {/* Фоновое изображение кинозала */}
      <div 
        className="welcome-background"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1920&q=80)`
        }}
      />
      
      {/* Градиентный оверлей */}
      <div className="welcome-overlay" />
      
      {/* Контент */}
      <div className="welcome-content">
        <div className="welcome-badge">
          <span>🎬</span>
          <span>Добро пожаловать</span>
        </div>
        
        <h1 className="welcome-title">
          Смотрите фильмы онлайн<br />
          или приходите в наш кинотеатр
        </h1>
        
        <p className="welcome-description">
          Мы предлагаем уникальный опыт просмотра: наслаждайтесь фильмами 
          в комфорте дома или посетите наш современный кинотеатр с 
          премиальными залами и новейшим оборудованием.
        </p>
        
        <div className="welcome-features">
          <div className="feature">
            <div className="feature-icon">🎥</div>
            <div className="feature-text">
              <h3>Онлайн-кинотеатр</h3>
              <p>Тысячи фильмов в HD качестве</p>
            </div>
          </div>
          
          <div className="feature">
            <div className="feature-icon">🍿</div>
            <div className="feature-text">
              <h3>Офлайн-залы</h3>
              <p>Премиальные кинозалы в вашем городе</p>
            </div>
          </div>
          
          <div className="feature">
            <div className="feature-icon">🎫</div>
            <div className="feature-text">
              <h3>Удобное бронирование</h3>
              <p>Покупайте билеты онлайн за минуту</p>
            </div>
          </div>
        </div>
        
        <div className="welcome-actions">
          <button className="btn-primary-large" onClick={() => alert('Просмотр фильмов онлайн будет добавлен позже')}>
            Смотреть онлайн
          </button>
          <button className="btn-secondary-large" onClick={() => navigate('/sessions')}>
            Найти кинотеатр
          </button>
        </div>
      </div>
    </div>
  )
}

export default WelcomeSection
