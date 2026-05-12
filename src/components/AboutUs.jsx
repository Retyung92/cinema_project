import './AboutUs.css'

function AboutUs() {
  return (
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-title">О нас</h1>
          <p className="about-subtitle">
            Мы создаём незабываемые впечатления от просмотра фильмов
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="about-section">
        <div className="about-container">
          <div className="about-grid">
            <div className="about-text">
              <h2 className="section-title">Наша история</h2>
              <p className="section-description">
                CINEMA — это современный онлайн-кинотеатр, который объединяет лучшее 
                из двух миров: удобство домашнего просмотра и атмосферу настоящего кинозала.
              </p>
              <p className="section-description">
                Мы начали свой путь с мечты сделать качественное кино доступным каждому. 
                Сегодня мы предлагаем тысячи фильмов в HD качестве, премиальные кинозалы 
                и удобную систему бронирования билетов.
              </p>
            </div>
            <div className="about-image">
              <div className="image-placeholder">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="about-section about-values">
        <div className="about-container">
          <h2 className="section-title centered">Наши ценности</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="value-title">Качество</h3>
              <p className="value-description">
                Мы предлагаем только лучшие фильмы в высоком качестве с профессиональной озвучкой
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <h3 className="value-title">Безопасность</h3>
              <p className="value-description">
                Ваши данные защищены современными технологиями шифрования и безопасной оплаты
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
                </svg>
              </div>
              <h3 className="value-title">Инновации</h3>
              <p className="value-description">
                Мы постоянно внедряем новые технологии для улучшения вашего опыта просмотра
              </p>
            </div>

            <div className="value-card">
              <div className="value-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75M9 11a4 4 0 100-8 4 4 0 000 8z"/>
                </svg>
              </div>
              <h3 className="value-title">Сообщество</h3>
              <p className="value-description">
                Мы создаём пространство для любителей кино, где каждый может найти что-то своё
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="about-section about-stats">
        <div className="about-container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Фильмов в каталоге</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">50K+</div>
              <div className="stat-label">Активных пользователей</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">15</div>
              <div className="stat-label">Премиальных залов</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Поддержка клиентов</div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-section">
        <div className="about-container">
          <h2 className="section-title centered">Наша команда</h2>
          <p className="section-subtitle centered">
            Профессионалы, которые делают CINEMA лучшим кинотеатром
          </p>
          <div className="team-grid">
            <div className="team-card">
              <div className="team-avatar">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                </svg>
              </div>
              <h3 className="team-name">Алексей Иванов</h3>
              <p className="team-role">Генеральный директор</p>
            </div>

            <div className="team-card">
              <div className="team-avatar">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                </svg>
              </div>
              <h3 className="team-name">Мария Петрова</h3>
              <p className="team-role">Директор по контенту</p>
            </div>

            <div className="team-card">
              <div className="team-avatar">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                </svg>
              </div>
              <h3 className="team-name">Дмитрий Смирнов</h3>
              <p className="team-role">Технический директор</p>
            </div>

            <div className="team-card">
              <div className="team-avatar">
                <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"/>
                </svg>
              </div>
              <h3 className="team-name">Елена Козлова</h3>
              <p className="team-role">Менеджер по работе с клиентами</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <div className="about-container">
          <h2 className="cta-title">Присоединяйтесь к нам</h2>
          <p className="cta-description">
            Станьте частью нашего сообщества и наслаждайтесь лучшими фильмами
          </p>
          <div className="cta-buttons">
            <button className="btn-cta-primary">Начать просмотр</button>
            <button className="btn-cta-secondary">Связаться с нами</button>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutUs
