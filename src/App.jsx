import { useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import MovieGrid from "./MovieGrid";
import SearchBar from "./SearchBar";
import DefaultPoster from "./assets/DefaultPoster.png";
import "./index.css";
import "./modal.css";
import "./searchbar.css";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

const GENRE_MAP = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Documentary: 99,
  Drama: 18,
  Family: 10751,
  Fantasy: 14,
  History: 36,
  Horror: 27,
  Music: 10402,
  Mystery: 9648,
  Romance: 10749,
  "Science Fiction": 878,
  Thriller: 53,
  War: 10752,
  Western: 37,
  "TV Movie": 10770
};

function readFavorites() {
  try {
    return JSON.parse(localStorage.getItem("papyrusFavorites") || "[]");
  } catch {
    return [];
  }
}

export default function App() {
  const [filters, setFilters] = useState({ menu: "Home", categories: [] });
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState([]);
  const [favorites, setFavorites] = useState(readFavorites);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const moviesRef = useRef(null);

  const isHome = filters.menu === "Home";
  const isFavorites = filters.menu === "Favorites";
  const isSearch = filters.menu === "Search";

  const genreIds = useMemo(
    () => filters.categories.map((name) => GENRE_MAP[name]).filter(Boolean),
    [filters.categories]
  );
  const allGenresSelected = genreIds.length === Object.keys(GENRE_MAP).length;
  const genreQuery =
    genreIds.length > 0 && !allGenresSelected ? `&with_genres=${genreIds.join(",")}` : "";
  const filteredFavorites = useMemo(
    () =>
      genreIds.length > 0 && !allGenresSelected
        ? favorites.filter((movie) => {
            const ids = movie.genre_ids || movie.genres?.map((genre) => genre.id) || [];
            return ids.some((id) => genreIds.includes(id));
          })
        : favorites,
    [allGenresSelected, favorites, genreIds]
  );
  const visibleMovies = isFavorites ? filteredFavorites : isSearch && !searchQuery.trim() ? [] : movies;

  useEffect(() => {
    localStorage.setItem("papyrusFavorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    function closeOnEscape(event) {
      if (event.key === "Escape") setSelectedMovie(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  useEffect(() => {
    if (!isHome) return;

    const controller = new AbortController();
    async function loadFeaturedMovie() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=1`, {
          signal: controller.signal
        });
        if (!response.ok) throw new Error("Could not load the featured movie.");
        const data = await response.json();
        const results = data.results || [];
        setFeaturedMovie(results[Math.floor(Math.random() * results.length)] || null);
      } catch (requestError) {
        if (requestError.name !== "AbortError") setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadFeaturedMovie();
    return () => controller.abort();
  }, [isHome]);

  useEffect(() => {
    if (isHome || isFavorites || !API_KEY) return;
    if (isSearch && !searchQuery.trim()) return;

    const controller = new AbortController();
    async function loadMovies() {
      setLoading(true);
      setError("");

      let url;
      if (isSearch) {
        url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchQuery.trim())}&page=${page}`;
      } else {
        url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&page=${page}${genreQuery}`;
        if (filters.menu === "Popular") url += "&sort_by=popularity.desc";
        if (filters.menu === "Recent") {
          const today = new Date().toISOString().split("T")[0];
          url += `&sort_by=release_date.desc&release_date.lte=${today}`;
        }
      }

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error("Could not load movies. Please try again.");
        const data = await response.json();
        const results = data.results || [];
        setMovies((current) => (page === 1 ? results : [...current, ...results]));
        setHasMore(page < data.total_pages);
      } catch (requestError) {
        if (requestError.name !== "AbortError") setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadMovies();
    return () => controller.abort();
  }, [filters.menu, genreQuery, isFavorites, isHome, isSearch, page, searchQuery]);

  useEffect(() => {
    const container = moviesRef.current;
    if (!container) return undefined;

    function handleScroll() {
      const nearBottom =
        container.scrollTop + container.clientHeight >= container.scrollHeight - 140;
      if (nearBottom && !loading && hasMore && !isFavorites && !isHome && movies.length > 0) {
        setPage((current) => current + 1);
      }
    }

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [hasMore, isFavorites, isHome, loading, movies.length]);

  async function handleMovieClick(movie) {
    setError("");
    try {
      const [detailsResponse, creditsResponse] = await Promise.all([
        fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}`),
        fetch(`${BASE_URL}/movie/${movie.id}/credits?api_key=${API_KEY}`)
      ]);
      if (!detailsResponse.ok || !creditsResponse.ok) throw new Error("Could not load movie details.");
      const details = await detailsResponse.json();
      const credits = await creditsResponse.json();
      setSelectedMovie({
        ...movie,
        genres: details.genres || [],
        runtime: details.runtime,
        cast: credits.cast?.slice(0, 5) || []
      });
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function toggleFavorite(movie) {
    setFavorites((current) =>
      current.some((item) => item.id === movie.id)
        ? current.filter((item) => item.id !== movie.id)
        : [
            ...current,
            {
              ...movie,
              genre_ids: movie.genre_ids || movie.genres?.map((genre) => genre.id) || []
            }
          ]
    );
  }

  function handleFilterChange(nextFilters) {
    setFilters(nextFilters);
    setMovies([]);
    setPage(1);
    setHasMore(true);
    setError("");
    if (nextFilters.menu !== "Search") setSearchQuery("");
  }

  if (!API_KEY) {
    return (
      <main className="setup-message">
        <h1>Papyrus needs a TMDB API key</h1>
        <p>Create a <code>.env.local</code> file using <code>.env.example</code>, then restart the app.</p>
      </main>
    );
  }

  return (
    <div className="app-container">
      <Sidebar onFilterChange={handleFilterChange} favoriteCount={favorites.length} />

      <div className="main-area">
        {isSearch && <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />}

        <header className="view-header">
          <div>
            <p>Movie discovery</p>
            <h1>{filters.menu}</h1>
          </div>
          <span>{isHome ? "Featured recommendation" : `${visibleMovies.length} movies loaded`}</span>
        </header>

        {error && <div className="status-message error">{error}</div>}

        <div className="movies-section" ref={moviesRef}>
          {isHome ? (
            <section className="home-container">
              <div>
                <p className="home-kicker">Welcome to Papyrus</p>
                <h2>Find a movie without the endless scrolling.</h2>
                <p className="home-subtitle">
                  Browse popular movies, discover recent releases and keep your favorites together.
                </p>
              </div>

              {featuredMovie && (
                <button
                  className="home-featured"
                  type="button"
                  onClick={() => handleMovieClick(featuredMovie)}
                >
                  <img
                    src={
                      featuredMovie.poster_path
                        ? `https://image.tmdb.org/t/p/w500${featuredMovie.poster_path}`
                        : DefaultPoster
                    }
                    alt={`${featuredMovie.title} poster`}
                  />
                  <div className="home-featured-info">
                    <span>Featured movie</span>
                    <h3>{featuredMovie.title}</h3>
                    <p>{featuredMovie.overview || "Open the movie to view more information."}</p>
                    <strong>Rating {featuredMovie.vote_average?.toFixed(1) || "N/A"} / 10</strong>
                  </div>
                </button>
              )}
            </section>
          ) : (
            <MovieGrid movies={visibleMovies} onMovieClick={handleMovieClick} />
          )}

          {loading && <div className="status-message">Loading movies...</div>}
          {!loading && !hasMore && !isFavorites && !isHome && visibleMovies.length > 0 && (
            <div className="status-message">You have reached the end of this list.</div>
          )}
        </div>
      </div>

      {selectedMovie && (
        <div className="modal-overlay" role="presentation" onMouseDown={() => setSelectedMovie(null)}>
          <section
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="movie-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              type="button"
              aria-label="Close movie details"
              onClick={() => setSelectedMovie(null)}
            >
              ×
            </button>
            <div className="modal-left">
              <img
                src={
                  selectedMovie.poster_path
                    ? `https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`
                    : DefaultPoster
                }
                alt={`${selectedMovie.title} poster`}
              />
            </div>
            <div className="modal-right">
              <h2 id="movie-title">{selectedMovie.title}</h2>
              <p className="overview">{selectedMovie.overview || "No description available."}</p>
              <div className="rating-row">
                <button className="fav-btn" type="button" onClick={() => toggleFavorite(selectedMovie)}>
                  {favorites.some((movie) => movie.id === selectedMovie.id)
                    ? "Remove from Favorites"
                    : "Add to Favorites"}
                </button>
                <div className="rating">
                  <span className="rating-score">
                    {selectedMovie.vote_count > 0 ? selectedMovie.vote_average.toFixed(1) : "N/A"}
                  </span>
                  <span>/ 10</span>
                  <small>
                    {selectedMovie.vote_count > 0 ? `${selectedMovie.vote_count} reviews` : "No reviews"}
                  </small>
                </div>
              </div>
              <dl className="movie-grid-info">
                <div><dt>Age rating</dt><dd>{selectedMovie.adult ? "18+" : "PG-13"}</dd></div>
                <div><dt>Release</dt><dd>{selectedMovie.release_date || "N/A"}</dd></div>
                <div><dt>Runtime</dt><dd>{selectedMovie.runtime ? `${selectedMovie.runtime} minutes` : "N/A"}</dd></div>
                <div><dt>Genres</dt><dd>{selectedMovie.genres?.map((genre) => genre.name).join(", ") || "N/A"}</dd></div>
              </dl>
              <div className="cast-panel">
                <strong>Cast</strong>
                <p>{selectedMovie.cast?.map((actor) => actor.name).join(", ") || "N/A"}</p>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
