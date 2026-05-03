import { useEffect, useMemo, useRef, useState } from "react";
import ContentCard from "../components/ContentCard";
import {
  getContentDetails,
  getRecommendations,
  getWatchlistContent,
  toggleWatchlist,
  updateUserRating,
} from "../services/api";

export default function WatchlistPage() {
  const [items, setItems] = useState([]);
  const [mediaType, setMediaType] = useState("movie");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("none");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const ratingUpdateTimersRef = useRef({});

  useEffect(() => {
    return () => {
      Object.values(ratingUpdateTimersRef.current).forEach((timerId) => {
        clearTimeout(timerId);
      });
      ratingUpdateTimersRef.current = {};
    };
  }, []);

  useEffect(() => {
    async function loadWatchlist() {
      try {
        const data = await getWatchlistContent();
        setItems(data.content || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadWatchlist();
  }, []);

  const visibleItems = useMemo(() => {
    let output = items.filter((item) => item.type === mediaType);

    if (query.trim()) {
      const normalized = query.trim().toLowerCase();
      output = output.filter((item) =>
        item.title.toLowerCase().includes(normalized),
      );
    }

    if (sortBy === "alphabetically") {
      output = [...output].sort((a, b) => a.title.localeCompare(b.title));
    }

    if (sortBy === "tmdb_rating") {
      output = [...output].sort(
        (a, b) => Number(b.tmdb_rating) - Number(a.tmdb_rating),
      );
    }

    if (sortBy === "user_rating") {
      output = [...output].sort(
        (a, b) => Number(b.user_rating || 0) - Number(a.user_rating || 0),
      );
    }

    return output;
  }, [items, mediaType, query, sortBy]);

  async function handleToggleWatchlist(content) {
    const action = content.button === "remove" ? "remove" : "add";

    try {
      const data = await toggleWatchlist({ content, action });

      if (data.button === "add") {
        setItems((previous) =>
          previous.filter((item) => item.tmdb_id !== content.tmdb_id),
        );
      } else {
        setItems((previous) => {
          const exists = previous.some(
            (item) => item.tmdb_id === content.tmdb_id,
          );
          if (exists) {
            return previous;
          }
          return [
            {
              ...content,
              button: "remove",
              user_rating: content.user_rating || 0,
            },
            ...previous,
          ];
        });
      }
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRatingChange(tmdbId, value) {
    setItems((previous) =>
      previous.map((item) =>
        item.tmdb_id === tmdbId ? { ...item, user_rating: value } : item,
      ),
    );

    const existingTimer = ratingUpdateTimersRef.current[tmdbId];
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    ratingUpdateTimersRef.current[tmdbId] = setTimeout(async () => {
      try {
        await updateUserRating({ newRating: value, tmdbId });
      } catch (err) {
        setError(err.message);
      }
    }, 300);
  }

  async function handleRecommendations({ tmdbId, type }) {
    const data = await getRecommendations({ tmdbId, type });
    return data.content || [];
  }

  async function handleLoadDetails({ tmdbId, type, title }) {
    const details = await getContentDetails({ tmdbId, type, title });
    setItems((previous) =>
      previous.map((item) =>
        item.tmdb_id === tmdbId ? { ...item, ...details } : item,
      ),
    );
    return details;
  }

  return (
    <section className="thunder-page">
      <div className="thunder-watchlist-toolbar">
        <div className="thunder-toggle-wrap">
          <div
            className="thunder-segmented-row thunder-segmented-row-two"
            role="radiogroup"
            aria-label="Filter watchlist by media type"
          >
            <label className="thunder-segment-option">
              <input
                type="radio"
                name="watchlistMediaType"
                value="movie"
                checked={mediaType === "movie"}
                onChange={() => setMediaType("movie")}
              />
              <span>My Movies</span>
            </label>
            <label className="thunder-segment-option">
              <input
                type="radio"
                name="watchlistMediaType"
                value="tv"
                checked={mediaType === "tv"}
                onChange={() => setMediaType("tv")}
              />
              <span>My TV Shows</span>
            </label>
          </div>
        </div>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value)}
        >
          <option value="none">Sort by Added</option>
          <option value="alphabetically">Alphabetically</option>
          <option value="tmdb_rating">User Rating</option>
          <option value="user_rating">My Rating</option>
        </select>

        <input
          type="search"
          placeholder="Filter watchlist"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      {loading ? <p>Loading watchlist...</p> : null}
      {error ? <p className="thunder-error">{error}</p> : null}

      {!loading && visibleItems.length === 0 ? (
        <p className="thunder-empty">Your watchlist is empty.</p>
      ) : null}

      <div className="thunder-grid">
        {visibleItems.map((content) => (
          <ContentCard
            key={`watchlist-${content.tmdb_id}`}
            content={content}
            onToggleWatchlist={handleToggleWatchlist}
            onRatingChange={handleRatingChange}
            onLoadRecommendations={handleRecommendations}
            onLoadDetails={handleLoadDetails}
            showRecommendations
          />
        ))}
      </div>
    </section>
  );
}
