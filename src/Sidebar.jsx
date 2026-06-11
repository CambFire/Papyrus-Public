import { useState } from "react";
import "./Sidebar.css";
import HomeIcon from "./assets/HomeIcon.svg";
import PopularIcon from "./assets/PopularIcon.svg";
import RecentIcon from "./assets/RecentIcon.svg";
import FavoritesIcon from "./assets/FavoritesIcon.svg";
import SearchIcon from "./assets/SearchIcon.svg";
const MENU_ITEMS = ["Home", "Favorites", "Popular", "Recent", "Search"];

const CATEGORIES = [
  "Comedy", "Action", "Family", "Crime", "Music", "Fantasy",
  "TV Movie", "Mystery", "Animation", "Science Fiction",
  "Drama", "Western", "Horror", "Adventure",
  "Documentary", "History", "Romance", "War"
];

const Sidebar = ({ onFilterChange, onSearchMode, favoriteCount = 0 }) => {
  const [activeMenu, setActiveMenu] = useState("Home");
  const [selectedCategories, setSelectedCategories] = useState([]);

  const handleMenuChange = (menu) => {
    setActiveMenu(menu);

    //  SPECIAL CASE: SEARCH
    if (menu === "Search") {
      onSearchMode?.(true);
      onFilterChange?.({
        menu,
        categories: selectedCategories
      });
      return;
    }

    // normal mode
    onSearchMode?.(false);

    onFilterChange?.({
      menu,
      categories: selectedCategories
    });
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) => {
      const updated = prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category];

      onFilterChange?.({
        menu: activeMenu,
        categories: updated
      });

      return updated;
    });
  };

  const selectAll = () => {
    setSelectedCategories(CATEGORIES);

    onFilterChange?.({
      menu: activeMenu,
      categories: CATEGORIES
    });
  };

  const clearAll = () => {
    setSelectedCategories([]);

    onFilterChange?.({
      menu: activeMenu,
      categories: []
    });
  };

  return (
    <div className="sidebar">

          {/* MENU */}
<div className="menu">
  {MENU_ITEMS.map((item) => {
    const getIcon = () => {
      switch (item) {
        case "Home":
          return <img src={HomeIcon} alt="home" />;
        case "Popular":
          return <img src={PopularIcon} alt="popular" />;
        case "Recent":
          return <img src={RecentIcon} alt="recent" />;
        case "Favorites":
          return <img src={FavoritesIcon} alt="favorites" />;
        case "Search":
          return <img src={SearchIcon} alt="search" />;
        default:
          return null;
      }
    };

    return (
      <button
        key={item}
        className={`menu-item ${activeMenu === item ? "active" : ""}`}
        onClick={() => handleMenuChange(item)}
      >
        {getIcon()}
        <span>{item}</span>
        {item === "Favorites" && favoriteCount > 0 && (
          <em className="favorite-count">{favoriteCount}</em>
        )}
      </button>
    );
  })}
</div>

      {/* ONLY SHOW CATEGORIES WHEN NOT SEARCHING */}
        <div className="categories-panel">

          <div className="controls">
            <button onClick={clearAll}>Clear All</button>
            <button onClick={selectAll}>Select All</button>
          </div>

          <div className="categories">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`category ${
                  selectedCategories.includes(cat) ? "selected" : ""
                }`}
                onClick={() => toggleCategory(cat)}
                aria-pressed={selectedCategories.includes(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

        </div>
      
    </div>
  );
};

export default Sidebar;
