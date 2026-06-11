import DefaultPoster from "./assets/DefaultPoster.png";

export default function MovieGrid({ movies, onMovieClick }) {
  if (!movies || movies.length === 0) {
    return <p>No movies found.</p>;
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <button
          key={movie.id}
          className="movie-card"
          type="button"
          onClick={() => onMovieClick(movie)}
        >

          {/* POSTER */}
          <img
            className="movie-poster"
            src={
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                : DefaultPoster
            }
            alt={movie.title}
          />

          {/* INFO */}
          <h3>{movie.title}</h3>

          <p>
            {movie.release_date
              ? movie.release_date.split("-")[0]
              : "Unknown year"}
          </p>

        </button>
      ))}
    </div>
  );
}
