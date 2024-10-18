document.addEventListener("DOMContentLoaded", () => {
    /**
     * Initialize event listeners and set up the search bar.
     */

    // Javascript for Index Page
    if (currentPage === "/") {
        // change text of search bar
        changePlaceholderSearchbar();

        // create instance of search bar and set delay
        const searchbar = document.getElementById("search-bar");
        searchbar.addEventListener("keyup", debounce(getSearchInput, 500));

        // set up suggestion buttons movie
        document.getElementById("movies_now_playing").addEventListener("click", prepareSuggestions);
        document.getElementById("movies_upcoming").addEventListener("click", prepareSuggestions);
        document.getElementById("movies_popular").addEventListener("click", prepareSuggestions);
        document.getElementById("movies_top_rated").addEventListener("click", prepareSuggestions);

        // set up suggestions buttons tv
        document.getElementById("tv_airing_today").addEventListener("click", prepareSuggestions);
        document.getElementById("tv_on_the_air").addEventListener("click", prepareSuggestions);
        document.getElementById("tv_popular").addEventListener("click", prepareSuggestions);
        document.getElementById("tv_top_rated").addEventListener("click", prepareSuggestions);

        // set up genre-search buttons movie
        document.querySelectorAll("#choices-genre-suggestions-movie .genre-button").forEach(button => {
            button.addEventListener("click", () => {
                const genreId = button.id;
                const contentType = "movie";
                getGenreSuggestion(genreId, contentType);
            })
        })

        // set up genre-search buttons tv
        document.querySelectorAll("#choices-genre-suggestions-tv .genre-button").forEach(button => {
            button.addEventListener("click", () => {
                const genreId = button.id;
                const contentType = "tv";
                getGenreSuggestion(genreId, contentType);
            })
        });
    } 
    // Watchlist Page Logic
    else if (currentPage === "/watchlist/") {

        // set up toggle switch on watchlist
        const toggle = document.getElementById("toggle");

        // initialize view
        updateVisibilityWatchlistContent(toggle);

        toggle.addEventListener("change", () => {
            updateVisibilityWatchlistContent(toggle);
        })
    }
});


function prepareSuggestions(event) {
    /**
     * Prepare and fetch content suggestions based on the button clicked.

     Args:
         event: The click event triggered by the button.
     */

    let suggestionType, keyword;

    if (event.target.id.startsWith("movies_")) {
        suggestionType = event.target.id.replace("movies_", "");
        keyword = "movie";
    } else if (event.target.id.startsWith("tv_")) {
        suggestionType = event.target.id.replace("tv_", "");
        keyword = "tv";
    }
    
    getContentSuggestions(suggestionType, keyword);
}


function changePlaceholderSearchbar() {
    /**
     * Change the placeholder text of the search bar based on selected search type.
     */

    const radioMovies = document.getElementById("movies");
    const radioTv = document.getElementById("tvshow");
    const radioPerson = document.getElementById("person");
    const searchBar = document.getElementById("search-bar");
    const movieSuggestions = document.getElementById("choices-movie-suggestions");
    const tvSuggestions = document.getElementById("choices-tv-suggestions");
    const genreSuggestionsMovie = document.getElementById("choices-genre-suggestions-movie");
    const genreSuggestionsTv = document.getElementById("choices-genre-suggestions-tv");


    radioMovies.addEventListener("click", () =>{
        searchBar.placeholder = "Search for specific Movie";

        searchBar.value = "";

        // in case user was looking for a tv show and wants to see if movies exist with his query
        getSearchInput();

        movieSuggestions.style.display = "flex";
        movieSuggestions.style.visibility = "visible";

        tvSuggestions.style.display = "none";
        tvSuggestions.style.visibility = "hidden";

        genreSuggestionsMovie.style.display = "flex";
        genreSuggestionsMovie.style.display = "visible";

        genreSuggestionsTv.style.display = "none";
        genreSuggestionsTv.style.display = "hidden";

    })

    radioTv.addEventListener("click", () => {
        searchBar.placeholder = "Search for specific TV Show";

        // in case user was looking for a movie and wants to see if tv shows exist with his query
        getSearchInput();

        movieSuggestions.style.display = "none";
        movieSuggestions.style.visibility = "hidden";

        tvSuggestions.style.display = "flex";
        tvSuggestions.style.visibility = "visible";

        genreSuggestionsMovie.style.display = "none";
        genreSuggestionsMovie.style.display = "hidden";

        genreSuggestionsTv.style.display = "flex";
        genreSuggestionsTv.style.display = "visible";
    })

    radioPerson.addEventListener("click", () => {
        searchBar.placeholder = "Search for Filmographie of Actor/Director";

        searchBar.value = "";

        clearSuggestions();

        movieSuggestions.style.display = "none";
        movieSuggestions.style.visibility = "hidden";

        tvSuggestions.style.display = "none";
        tvSuggestions.style.visibility = "hidden";

        genreSuggestionsMovie.style.display = "none";
        genreSuggestionsMovie.style.display = "hidden";

        genreSuggestionsTv.style.display = "none";
        genreSuggestionsTv.style.display = "hidden";
    })
}


function debounce(func, delay) {
    /**
     * Create a debounced version of a function to limit its execution rate.

     Args:
         func: The function to debounce.
         delay: The delay in milliseconds.

     Returns:
         Function: A debounced version of the provided function.
     */

    let timer;
    return(...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this. args);
        }, delay);
    };
}


function getSearchInput() {
    /**
     * Retrieve user input from the search bar and trigger a search if input is valid.
     */

    const searchbar = document.getElementById("search-bar");
    const searchdata = searchbar.value.trim();

    if (searchdata.length > 2) {
        const selectedRadio = document.querySelector('input[name="search"]:checked');
        let searchType = selectedRadio ? selectedRadio.value : "movie"

        if (searchType) {
            fetchSearchData(searchdata, searchType);
        }

    } else {
        clearSuggestions();
    }
}


function clearSuggestions() {
    /**
     * Clear any existing search suggestions from the UI.
     */

    // clear out search results
    document.getElementById("search-results").innerHTML = "";

    // clear out show more button
    const showMoreButton = document.querySelector(".container-show-more-button")
    if (showMoreButton) {
        showMoreButton.remove()
    }
}

function placeholderSearch() {
    // check if placeholder already exists
    const placeholderLoadingExists = document.getElementById("placeholder-loading-screen-search-page")

    if (placeholderLoadingExists) {
        document.getElementById("placeholder-loading-screen-search-page").remove();
    }
    
    // Create placeholder while loading
    const placeholderLoading = document.createElement("div");
    placeholderLoading.className = "loading-placeholder search";
    placeholderLoading.setAttribute("id", "placeholder-loading-screen-search-page")

    const spinner = document.createElement("div");
    spinner.className = "loading-spinner";

    // Append spinner and text
    placeholderLoading.append(spinner);

    const searchResultsloaded = document.querySelector(".container-show-more-button");
    
    document.getElementById("placeholder-loading-animation").append(placeholderLoading);

}


function placeholderSearchRemove() {
    document.getElementById("placeholder-loading-screen-search-page").remove();
}


function fetchSearchData(searchData, searchType, page = 1) {
    /**
     * Fetch search data from the server based on user input.

     Args:
         searchData: The search query input by the user.
         searchType: The type of content to search for (e.g., movie, TV).
         page: The page number for pagination (default is 1).
     */

    // create placeholder while loading
    placeholderSearch();

    if (page === 1) {
        clearSuggestions();
    }

    console.log(searchData);
    console.log(searchType);

    // send fetch request for search with value
    fetch("/search/", {
        method: "POST",
        body: JSON.stringify({
            searchData: searchData,
            searchType: searchType,
            page: page
        })
    }).then(async response => {
        const data = await response.json();
        if (response.ok) {

            // for each movie from request render div
            const futureCall = "Search";

            showSuggestions(data, futureCall, searchData, searchType);
            placeholderSearchRemove();

        } else {
            alert(data.error);
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    })
}


function showSuggestions(data, futureCall, fInput1, fInput2) {
    /**
     * Display search suggestions in the UI based on the fetched data.

     Args:
         data: The data containing search results.
         futureCall: A string indicating the type of future call (e.g., "Search").
         fInput1: The first input parameter for future calls.
         fInput2: The second input parameter for future calls.
     */


    // if exists hide existing showmore button
    const existingShowMoreButton = document.querySelector(".container-show-more-button");

    if (existingShowMoreButton) {
        existingShowMoreButton.remove();
    }

    // loop through each content
    data.content.forEach(content => {

        if (content.image_link) {

        // create div
        content_container = document.createElement("div");
        content_container.classList.add("container-search-result");

        // set id
        content_container.setAttribute("id", `content-container${content.tmdb_id}`)

        content_container.innerHTML = `
            <img class="img-movie-display" src="${content.image_link}">
            <span class="overlay-rating">${content.tmdb_rating}</span>
        `

        // append to 
        document.getElementById("search-results").append(content_container);

        // create complete movie overview - hide with option to put on watchlist
        const keyword = "search";
        createContentCard(content, keyword);

        } 
    })

    // Rating Circle Score Visuals
    ratingScoreVisuals();

    // Logic show more button
    if (data.currentPage != "last_page") {
        let showMoreButton = document.createElement("div");
        showMoreButton.classList.add("container-show-more-button");

        // set counter to next page
        const nextPage = data.currentPage + 1;

        showMoreButton.setAttribute("id", `show_page${nextPage}`);

        showMoreButton.innerHTML = "<button class='show-more-button'>Show More</button>"

        showMoreButton.addEventListener("click", () => {

            if (futureCall === "Search") {
                fetchSearchData(fInput1, fInput2, nextPage);
            } else if (futureCall === "ContentSuggestion") {
                getContentSuggestions(fInput1, fInput2, nextPage);
            } else if (futureCall === "GenreSuggestions") {
                getGenreSuggestion(fInput1, fInput2, nextPage)
            }
        })

        document.getElementById("suggestions-container").append(showMoreButton);
    }
}


function createContentCard(content, keyword) {
    /**
     * Create and display a content card for a given content item.

     Args:
         content: An object containing data for the content item (e.g., title, image, etc.).
     */
    // create empty div 
    let contentCard = document.createElement("div");

    contentCard.classList.add("container-content-card");
    contentCard.setAttribute("id", `content-card-${content.tmdb_id}`);

    // fill with content data
    const contentType = content.type;
    const directorText = contentType === "movie" ? "Director: " : "Executive Producer: ";
    const seasonsInfo = content.seasons ? `<p class="content-card-seasons">Seasons: ${content.seasons} -- Episodes: ${content.episodes}</p>` : "";

    // create cards to display genre information
    const genreCards = content.genres.map(genre => 
        `<span class="content-card-genre-cards">${genre}</span>`
    ).join(``);


    // create button "add to watchlist" OR "remove from Watchlist"
    const buttonText = content.button === "add" ? "Add to Watchlist" : "Remove from Watchlist";
    const watchlistButton = document.createElement("button");
    watchlistButton.className = "toggle-watchlist-button " + (content.button === "add" ? "add" : "remove");
    watchlistButton.id = `watchlist-button-${content.tmdb_id}`;
    watchlistButton.textContent = buttonText;

    // add Event Listener to watchlist button
    watchlistButton.addEventListener("click", () => {
        toggleWatchlistButton(content, watchlistButton)
    });

    // if already on watchlist, show "my rating"
    const userRating = content.user_rating ? content.user_rating : 0;
    const myRating = document.createElement("div");
    myRating.classList.add("user-rating-content-card");
    myRating.innerHTML = `<p class="rating-card-label">My Rating</p><div class="content-card-rating" id="content-card-user-rating-${content.tmdb_id}">${userRating}</div>`;
    if (watchlistButton.classList.contains("remove")) {
        myRating.style.display = "flex";
    } 



    // fill contentCard with data
    contentCard.innerHTML = `
        <div class="content-card--grid-column1">
            <img class="content-card-image" src="${content.image_link}">
        </div>
        <div class="content-card--grid-column2">
            <h1 class="content-card-title">${content.title}</h1>
            ${seasonsInfo}
            <div class="content-card-genres">${genreCards}</div>
            <p class="content-card-release-date">Release Date: ${content.release_date}</p>
            <p class="content-card-overview">${content.overview}</p>
            <p class="content-card-actors">Starring: ${content.actors}</p>
            <p class="content-card-director">${directorText}${content.director}</p>
            <div class="container-toggle-watchlist-button"></div>
        </div>
        <div class="content-card--grid-column3">
            <div class="content-card-rating">${content.tmdb_rating}</div>
        </div>
        `

    // append watchlist button to appropriate container
    const watchlistButtonContainer = contentCard.querySelector(".container-toggle-watchlist-button");
    watchlistButtonContainer.appendChild(watchlistButton);

    // append my Rating to container
    contentCard.querySelector(".content-card--grid-column3").appendChild(myRating);
    
    // Set hover functionality
    setHoverFunctionality(contentCard, content.tmdb_id, keyword);

    // append to DOM
    document.body.append(contentCard);

    // allow user to change "my rating"
    enableRatingInteraction();

    // Create recommendations div
    if (currentPage === "/watchlist/") {
        const showRecommendations = document.createElement("div");
        const spanText = document.createElement("span");
        const arrowIcon = document.createElement("i");

        spanText.textContent = `Show Recommendations based on ${content.title}`;
        arrowIcon.className = "arrow right";

        spanText.appendChild(arrowIcon);
        showRecommendations.appendChild(spanText);
        showRecommendations.className = "show-recommendations";

        spanText.addEventListener("click", () => {
            // Check if recommendationsDiv already exists
            let recommendationsContent = contentCard.querySelector(".recommendations");
        
            if (recommendationsContent) {
                // Toggle visibility
                const isCurrentlyVisible = recommendationsContent.style.display === "flex";
                recommendationsContent.style.display = isCurrentlyVisible ? "none" : "flex"; 

                // Toggle the arrow class
                arrowIcon.classList.toggle("right", isCurrentlyVisible);
                arrowIcon.classList.toggle("down", !isCurrentlyVisible);

            } else {
                // Create recommendationsDiv
                recommendationsContent = document.createElement("div");
                recommendationsContent.className = "recommendations"; 
                recommendationsContent.style.display = "flex";

                arrowIcon.classList.toggle("down");
        
                showRecommendations.append(recommendationsContent);

                // Only fetch recommendations if the content div is empty
                getRecommendations(content.tmdb_id, content.type, recommendationsContent);
            }
            
            // Scroll to the bottom of the recommendations content
            contentCard.scrollTop = contentCard.scrollHeight;
        });

        // Append the recommendations div outside the grid columns
        contentCard.appendChild(showRecommendations);
    }
}


function getRecommendations(tmdbId, type, recommendationsDiv) {

    // create placeholder while loading
    const placeholderLoading = document.createElement("div");
    placeholderLoading.className = "loading-placeholder";
    placeholderLoading.textContent = "Loading..."
    recommendationsDiv.append(placeholderLoading);


    fetch("/recommendations/", {
        method: "POST",
        body: JSON.stringify({
            tmdbId: tmdbId,
            type: type,
        })
    }).then(async response => {
        const data = await response.json();
        if (response.ok) {

            placeholderLoading.remove();

            data.content.forEach(content => {
                if (content.image_link) {
                    // create container for each result
                    const recommendationsContentContainer = document.createElement("div");
                    recommendationsContentContainer.classList.add("container-recommendations-result");
                    recommendationsContentContainer.setAttribute("id", `container-recommendations-result${content.tmdb_id}`);

                    // create cards to display genre information
                    const genreCards = content.genres.map(genre => 
                        `<span class="content-card-genre-cards">${genre}</span>`
                    ).join(``);

                    // Create watchlist button
                    const buttonText = content.button === "add" ? "Add to Watchlist" : "Remove from Watchlist";
                    const watchlistButton = document.createElement("button");
                    watchlistButton.className = "toggle-watchlist-button recommendations-display " + (content.button === "add" ? "add" : "remove");
                    watchlistButton.id = `watchlist-button-${content.tmdb_id}`;
                    watchlistButton.textContent = buttonText;

                    watchlistButton.addEventListener("click", () => {
                        toggleWatchlistButton(content, watchlistButton);
                    });
                    
                    recommendationsContentContainer.innerHTML = `
                        <div class="recommendation-content-card--grid-column1">
                            <img class="recommendation-img-movie-display" src="${content.image_link}">
                            <span class="overlay-rating recommendation">${content.tmdb_rating}</span>
                        </div>
                        <div class="recommendation-content-card--grid-column2">
                            <h1 class="recommendation-content-card-title">${content.title}</h1>
                            <div class="recommendation-content-card-genres">${genreCards}</div>
                            <p class="recommendation-content-card-overview">${content.overview}</p>
                        </div>
                    `;

                    recommendationsContentContainer.querySelector('.recommendation-content-card--grid-column1').appendChild(watchlistButton);

                    recommendationsDiv.append(recommendationsContentContainer);

                    // add eventlistener to toggle column2
                    const image = recommendationsContentContainer.querySelector(".recommendation-img-movie-display");
                    const column2 = recommendationsContentContainer.querySelector(".recommendation-content-card--grid-column2");

                    image.addEventListener("click", () => {
                        // Check the computed style to see if it's 'none'
                        const isVisible = column2.checkVisibility();
                        column2.style.display = !isVisible ? "flex" : "none";

                        if (column2.style.display === "flex") {
                            column2.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    })
                } 
            });
        } else {
            alert(data.error);
        }
    }).catch(error => {
        console.error("Error fetching data:", error);
    });
}


function setHoverFunctionality(contentCard, contentId, keyword) {
    // set eventlistener for hover (desktop)
    const contentContainer = keyword === "search" ? document.getElementById(`content-container${contentId}`) : document.getElementById(`container-watchlist-item${contentId}`);


    // create timer variable
    let hoverTimeout;

    // if user hovers for 1 second show contentCard
    contentContainer.addEventListener("mouseover", () => {
        hoverTimeout = setTimeout(() => {
            contentCard.style.display = "grid";
        }, 700);
    })

    // reset timer if user moves on
    contentContainer.addEventListener("mouseleave", () => {
        clearTimeout(hoverTimeout);
    })


        // set eventlistener for touch (mobile)
    // hide element
        // set eventlistener for hover out (desktop)
    contentCard.addEventListener("mouseleave", () => {
        contentCard.style.display = "none";
    })
        // set eventlistener for touch out (mobile)
}



function getContentSuggestions(suggestionType, keyword, page = 1) {
     /**
     * Fetch content suggestions based on the given type and keyword.

     Args:
         suggestionType: The type of suggestions to fetch (e.g., popular, top rated, upcoming).
         keyword: The keyword for suggestions (movie or tv)
         page: The page number for pagination (default is 1).
     */

    // set up placeholder loading screen
    placeholderSearch();

    if (page === 1) {
        clearSuggestions();
    }

    console.log(suggestionType);
    console.log(keyword);

    fetch("/get-suggestions/", {
        method: "POST",
        body: JSON.stringify({
            suggestionType: suggestionType,
            keyword: keyword,
            page: page
        })
    })
    .then(async response => {
        const data = await response.json();
        if (response.ok) {

            // for each movie/tv show from request render div
            const futureCall = "ContentSuggestion";

            showSuggestions(data, futureCall, suggestionType, keyword);

            // remove placeholder loading screen
            placeholderSearchRemove();

        } else {
            alert(data.error);
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error)
    })
}


function getGenreSuggestion(genreId, contentType, page = 1) {
    /**
     * Fetch content suggestions based on genre.

     Args:
         genreId: The ID of the genre to fetch suggestions for.
         contentType: The type of content (e.g., movie, tv).
         page: The page number for pagination (default is 1).
     */

    // set up placeholder loading screen
    placeholderSearch();
    
    if (page === 1) {
        clearSuggestions();
    }

    fetch("/get-genre-suggestions/", {
        method: "POST",
        body: JSON.stringify({
            genreId: genreId,
            contentType: contentType,
            page: page
        })
    })
    .then(async response => {
        const data = await response.json();
        if (response.ok) {

            // for each movie/tv show from request render div
            const futureCall = "GenreSuggestions";

            showSuggestions(data, futureCall, genreId, contentType);

            // remove placeholder loading screen
            placeholderSearchRemove();

        } else {
            alert(data.error);
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error)
    })
}


function ratingScoreVisuals() {
    /**
     * Update the visual representation of rating scores in the UI.
     */

    // Only select unprocessed ratings
    const ratings = document.querySelectorAll(".content-card-rating:not(.processed)");

    ratings.forEach((rating) => {
        let ratingScore = parseFloat(rating.innerHTML.trim()); 

        // Convert 10.0 to 10 for display
        ratingScore = ratingScore === 10.0 ? 10 : ratingScore.toFixed(1);

        // Check if the ratingScore is valid
        if (!isNaN(ratingScore)) {
            // Set the gradient background based on the score
            const gradient = `background: conic-gradient(#db4a2b ${ratingScore * 10}%, transparent 0 100%)`;

            rating.setAttribute("style", gradient);
            
            // Wrap the content in a span
            // Convert 10.0 to 10 for display
            rating.innerHTML = `<span>${ratingScore}</span>`; 

            // mark rating as processed
            rating.classList.add("processed");

        } else {
            console.warn(`Invalid rating value: ${rating.innerHTML}`);
            rating.innerHTML = `<span>NA</span>`; // Invalid Ratings
        }
    });
}


function toggleWatchlistButton(content, watchlistButton) {
    /**
     * Toggle the watchlist status for a specific content item and update the button.

     Args:
         content: The content object to be added/removed from the watchlist.
         watchlistButton: The button element that triggers the toggle action.
     */

    // define action for button
    const action = watchlistButton.classList.contains("add") ? "add" : "remove";

    // send POST request
    fetch("/toggle-watchlist/", {
        method: "POST",
        body: JSON.stringify({
            content: content,
            action: action
        })
    }).then(async response => {
        const data = await response.json();
        
        if (response.ok) {
             
            const contentCard = document.getElementById(`content-card-${content.tmdb_id}`);

            // if request came from search page
            if (data.path === "/") {
                // change button class
                watchlistButton.className = `toggle-watchlist-button ${data.button}`;
                watchlistButton.textContent = data.button === "add" ? "Add to Watchlist" : "Remove from Watchlist";

                // show user rating
                const userRating = contentCard.querySelector(".user-rating-content-card");
                userRating.style.display = data.button === "add" ? "none" : "flex";

            // if request came from recommendation suggestions 
            } else if (watchlistButton.classList.contains("recommendations-display")) {
                
                // delete item from suggestions
                document.getElementById(`container-recommendations-result${content.tmdb_id}`).remove();

                // make image show up in watchlist
                    // collect all ids from page
                    const itemContainers = document.querySelectorAll("container-watchlist-items");

                    let idArray = [];

                    itemContainers.forEach(item => {
                        const itemId = item.id.split("container-watchlist-item")[1];
                        idArray.append(itemId);
                    })

                    // if list does not contain content.tmdb_id then create div similar to watchlist.html
                    if (idArray.indexOf(content.tmdb_id) === -1) {
                        let containerWatchlistItem = document.createElement("div");
                        containerWatchlistItem.className = `container-watchlist-items ${content.type}`;
                        containerWatchlistItem.setAttribute("id", `container-watchlist-item${content.tmdb_id}`)

                        containerWatchlistItem.innerHTML = `
                            <img src="${content.image_link}">
                            <span class="overlay-rating watchlist">${content.tmdb_rating}</span>
                            <span class="overlay-rating watchlist user hidden">${content.user_rating}</span>
                            <script type="application/json">${content}</script>
                             `

                        // prepare content
                        content.button = "remove";
                        console.log(content);
                        console.log(content.tmdb_rating);
                        document.querySelector(".container-watchlist-content").append(containerWatchlistItem);

                        // create contentcard for image
                        createContentCard(content, "watchlist");

                        // style rating scores
                        ratingScoreVisuals();
                    }
            } 
            // if request came from watchlist page remove item
            else {
                contentCard.remove()
                document.getElementById(`container-watchlist-item${content.tmdb_id}`).remove();
            }

        } else {
            alert(data.error);
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error);
        alert("An error occurred while toggling the watchlist. Please try again.");
    })
}

function updateVisibilityWatchlistContent(toggle) {
    const toggleButtonLabel = document.getElementById("toggle-label");
    toggleButtonLabel.textContent = toggle.checked ? "Showing TV Shows" : "Showing Movies";
    const keyword = "watchlist";

    const showType = toggle.checked ? "tv" : "movie";
    const hideType = toggle.checked ? "movie" : "tv";

    // Hide items of the other type
    document.querySelectorAll(`.container-watchlist-items.${hideType}`).forEach(item => {
        item.style.display = "none";
    });

    // Show items of the current type
    document.querySelectorAll(`.container-watchlist-items.${showType}`).forEach(item => {
        item.style.display = "flex";
        item.style.visibility = "visible";

        const itemData = item.querySelector("script").textContent;
        const itemDataJson = JSON.parse(itemData);
        const keyword = "watchlist";
        console.log(itemDataJson);
        
        createContentCard(itemDataJson, keyword);
    });

    // Rating Circle Score Visuals
    ratingScoreVisuals();
}

function enableRatingInteraction() {
    const userRatings = document.querySelectorAll(".user-rating-content-card");

    userRatings.forEach((userRating) => {
        const ratings = userRating.querySelectorAll(".content-card-rating");

        ratings.forEach((rating) => {
            let isDragging = false;

            const updateRating = (event) => {
                // Prevent default to avoid text selection
                event.preventDefault();

                // Calculate the new rating based on the mouse/touch position
                const rect = rating.getBoundingClientRect();
                const ratingSize = rect.width; 
                const offsetX = event.clientX ? event.clientX - rect.left : event.touches[0].clientX - rect.left;

                // Calculate the new rating with one decimal point
                const newRating = parseFloat(((offsetX / ratingSize) * 10).toFixed(1));

                // Update the rating display
                if (newRating >= 0 && newRating <= 10) {
                    // Update only the current rating being interacted with
                    userRatingScoreVisuals(newRating, rating); // Pass the specific rating
                    saveUserRating(newRating, rating);
                }
            };

            const startDrag = (event) => {
                isDragging = true;
                updateRating(event); // Update immediately on start
            };

            const endDrag = () => {
                isDragging = false;
            };

            // Event listeners for desktop
            rating.addEventListener("mousedown", startDrag);
            document.addEventListener("mousemove", (event) => {
                if (isDragging) updateRating(event);
            });
            document.addEventListener("mouseup", endDrag);

            // Event listeners for mobile
            rating.addEventListener("touchstart", startDrag);
            rating.addEventListener("touchmove", (event) => {
                if (isDragging) updateRating(event);
            });
            document.addEventListener("touchend", endDrag);
        });
    });
}


function userRatingScoreVisuals(newRating, rating) {
    // Convert 10.0 to 10 for display
    newRating = newRating === 10.0 ? 10 : newRating.toFixed(1);

    const gradient = `background: conic-gradient(#db4a2b ${newRating * 10}%, transparent 0 100%)`;
    rating.setAttribute("style", gradient);
    rating.innerHTML = `<span>${newRating}</span>`;
}


function saveUserRating(newRating, rating) {
    // get tmdbId to access in database
    const tmdbId = Number(rating.id.split("content-card-user-rating-")[1]);

    // make api call to save
    fetch("/update-user-rating/", {
        method: "post",
        body: JSON.stringify({
            newRating: newRating,
            tmdbId: tmdbId
        })
    }).then(async response => {
        const data = await response.json();

        if (response.ok) {
            // update overlay rating on watchlist item
            const watchlistItem = document.getElementById(`container-watchlist-item${tmdbId}`);

            // if user is on watchlist page
            if (watchlistItem) {
                const overlayUserRating = watchlistItem.querySelector(".overlay-rating.watchlist.user");
                overlayUserRating.textContent = `${newRating}`;
                overlayUserRating.style.display = "flex";
            }
            
        } else {
            alert(data.error);
        }
    });
}