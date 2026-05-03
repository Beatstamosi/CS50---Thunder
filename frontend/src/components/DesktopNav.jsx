export default function DesktopNav({ currentPath, user, urls }) {
  if (!user?.isAuthenticated) {
    return null;
  }

  return (
    <header className="thunder-topnav">
      <a
        className="thunder-logo"
        href={urls.indexUrl}
        aria-label="Go to Search"
      >
        THUNDER
      </a>
      <nav className="thunder-links">
        <a
          className={currentPath === "/" ? "is-active" : ""}
          href={urls.indexUrl}
        >
          Search
        </a>
        <a
          className={currentPath.startsWith("/watchlist") ? "is-active" : ""}
          href={urls.watchlistUrl}
        >
          Watchlist
        </a>
      </nav>
      <div className="thunder-user-area">
        <span>{user.username}</span>
        <a href={urls.logoutUrl}>Log Out</a>
      </div>
    </header>
  );
}
