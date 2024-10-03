document.addEventListener("DOMContentLoaded", () => {

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


    
    
});

function prepareSuggestions(event) {

    let suggestionType, keyword;

    if (event.target.id.startsWith("movies_")) {
        suggestionType = event.target.id.replace("movies_", "");
        keyword = "movie";
    } else if (event.target.id.startsWith("tv_")) {
        suggestionType = event.target.id.replace("tv_", "");
        keyword = "tv";
    }
    
    getContentSuggestions(suggestionType, keyword);
    console.log(`Suggestion Type = ${suggestionType}`);
}


function changePlaceholderSearchbar() {
    const radioMovies = document.getElementById("movies");
    const radioTv = document.getElementById("tvshow");
    const radioPerson = document.getElementById("person");
    const searchBar = document.getElementById("search-bar");
    const movieSuggestions = document.getElementById("choices-movie-suggestions");
    const tvSuggestions = document.getElementById("choices-tv-suggestions");


    radioMovies.addEventListener("click", () =>{
        searchBar.placeholder = "Search for Movies";

        movieSuggestions.style.display = "flex";
        movieSuggestions.style.visibility = "visible";

        tvSuggestions.style.display = "none";
        tvSuggestions.style.visibility = "hidden";

    })

    radioTv.addEventListener("click", () => {
        searchBar.placeholder = "Search for TV Shows";

        movieSuggestions.style.display = "none";
        movieSuggestions.style.visibility = "hidden";

        tvSuggestions.style.display = "flex";
        tvSuggestions.style.visibility = "visible";
    })

    radioPerson.addEventListener("click", () => {
        searchBar.placeholder = "Search for Filmographie of Actor/Director";

        movieSuggestions.style.display = "none";
        movieSuggestions.style.visibility = "hidden";

        tvSuggestions.style.display = "none";
        tvSuggestions.style.visibility = "hidden";
    })
}


function debounce(func, delay) {
    let timer;
    return(...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            func.apply(this. args);
        }, delay);
    };
}


function getSearchInput() {
    const searchbar = document.getElementById("search-bar");
    const searchdata = searchbar.value.trim();

    if (searchdata.length > 2) {
        const selectedRadio = document.querySelector('input[name="search"]:checked');
        let searchType = selectedRadio ? selectedRadio.value : "movie"

        if (searchType) {
            fetch_search_data(searchdata, searchType);
        }

    } else {
        clearSuggestions();
    }
}


function clearSuggestions() {
    // clear out suggestions-container
    document.getElementById("suggestions-container").innerHTML = "";
}


function fetch_search_data(searchData, searchType) {
    clearSuggestions();

    // send fetch request for search with value
    fetch("/search", {
        method: "POST",
        body: JSON.stringify({
            searchData: searchData,
            searchType: searchType
        })
    }).then(async response => {
        const data = await response.json();
        if (response.ok) {

            // for each movie from request render div
            showSuggestions(data);

        } else {
            alert(data.error);
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error);
    })
}


function showSuggestions(data) {
    data.forEach(content => {
        console.log(content);

        if (content.image) {

        // create div
        content_container = document.createElement("div");
        content_container.classList.add("container-search-result");

        content_container.innerHTML = `
            <img class="img-movie-display" src="${content.image}">
            <span class="overlay-rating">${content.rating}</span>
        `

        // create complete movie overview - hide with option to put on watchlist

        
        // set eventlistener for click (show overview on hover)

        // append to 
        document.getElementById("suggestions-container").append(content_container);

        } 
    })
}


function getContentSuggestions(suggestionType, keyword) {

    clearSuggestions();

    fetch("/get-suggestions", {
        method: "POST",
        body: JSON.stringify({
            suggestionType: suggestionType,
            keyword: keyword
        })
    })
    .then(async response => {
        const data = await response.json();
        if (response.ok) {

            // for each movie/tv show from request render div
            showSuggestions(data)

        } else {
            alert(data.error);
        }
    })
    .catch(error => {
        console.error("Error fetching data:", error)
    })
}
