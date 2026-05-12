import { useState, useRef } from 'react'
import ReCAPTCHA from 'react-google-recaptcha'
import { supabase } from './supabaseClient'
import './Login.css'

function Login({ onSwitchToRegister, onClose }) {
  // Состояние для данных формы
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  // Состояние для ошибок
  const [errors, setErrors] = useState({})
  
  // Состояние для успешного входа
  const [isSuccess, setIsSuccess] = useState(false)
  
  // Состояние загрузки
  const [isLoading, setIsLoading] = useState(false)
  
  // Реф для reCAPTCHA
  const recaptchaRef = useRef(null)
  
  // Токен капчи
  const [captchaToken, setCaptchaToken] = useState(null)

  // Обработчик изменения полей
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // Очищаем ошибку для этого поля
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  // Обработчик изменения капчи
  const handleCaptchaChange = (token) => {
    setCaptchaToken(token)
    if (errors.captcha) {
      setErrors({
        ...errors,
        captcha: ''
      })
    }
  }

  // Валидация формы
  const validateForm = () => {
    const newErrors = {}

    // Проверка email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      newErrors.email = 'Email обязателен'
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Введите корректный email'
    }

    // Проверка пароля
    if (!formData.password) {
      newErrors.password = 'Пароль обязателен'
    }

    // Проверка капчи
    if (!captchaToken) {
      newErrors.captcha = 'Пожалуйста, подтвердите, что вы не робот'
    }

    return newErrors
  }

  // Обработчик отправки формы
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Валидация
    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      // Вход через Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password
      })

      if (error) {
        console.error('Ошибка при входе:', error)
        
        // Обработка ошибок
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ submit: 'Неверный email или пароль' })
        } else {
          setErrors({ submit: `Ошибка входа: ${error.message}` })
        }
        setIsLoading(false)
        return
      }

      console.log('Успешный вход:', data)
      setIsSuccess(true)

      // Закрываем модалку и перезагружаем страницу
      setTimeout(() => {
        onClose()
        window.location.reload()
      }, 1500)

    } catch (err) {
      console.error('Неожиданная ошибка:', err)
      setErrors({ submit: 'Произошла ошибка. Попробуйте позже.' })
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Вход в аккаунт</h2>
        
        {/* Сообщение об успехе */}
        {isSuccess && (
          <div className="success-message">
            Вход выполнен успешно!
          </div>
        )}

        {/* Сообщение об ошибке */}
        {errors.submit && (
          <div className="error-message">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          
          {/* Email */}
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

          {/* Пароль */}
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Введите пароль"
              disabled={isLoading}
            />
            {errors.password && <span className="error-text">{errors.password}</span>}
          </div>

          {/* Google reCAPTCHA */}
          <div className="form-group captcha-group">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
              onChange={handleCaptchaChange}
            />
            {errors.captcha && <span className="error-text">{errors.captcha}</span>}
          </div>

          {/* Кнопка входа */}
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        {/* Ссылка на регистрацию */}
        <p className="register-link">
          Нет аккаунта? <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToRegister(); }}>Зарегистрироваться</a>
        </p>
      </div>
    </div>
  )
}

export default Login
