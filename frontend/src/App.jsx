import DesktopNav from "./components/DesktopNav";
import MobileBottomNav from "./components/MobileBottomNav";
import SearchPage from "./pages/SearchPage";
import WatchlistPage from "./pages/WatchlistPage";

function readBootData() {
  const node = document.getElementById("thunder-boot-data");
  if (!node) {
    return null;
  }

  try {
    return JSON.parse(node.textContent);
  } catch {
    return null;
  }
}

export default function App() {
  const boot = readBootData();
  const currentPath = boot?.currentPath || window.location.pathname;
  const user = boot?.user || { isAuthenticated: false, username: "" };
  const urls = boot?.urls || {
    indexUrl: "/",
    watchlistUrl: "/watchlist/",
    logoutUrl: "/accounts/logout/",
    loginUrl: "/accounts/login/",
  };

  if (!user.isAuthenticated) {
    return (
      <main className="thunder-auth-shell">
        <p>Please log in to use Thunder.</p>
        <a href={urls.loginUrl}>Log In</a>
      </main>
    );
  }

  return (
    <div className="thunder-shell">
      <DesktopNav currentPath={currentPath} user={user} urls={urls} />
      <main className="thunder-main">
        {currentPath.startsWith("/watchlist") ? (
          <WatchlistPage />
        ) : (
          <SearchPage />
        )}
      </main>
      <MobileBottomNav currentPath={currentPath} urls={urls} />
    </div>
  );
}
