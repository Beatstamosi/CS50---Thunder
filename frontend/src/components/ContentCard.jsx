import { useEffect, useRef, useState } from "react";

function CircularRatingInput({ value = 0, onChange, label }) {
  const [isDragging, setIsDragging] = useState(false);
  const svgRef = useRef(null);

  const size = 88;
  const strokeWidth = 7;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const safeValue = Math.max(0, Math.min(10, Number(value) || 0));
  const progress = safeValue / 10;
  const dashOffset = circumference * (1 - progress);

  function updateFromPointer(clientX, clientY) {
    if (!svgRef.current) {
      return;
    }

    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const radians = Math.atan2(clientY - centerY, clientX - centerX);
    const degrees = ((radians * 180) / Math.PI + 90 + 360) % 360;
    const nextValue = Number(((degrees / 360) * 10).toFixed(1));

    onChange(Math.max(0, Math.min(10, nextValue)));
  }

  function handlePointerDown(event) {
    setIsDragging(true);
    updateFromPointer(event.clientX, event.clientY);
  }

  function handlePointerMove(event) {
    if (!isDragging) {
      return;
    }

    updateFromPointer(event.clientX, event.clientY);
  }

  function stopDragging() {
    setIsDragging(false);
  }

  function handleKeyDown(event) {
    if (
      event.key !== "ArrowRight" &&
      event.key !== "ArrowUp" &&
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowDown"
    ) {
      return;
    }

    event.preventDefault();

    const direction =
      event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : -1;
    const nextValue = Math.max(
      0,
      Math.min(10, Number((safeValue + direction * 0.1).toFixed(1))),
    );
    onChange(nextValue);
  }

  return (
    <div className="thunder-rating-block">
      <p className="thunder-meta">{label}</p>
      <div
        role="slider"
        tabIndex={0}
        aria-valuemin={0}
        aria-valuemax={10}
        aria-valuenow={safeValue}
        aria-label={label}
        className="thunder-rating-circle-input"
        onKeyDown={handleKeyDown}
      >
        <svg
          ref={svgRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className={`thunder-rating-svg ${isDragging ? "is-dragging" : ""}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDragging}
          onPointerLeave={stopDragging}
          onPointerCancel={stopDragging}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="thunder-rating-track"
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            className="thunder-rating-progress"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <span className="thunder-rating-value">{safeValue.toFixed(1)}</span>
      </div>
    </div>
  );
}

function RatingBadge({ value }) {
  const score = Number.isFinite(Number(value)) ? Number(value) : 0;
  return (
    <div className="thunder-rating-badge">
      <strong>{score === 10 ? 10 : score.toFixed(1)}</strong>
    </div>
  );
}

export default function ContentCard({
  content,
  onToggleWatchlist,
  onRatingChange,
  onLoadRecommendations,
  onLoadDetails,
  showRecommendations = false,
}) {
  const [isMobileInteraction, setIsMobileInteraction] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 1024 : false,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [openRecommendations, setOpenRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const hoverTimeoutRef = useRef(null);
  const recommendationsSectionRef = useRef(null);

  const displayContent = detailData ? { ...content, ...detailData } : content;
  const hasWatchlistAccess = Boolean(onToggleWatchlist);
  const actionText =
    displayContent.button === "remove"
      ? "Remove from Watchlist"
      : "Add to Watchlist";

  const hasDetailData =
    Boolean(displayContent.actors) ||
    Boolean(displayContent.director) ||
    (displayContent.type === "tv" && displayContent.seasons != null);

  useEffect(() => {
    function handleResize() {
      setIsMobileInteraction(window.innerWidth <= 1024);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    document.body.classList.add("thunder-no-scroll");
    document.documentElement.classList.add("thunder-no-scroll");

    return () => {
      document.body.classList.remove("thunder-no-scroll");
      document.documentElement.classList.remove("thunder-no-scroll");
    };
  }, [isOpen]);

  useEffect(() => {
    async function loadDetails() {
      if (!isOpen || hasDetailData || !onLoadDetails || detailLoading) {
        return;
      }

      setDetailLoading(true);
      try {
        const details = await onLoadDetails({
          tmdbId: content.tmdb_id,
          type: content.type,
          title: content.title,
        });
        setDetailData(details || {});
      } finally {
        setDetailLoading(false);
      }
    }

    loadDetails();
  }, [
    isOpen,
    hasDetailData,
    onLoadDetails,
    detailLoading,
    content.tmdb_id,
    content.type,
    content.title,
  ]);

  function handleTileMouseEnter() {
    if (isMobileInteraction) {
      return;
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, 700);
  }

  function handleTileMouseLeave() {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  }

  function handleTileClick() {
    if (!isMobileInteraction) {
      return;
    }

    setIsOpen(true);
  }

  function closeDetailCard() {
    setIsOpen(false);
  }

  async function handleOpenRecommendations() {
    const nextOpenState = !openRecommendations;
    setOpenRecommendations(nextOpenState);

    if (
      nextOpenState &&
      isMobileInteraction &&
      recommendationsSectionRef.current
    ) {
      requestAnimationFrame(() => {
        recommendationsSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end",
        });
      });
    }

    if (!nextOpenState || recommendations.length || !onLoadRecommendations) {
      return;
    }

    setRecommendationLoading(true);
    try {
      const recommendationData = await onLoadRecommendations({
        tmdbId: content.tmdb_id,
        type: content.type,
      });
      setRecommendations(recommendationData || []);
    } finally {
      setRecommendationLoading(false);
    }
  }

  return (
    <>
      <article
        className="thunder-poster-tile"
        onMouseEnter={handleTileMouseEnter}
        onMouseLeave={handleTileMouseLeave}
        onClick={handleTileClick}
      >
        {content.image_link ? (
          <img
            src={displayContent.image_link}
            alt={displayContent.title}
            className="thunder-poster-image"
          />
        ) : (
          <div className="thunder-img-fallback" />
        )}
        <RatingBadge value={displayContent.tmdb_rating} />
      </article>

      {isOpen ? (
        <>
          <div className="thunder-card-backdrop" />
          <article
            className="thunder-detail-card"
            onMouseLeave={!isMobileInteraction ? closeDetailCard : undefined}
          >
            <div className="thunder-detail-grid">
              <div className="thunder-detail-image-wrap">
                {content.image_link ? (
                  <img
                    src={displayContent.image_link}
                    alt={displayContent.title}
                    className="thunder-detail-image"
                    onClick={isMobileInteraction ? closeDetailCard : undefined}
                  />
                ) : (
                  <div className="thunder-img-fallback" />
                )}
              </div>

              <div className="thunder-detail-main">
                <h3>{displayContent.title}</h3>
                <p className="thunder-meta">
                  {displayContent.release_date || "Unknown release date"}
                </p>
                {displayContent.seasons ? (
                  <p className="thunder-meta">
                    {displayContent.seasons} seasons · {displayContent.episodes}{" "}
                    episodes
                  </p>
                ) : null}

                <div className="thunder-genre-row">
                  {(displayContent.genres || []).map((genre) => (
                    <span
                      key={`${displayContent.tmdb_id}-${genre}`}
                      className="thunder-pill"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                <p className="thunder-overview">{displayContent.overview}</p>
                <p className="thunder-meta">
                  Starring:{" "}
                  {detailLoading
                    ? "Loading..."
                    : displayContent.actors || "Unknown"}
                </p>
                <p className="thunder-meta">
                  {displayContent.type === "movie"
                    ? "Director"
                    : "Executive Producer"}
                  :{" "}
                  {detailLoading
                    ? "Loading..."
                    : displayContent.director || "Unknown"}
                </p>

                <div className="thunder-card-actions">
                  <a
                    href={
                      displayContent.trailer_link ||
                      `https://www.youtube.com/results?search_query=${displayContent.title}+official+trailer`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="thunder-ghost-button"
                  >
                    Watch Trailer
                  </a>

                  {hasWatchlistAccess ? (
                    <button
                      type="button"
                      className={`thunder-primary-button ${displayContent.button === "remove" ? "is-remove" : ""}`}
                      onClick={() => onToggleWatchlist(displayContent)}
                    >
                      {actionText}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className="thunder-detail-ratings">
                <div className="thunder-rating-pair">
                  <div className="thunder-rating-block">
                    <p className="thunder-meta">User Rating</p>
                    <div className="thunder-rating-circle">
                      {Number(displayContent.tmdb_rating).toFixed(1)}
                    </div>
                  </div>

                  {displayContent.button === "remove" && onRatingChange ? (
                    <CircularRatingInput
                      value={displayContent.user_rating || 0}
                      label="My Rating"
                      onChange={(nextValue) =>
                        onRatingChange(displayContent.tmdb_id, nextValue)
                      }
                    />
                  ) : null}
                </div>
              </div>
            </div>

            {showRecommendations ? (
              <div
                className="thunder-recommendations-wrap"
                ref={recommendationsSectionRef}
              >
                <button
                  type="button"
                  className="thunder-ghost-button"
                  onClick={handleOpenRecommendations}
                >
                  {openRecommendations
                    ? "Hide Recommendations"
                    : `Show Recommendations for ${displayContent.title}`}
                </button>
                {openRecommendations ? (
                  <div className="thunder-recommendations-grid">
                    {recommendationLoading ? (
                      <div
                        className="thunder-recommendations-loading"
                        aria-live="polite"
                        aria-busy="true"
                      >
                        <div className="thunder-spinner" />
                      </div>
                    ) : null}
                    {!recommendationLoading && recommendations.length === 0 ? (
                      <p>No recommendations found.</p>
                    ) : null}
                    {recommendations.map((item) => (
                      <div
                        key={`rec-${item.tmdb_id}`}
                        className="thunder-recommendation-card"
                      >
                        <div className="thunder-recommendation-image-wrap">
                          {item.image_link ? (
                            <img src={item.image_link} alt={item.title} />
                          ) : (
                            <div className="thunder-img-fallback small" />
                          )}
                          <span className="thunder-recommendation-rating">
                            {Number(item.tmdb_rating || 0).toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <h4>{item.title}</h4>
                          <p>{item.overview}</p>
                          {onToggleWatchlist ? (
                            <button
                              type="button"
                              className="thunder-primary-button"
                              onClick={() => onToggleWatchlist(item)}
                            >
                              Add to Watchlist
                            </button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </article>
        </>
      ) : null}
    </>
  );
}
