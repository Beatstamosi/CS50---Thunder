import { useEffect, useRef, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import {
  getContentDetails,
  getGenreSuggestions,
  getRecommendations,
  getSuggestions,
  searchContent,
  toggleWatchlist,
  updateUserRating,
} from "../services/api";
import ContentCard from "../components/ContentCard";
import SearchControls from "../components/SearchControls";

export default function SearchPage() {
  const [searchType, setSearchType] = useState("movie");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(true);
  const [source, setSource] = useState(null);
  const ratingUpdateTimersRef = useRef({});

  useEffect(() => {
    return () => {
      Object.values(ratingUpdateTimersRef.current).forEach((timerId) => {
        clearTimeout(timerId);
      });
      ratingUpdateTimersRef.current = {};
    };
  }, []);

  const debouncedQuery = useDebounce(query, 500);
  const canSearch = debouncedQuery.trim().length > 2;

  useEffect(() => {
    if (!canSearch) {
      setResults([]);
      setError("");
      setIsLastPage(true);
      return;
    }

    runSearch({
      page: 1,
      append: false,
      text: debouncedQuery.trim(),
      type: searchType,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, searchType]);

  async function runSearch({ page, append, text, type }) {
    setLoading(true);
    setError("");

    try {
      const data = await searchContent({
        searchData: text,
        searchType: type,
        page,
      });
      const nextItems = data.content || [];
      setResults((previous) =>
        append ? [...previous, ...nextItems] : nextItems,
      );
      setCurrentPage(page);
      setIsLastPage(data.currentPage === "last_page");
      setSource({ mode: "search", text, type });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function runSuggestions({
    suggestionType,
    keyword,
    page = 1,
    append = false,
  }) {
    setLoading(true);
    setError("");

    try {
      const data = await getSuggestions({ suggestionType, keyword, page });
      const nextItems = data.content || [];
      setResults((previous) =>
        append ? [...previous, ...nextItems] : nextItems,
      );
      setCurrentPage(page);
      setIsLastPage(data.currentPage === "last_page");
      setSource({ mode: "suggestion", suggestionType, keyword });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function runGenre({ genreId, contentType, page = 1, append = false }) {
    setLoading(true);
    setError("");

    try {
      const data = await getGenreSuggestions({ genreId, contentType, page });
      const nextItems = data.content || [];
      setResults((previous) =>
        append ? [...previous, ...nextItems] : nextItems,
      );
      setCurrentPage(page);
      setIsLastPage(data.currentPage === "last_page");
      setSource({ mode: "genre", genreId, contentType });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleShowMore() {
    const nextPage = currentPage + 1;

    if (!source) {
      return;
    }

    setLoadingMore(true);

    try {
      if (source.mode === "search") {
        await runSearch({
          page: nextPage,
          append: true,
          text: source.text,
          type: source.type,
        });
      }

      if (source.mode === "suggestion") {
        await runSuggestions({ ...source, page: nextPage, append: true });
      }

      if (source.mode === "genre") {
        await runGenre({ ...source, page: nextPage, append: true });
      }
    } finally {
      setLoadingMore(false);
    }
  }

  async function handleToggleWatchlist(content) {
    const action = content.button === "remove" ? "remove" : "add";
    try {
      const data = await toggleWatchlist({ content, action });
      setResults((previous) =>
        previous.map((item) => {
          if (item.tmdb_id !== content.tmdb_id) {
            return item;
          }
          return {
            ...item,
            button: data.button,
            user_rating: data.button === "remove" ? item.user_rating || 0 : 0,
          };
        }),
      );
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRatingChange(tmdbId, value) {
    setResults((previous) =>
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
    setResults((previous) =>
      previous.map((item) =>
        item.tmdb_id === tmdbId ? { ...item, ...details } : item,
      ),
    );
    return details;
  }

  return (
    <section className="thunder-page">
      <SearchControls
        searchType={searchType}
        onSearchTypeChange={setSearchType}
        query={query}
        onQueryChange={setQuery}
        onSuggestionClick={(suggestionType, keyword) =>
          runSuggestions({ suggestionType, keyword })
        }
        onGenreClick={(genreId, contentType) =>
          runGenre({ genreId, contentType })
        }
      />

      {loading && results.length === 0 ? (
        <div
          className="thunder-loading-state"
          aria-live="polite"
          aria-busy="true"
        >
          <div className="thunder-spinner" />
        </div>
      ) : null}

      {!loading && results.length === 0 ? (
        <div className="thunder-empty-state">
          <h3>No items yet</h3>
          <p>
            Start by typing a title, choosing a suggestion, or picking a genre.
          </p>
        </div>
      ) : null}

      {error ? <p className="thunder-error">{error}</p> : null}

      <div className="thunder-grid">
        {results.map((content) => (
          <ContentCard
            key={`search-${content.tmdb_id}`}
            content={content}
            onToggleWatchlist={handleToggleWatchlist}
            onRatingChange={handleRatingChange}
            onLoadRecommendations={handleRecommendations}
            onLoadDetails={handleLoadDetails}
            showRecommendations={false}
          />
        ))}
      </div>

      {!isLastPage && results.length > 0 ? (
        <div className="thunder-show-more-wrap">
          <button
            type="button"
            className="thunder-primary-button thunder-show-more-button"
            onClick={handleShowMore}
            disabled={loading || loadingMore}
          >
            {loadingMore ? (
              <>
                <span className="thunder-inline-spinner" aria-hidden="true" />
                <span>Loading more...</span>
              </>
            ) : (
              "Show More"
            )}
          </button>
        </div>
      ) : null}
    </section>
  );
}
