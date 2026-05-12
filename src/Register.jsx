import { useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { supabase } from './supabaseClient'
import './Register.css'

function Register({ onSwitchToLogin, onClose }) {
  // useState - это хук React для управления состоянием компонента
  // Здесь мы создаём объект formData, который хранит данные формы
  const [formData, setFormData] = useState({
    username: '',    // имя пользователя
    email: '',       // email
    phone: '',       // телефон
    password: '',    // пароль
    confirmPassword: '' // подтверждение пароля
  })

  // Состояние для хранения ошибок валидации
  const [errors, setErrors] = useState({})
  
  // Состояние для отображения сообщения об успешной регистрации
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  // Состояние для загрузки (показываем спиннер при отправке)
  const [isLoading, setIsLoading] = useState(false)
  
  // Реф для reCAPTCHA (чтобы можно было сбросить капчу после отправки)
  const recaptchaRef = useRef(null)
  
  // Состояние для хранения токена reCAPTCHA
  const [captchaToken, setCaptchaToken] = useState(null)

  // Функция обработки изменений в полях ввода
  // e - это событие (event), которое происходит при изменении поля
  const handleChange = (e) => {
    // Деструктуризация: получаем name и value из поля ввода
    const { name, value } = e.target
    
    // Обновляем formData, сохраняя предыдущие значения (...formData)
    // и изменяя только то поле, которое изменил пользователь
    setFormData({
      ...formData,      // копируем все существующие поля
      [name]: value     // обновляем конкретное поле (username, email и т.д.)
    })

    // Очищаем ошибку для этого поля, когда пользователь начинает вводить
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  // Обработчик изменения reCAPTCHA
  const handleCaptchaChange = (token) => {
    setCaptchaToken(token)
    // Очищаем ошибку капчи, если она была
    if (errors.captcha) {
      setErrors({
        ...errors,
        captcha: ''
      })
    }
  }

  // Функция валидации формы
  const validateForm = () => {
    const newErrors = {}

    // Проверка имени пользователя
    if (!formData.username.trim()) {
      newErrors.username = 'Имя пользователя обязательно'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Имя должно быть минимум 3 символа'
    }

    // Проверка email с помощью регулярного выражения
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = 'Email обязателен'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Введите корректный email'
    }

    // Проверка телефона
    const phoneRegex = /^(\+7|8)?[\s\-]?\(?[489][0-9]{2}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/
    if (!formData.phone) {
      newErrors.phone = 'Телефон обязателен'
    } else if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Введите корректный номер телефона'
    }

    // Проверка пароля
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть минимум 6 символов'
    }

    // Проверка совпадения паролей
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Пароли не совпадают'
    }

    // Проверка reCAPTCHA
    if (!captchaToken) {
      newErrors.captcha = 'Пожалуйста, подтвердите, что вы не робот'
    }

    // Возвращаем объект с ошибками
    return newErrors
  }

  // Функция обработки отправки формы
  const handleSubmit = async (e) => {
    // Предотвращаем стандартное поведение формы (перезагрузку страницы)
    e.preventDefault()

    // Запускаем валидацию
    const newErrors = validateForm()

    // Если есть ошибки, устанавливаем их в состояние и прерываем отправку
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    // Включаем индикатор загрузки
    setIsLoading(true)

    try {
      // Используем Supabase Auth для регистрации
      // Supabase автоматически хеширует пароль и создаёт пользователя в auth.users
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username, // Дополнительные данные пользователя
          }
        }
      })

      if (authError) {
        console.error('Ошибка при регистрации:', authError)
        
        // Обрабатываем разные типы ошибок
        if (authError.message.includes('already registered')) {
          setErrors({ submit: 'Пользователь с таким email уже существует' })
        } else {
          setErrors({ submit: `Ошибка регистрации: ${authError.message}` })
        }
        setIsLoading(false)
        return
      }

      console.log('Пользователь успешно зарегистрирован:', authData)
      
      // Создаём запись в таблице customers с привязкой к user_id
      if (authData.user) {
        const { error: customerError } = await supabase
          .from('customers')
          .insert([
            {
              user_id: authData.user.id,
              fullname: formData.username,
              email: formData.email,
              phone: formData.phone,
              roleid: 1 // По умолчанию роль "user"
            }
          ])

        if (customerError) {
          console.error('Ошибка создания профиля:', customerError)
        } else {
          console.log('Профиль пользователя создан успешно')
        }
      }
      
      // Показываем сообщение об успехе
      setIsSubmitted(true)

      // Закрываем модалку и перезагружаем страницу
      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 2000)
    } catch (err) {
      console.error('Неожиданная ошибка:', err)
      setErrors({ submit: 'Произошла ошибка. Попробуйте позже.' })
      setIsLoading(false)
    }
  }

  // JSX - это синтаксис для описания UI в React
  return (
    <div className="register-container">
      <div className="register-card">
        <h2>Регистрация</h2>
        
        {/* Условный рендеринг: показываем сообщение только если isSubmitted === true */}
        {isSubmitted && (
          <div className="success-message">
            Регистрация успешна! Добро пожаловать!
          </div>
        )}

        {/* Показываем ошибку отправки, если она есть */}
        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}

        {/* Форма регистрации. onSubmit вызывается при нажатии кнопки submit */}
        <form onSubmit={handleSubmit} className="register-form">
          
          {/* Поле для имени пользователя */}
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={errors.username ? 'error' : ''}
              placeholder="Введите имя пользователя"
              disabled={isLoading}
            />
            {/* Показываем ошибку, если она есть */}
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          {/* Поле для email */}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="example@mail.com"
              disabled={isLoading}
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Поле для телефона */}
          <div className="form-group">
            <label htmlFor="phone">Телефон</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? 'error' : ''}
              placeholder="+7 (999) 123-45-67"
              disabled={isLoading}
            />
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          {/* Поле для пароля */}
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Минимум 6 символов"
              disabled={isLoading}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* Поле для подтверждения пароля */}
          <div className="form-group">
            <label htmlFor="confirmPassword">Подтвердите пароль</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={errors.confirmPassword ? 'error' : ''}
              placeholder="Повторите пароль"
              disabled={isLoading}
            />
            {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
          </div>

          {/* Google reCAPTCHA v2 */}
          <div className="form-group captcha-group">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={handleCaptchaChange}
            />
            {errors.captcha && <span className="error-text">{errors.captcha}</span>}
          </div>

          {/* Кнопка отправки формы */}
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>

        {/* Ссылка на страницу входа */}
        <p className="login-link">
          Уже есть аккаунт? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>Войти</a>
        </p>
      </div>
    </div>
  )
}

export default Register
