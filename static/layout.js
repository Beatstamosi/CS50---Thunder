document.addEventListener("DOMContentLoaded", () => {
    /**
     * Initialize event listeners and set up the search bar.
     */

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
    })
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


function fetchSearchData(searchData, searchType, page = 1) {
    /**
     * Fetch search data from the server based on user input.

     Args:
         searchData: The search query input by the user.
         searchType: The type of content to search for (e.g., movie, TV).
         page: The page number for pagination (default is 1).
     */

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

        if (content.image) {

        // create div
        content_container = document.createElement("div");
        content_container.classList.add("container-search-result");

        // set id
        content_container.setAttribute("id", `content-container${content.id}`)

        content_container.innerHTML = `
            <img class="img-movie-display" src="${content.image}">
            <span class="overlay-rating">${content.rating}</span>
        `

        // append to 
        document.getElementById("search-results").append(content_container);

        // create complete movie overview - hide with option to put on watchlist
        createContentCard(content);

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


function createContentCard(content) {
    /**
     * Create and display a content card for a given content item.

     Args:
         content: An object containing data for the content item (e.g., title, image, etc.).
     */

    // create empty div
    let contentCard = document.createElement("div");

    contentCard.classList.add("container-content-card");

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
    watchlistButton.id = `watchlist-button-${content.id}`;
    watchlistButton.textContent = buttonText;

    // add Event Listener to watchlist button
    watchlistButton.addEventListener("click", () => {
        toggleWatchlistButton(content, watchlistButton)
    });

    // if already on watchlist, show "my rating"
    const myRating = content.user_rating ? `<p class="rating-card-label">My Rating</p>
        <div class="content-card-rating">${userRating}</div>`: "";


    // fill contentCard with data
    contentCard.innerHTML = `
        <div class="content-card--grid-column1">
            <img class="content-card-image" src="${content.image}">
        </div>
        <div class="content-card--grid-column2">
            <h1 class="content-card-title">${content.title}</h1>
            ${seasonsInfo}
            <div class="content-card-genres">${genreCards}</div>
            <p class="content-card-release-date">Release Date: ${content.release_date}</p>
            <p class="content-card-overview">${content.overview}</p>
            <p class="content-card-actors">Starring: ${content.actors}</p>
            <p class="content-card-director">${directorText}${content.creator}</p>
            <div class="container-toggle-watchlist-button"></div>
        </div>
        <div class="content-card--grid-column3">
            <p class="rating-card-label">User Rating</p>
            <div class="content-card-rating">${content.rating}</div>
            ${myRating}
        </div>
        `

    // append watchlist button to appropriate container
    const watchlistButtonContainer = contentCard.querySelector(".container-toggle-watchlist-button");
    watchlistButtonContainer.appendChild(watchlistButton);
    

    // show element
    // set eventlistener for hover (desktop)
    const contentContainer = document.getElementById(`content-container${content.id}`)


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


    // append to DOM
    document.body.append(contentCard);


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
         suggestionType: The type of suggestions to fetch (e.g., movie, TV).
         keyword: The keyword for suggestions.
         page: The page number for pagination (default is 1).
     */


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
         contentType: The type of content (e.g., movie, TV).
         page: The page number for pagination (default is 1).
     */

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
        const ratingScore = parseFloat(rating.innerHTML.trim()); 

        // Check if the ratingScore is valid
        if (!isNaN(ratingScore)) {
            // Set the gradient background based on the score
            const gradient = `background: conic-gradient(#db4a2b ${ratingScore * 10}%, transparent 0 100%)`;

            rating.setAttribute("style", gradient);
            
            // Wrap the content in a span
            rating.innerHTML = `<span>${ratingScore.toFixed(1)}</span>`; 

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
            // change button class 
            watchlistButton.className = `toggle-watchlist-button ${data.button}`;
            watchlistButton.textContent = data.button === "add" ? "Add to Watchlist" : "Remove from Watchlist";
        } else {
            alert(data.error);
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error);
        alert("An error occurred while toggling the watchlist. Please try again.");
    })
}