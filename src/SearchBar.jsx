export default function SearchBar({ searchQuery, setSearchQuery }) {
  return (
    <div className="search-bar-div">
        <div className="search-wrapper">
            <input
              type="search"
              aria-label="Search movies by title"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
    </div>
  );
}
