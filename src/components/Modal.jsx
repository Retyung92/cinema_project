import { useEffect } from 'react'
import './Modal.css'

function Modal({ isOpen, onClose, children }) {
  // Закрытие по Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Блокируем скролл body когда модалка открыта
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  // Закрытие по клику на backdrop
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-content">
        {/* Кнопка закрытия */}
        <button className="modal-close" onClick={onClose} aria-label="Закрыть">
          ✕
        </button>
        
        {/* Контент модального окна */}
        {children}
      </div>
    </div>
  )
}

export default Modal
