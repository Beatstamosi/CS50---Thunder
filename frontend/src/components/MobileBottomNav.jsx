import { FiSearch, FiBookmark } from "react-icons/fi";

export default function MobileBottomNav({ currentPath, urls }) {
  const isWatchlist = currentPath.startsWith("/watchlist");

  return (
    <nav className="thunder-mobile-nav" aria-label="Mobile navigation">
      <a href={urls.indexUrl} className={!isWatchlist ? "is-active" : ""}>
        <FiSearch size={20} />
        <span>Search</span>
      </a>
      <a href={urls.watchlistUrl} className={isWatchlist ? "is-active" : ""}>
        <FiBookmark size={20} />
        <span>Watchlist</span>
      </a>
    </nav>
  );
}
