import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import WelcomeSection from './WelcomeSection'
import HeroSection from './HeroSection'
import MovieRow from './MovieRow'
import './Home.css'

function Home() {
  // Состояние для хранения фильмов по жанрам
  const [moviesByGenre, setMoviesByGenre] = useState({})
  
  // Состояние для главного фильма в Hero-секции
  const [featuredMovie, setFeaturedMovie] = useState(null)
  
  // Состояние загрузки
  const [loading, setLoading] = useState(true)

  // useEffect для загрузки фильмов из базы данных при монтировании компонента
  useEffect(() => {
    fetchMovies()
  }, [])

  // Функция для получения фильмов из Supabase
  const fetchMovies = async () => {
    try {
      // Получаем все фильмы с их жанрами
      const { data: movies, error: moviesError } = await supabase
        .from('movies')
        .select(`
          *,
          moviegenres (
            genres (
              genreid,
              genrename
            )
          )
        `)
        .order('releaseyear', { ascending: false })

      if (moviesError) {
        console.error('Ошибка при загрузке фильмов:', moviesError)
        setLoading(false)
        return
      }

      console.log('Загружено фильмов:', movies)

      // Группируем фильмы по жанрам
      const grouped = {}
      
      movies.forEach(movie => {
        // Если у фильма есть жанры
        if (movie.moviegenres && movie.moviegenres.length > 0) {
          movie.moviegenres.forEach(mg => {
            if (mg.genres) {
              const genreName = mg.genres.genrename
              if (!grouped[genreName]) {
                grouped[genreName] = []
              }
              // Добавляем фильм в жанр, если его там ещё нет
              if (!grouped[genreName].find(m => m.movieid === movie.movieid)) {
                grouped[genreName].push(movie)
              }
            }
          })
        }
      })

      // Также создаём категорию "Все фильмы"
      grouped['Все фильмы'] = movies

      console.log('Фильмы по жанрам:', grouped)
      setMoviesByGenre(grouped)
      
      // Первый фильм делаем главным в Hero-секции
      if (movies && movies.length > 0) {
        setFeaturedMovie(movies[0])
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Неожиданная ошибка:', err)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Загрузка...</p>
      </div>
    )
  }

  return (
    <div className="home">
      {/* Приветственная секция с информацией о компании */}
      <WelcomeSection />
      
      {/* Hero-секция с главным фильмом */}
      <HeroSection movie={featuredMovie} />
      
      {/* Ряды фильмов - показываем только "Все фильмы" как "Популярные" */}
      <div className="movies-section">
        {moviesByGenre['Все фильмы'] && moviesByGenre['Все фильмы'].length > 0 ? (
          <MovieRow 
            title="Популярные фильмы" 
            movies={moviesByGenre['Все фильмы'].slice(0, 12)} 
          />
        ) : (
          <div className="container">
            <p className="no-movies">Фильмы не найдены</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home
