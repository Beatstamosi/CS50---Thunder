import { GENRES, SUGGESTIONS } from "../constants";

export default function SearchControls({
  searchType,
  onSearchTypeChange,
  query,
  onQueryChange,
  onSuggestionClick,
  onGenreClick,
}) {
  const placeholderByType = {
    movie: "Search for specific Movie",
    tv: "Search for specific TV Show",
  };

  return (
    <section className="thunder-controls">
      <div
        className="thunder-segmented-row"
        role="radiogroup"
        aria-label="Search category"
      >
        <label className="thunder-segment-option">
          <input
            type="radio"
            name="searchType"
            value="movie"
            checked={searchType === "movie"}
            onChange={() => onSearchTypeChange("movie")}
          />
          <span>Movies</span>
        </label>
        <label className="thunder-segment-option">
          <input
            type="radio"
            name="searchType"
            value="tv"
            checked={searchType === "tv"}
            onChange={() => onSearchTypeChange("tv")}
          />
          <span>TV Shows</span>
        </label>
      </div>

      <div className="thunder-search-row">
        <input
          className="thunder-search-input"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={placeholderByType[searchType]}
        />
      </div>

      <>
        <div className="thunder-chip-row">
          {SUGGESTIONS[searchType].map((item) => (
            <button
              type="button"
              className="thunder-chip"
              key={`${searchType}-${item.id}`}
              onClick={() => onSuggestionClick(item.id, searchType)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="thunder-genre-grid">
          {GENRES[searchType].map((item) => (
            <button
              type="button"
              key={`${searchType}-genre-${item.id}`}
              className="thunder-genre"
              onClick={() => onGenreClick(item.id, searchType)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </>
    </section>
  );
}
