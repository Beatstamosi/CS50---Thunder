function getCsrfToken() {
  const match = document.cookie.match(/csrftoken=([^;]+)/);
  return match ? match[1] : "";
}

async function request(url, options = {}) {
  const response = await fetch(url, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCsrfToken(),
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export function searchContent(payload) {
  return request("/search/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getSuggestions(payload) {
  return request("/get-suggestions/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getGenreSuggestions(payload) {
  return request("/get-genre-suggestions/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function toggleWatchlist(payload) {
  return request("/toggle-watchlist/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateUserRating(payload) {
  return request("/update-user-rating/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getRecommendations(payload) {
  return request("/recommendations/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getContentDetails(payload) {
  return request("/content-details/", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getWatchlistContent() {
  return request("/watchlist-content/", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
}
