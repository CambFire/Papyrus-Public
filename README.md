# Papyrus Movie Search

Papyrus is the React application selected for the Human-Computer Interaction group assessment. It uses the TMDB API to provide movie discovery, search, filtering, details and favorites.

## Requirements

- Node.js
- npm
- A TMDB API key

## Setup

1. Copy `.env.example` to `.env.local`.
2. Add the TMDB API key to `.env.local`.
3. Install dependencies and start the development server:

```bash
npm install
npm run dev
```

## Available scripts

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Implemented scenarios

- Navigate between Home, Favorites, Popular, Recent and Search.
- Filter Popular, Recent and Favorites by genre.
- Search movies by title.
- Open movie details by selecting a movie card.
- View movie overview, rating, release date, runtime, genres and cast.
- Add and remove favorites.
- Keep favorites after refreshing the browser.
- Load additional results using infinite scroll.
- Display a fallback poster when TMDB does not provide an image.

## Project structure

- `src/App.jsx`: API requests, application state and main interactions.
- `src/Sidebar.jsx`: navigation and genre filters.
- `src/SearchBar.jsx`: controlled search input.
- `src/MovieGrid.jsx`: movie result cards.
- `src/index.css`, `src/Sidebar.css`, `src/searchbar.css`, `src/modal.css`: responsive visual styling.
- `src/assets`: local icons and poster fallback.

Do not include `node_modules`, `.env.local` or `dist` in the final code submission.

