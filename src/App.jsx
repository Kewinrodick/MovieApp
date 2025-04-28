import { useEffect,useState } from 'react'
import {useDebounce} from 'react-use'
import Search from './components/Search.jsx'
import Spinner from './components/Spinner.jsx'
import MovieCard from './components/MovieCard.jsx';
import { updateSerchCount , getTrendingMovies } from './appwrite.js';


const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method:'GET',
  headers: {
    accept:'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

function App (){
  const[debounceSearchTerm,setDebounceSearchTerm]=useState('')
  const [search,setSearch] = useState('')

  const[movieList,setMovieList]=useState([])
  const [errorMsg,setErrorMsg] = useState('')
  const[isLoading,setIsLoading]=useState(false)

  const[trendingMovies,setTrendingMovies]=useState([])
  const[istrendingMoviesLoading,setIsTrendingMoviesLoading]=useState(true)
  const[trendingMoviesErrorMsg,setTrendingMoviesErrorMsg]=useState('')

  // Debounce the searchTerm to prevent making too many  API requests
  //  by waiting for the user to stop typing  for 500ms
  useDebounce(() => setDebounceSearchTerm(search), 500, [search]);


  
  const fetchMovies = async (query = '') => { 

    setIsLoading(true);
    setErrorMsg('');

    try{
      const endPoint = query
      ?`${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endPoint, API_OPTIONS);

      if(!response.ok){
        throw new("Issue in getting response");
      }

      const data = await response.json();
      
      if(data.response === false){
        setErrorMsg(data.error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);
      
      if(query && data.results.length > 0){
        await updateSerchCount(query,data.results[0]);
      }
    } catch (error) {
      console.error('Error fetching movies:', error.message);
      setErrorMsg("Failed to fetch movies after multiple attempts. Please check your network connection or try again later.");
      
    }
    finally{
      setIsLoading(false);
    }
  };
  
  const loadTrendingMovies = async () => {

    setIsTrendingMoviesLoading(true);
    setTrendingMoviesErrorMsg('');

    try {
      const movies = await getTrendingMovies();
      if(movies.length === 0){
        setTrendingMoviesErrorMsg('Failed to fetch trending movies.');
        return;
      }
      setTrendingMovies(movies);
    }
    catch (error) {
      console.error('Error fetching movies:', error.message);
    }
    finally{
      setIsTrendingMoviesLoading(false);
    }
  }

  useEffect(()=>{
    fetchMovies(debounceSearchTerm)
  }, [debounceSearchTerm])  

  useEffect(()=>{
    loadTrendingMovies();
  },[])

  
  return( 
     <main>
    <div className="pattern">
   
    </div>

    <div className="wrapper">
      <header>
        <img src="./hero-img.png" alt="Hero Banner"/>
        <h1>Find <span className="text-gradient">Movies</span> You'll Enjoy Without The Hassle</h1>
        <Search searchTerm = {search} setSearchTerm = {setSearch}/>
      </header>

      {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>
            
              {istrendingMoviesLoading ?(

                <Spinner/>
              )
              
              :errorMsg ? (<p className='text-red-600'>{trendingMoviesErrorMsg}</p>)

              :(<ul>
                  {
                    trendingMovies.map((movie,index) => (
                    <li key={movie.$id}>
                      <p>{index+1}</p>
                      <img src={movie.poster_url} alt={movie.title} />
                    </li> 
                      ))
                  }
                </ul>)
              } 
          </section>
        )}
      <section className="all-movies">
        <h2 >All Movies</h2>
        {isLoading ?(
          <Spinner/>
        )
          :errorMsg ? (<p className='text-red-600'>{errorMsg}</p>)
          :(
            <ul>
              {movieList.map((movie)=>(
               <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )
        }
      </section>
      
    </div>

   
  </main>
    )

}


export default App
