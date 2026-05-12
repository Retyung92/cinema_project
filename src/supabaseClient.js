// Импортируем функцию для создания клиента Supabase
import { createClient } from '@supabase/supabase-js'

// Получаем URL и ключ из переменных окружения
// В Vite переменные окружения доступны через import.meta.env
// Префикс VITE_ обязателен для того, чтобы переменные были доступны в браузере
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// Проверяем, что переменные окружения установлены
if (!supabaseUrl || !supabaseKey) {
  console.error('Ошибка: Не заданы переменные окружения VITE_SUPABASE_URL или VITE_SUPABASE_PUBLISHABLE_KEY')
  console.error('Проверь файл .env в корне проекта')
}

// Создаём и экспортируем клиент Supabase
// Этот объект будет использоваться для всех операций с базой данных
export const supabase = createClient(supabaseUrl, supabaseKey)

// Экспортируем также отдельные функции для удобства

// Функция для проверки подключения к базе данных
export const testConnection = async () => {
  try {
    // Простая проверка подключения - получаем данные из таблицы customers
    const { data, error } = await supabase
      .from('customers') // проверяем таблицу customers (в нижнем регистре)
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Ошибка подключения к Supabase:', error.message)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Подключение к Supabase успешно!')
    console.log('Данные из таблицы customers:', data)
    return { success: true, data }
  } catch (err) {
    console.error('Ошибка при проверке подключения:', err)
    return { success: false, error: err.message }
  }
}
