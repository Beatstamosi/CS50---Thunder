document.addEventListener("DOMContentLoaded", () => {

    // change text of search bar
    change_placeholder_searchbar();

    // autosuggest
    autosuggest();
    
    
});


function change_placeholder_searchbar() {
    const radioMovies = document.getElementById("movies");
    const radioTv = document.getElementById("tvshow");
    const radioPerson = document.getElementById("person");
    const searchBar = document.getElementById("search-bar");


    radioMovies.addEventListener("click", () =>{
        searchBar.placeholder = "Search for Movies";
    })

    radioTv.addEventListener("click", () => {
        searchBar.placeholder = "Search for TV Shows";
    })

    radioPerson.addEventListener("click", () => {
        searchBar.placeholder = "Search for Filmographie of Actor/Director";
    })
}


function autosuggest() {
    // create instance of search bar
    // get value of search bar on input
    // if value > 3 
        // have a delay
        // send fetch request for search with value
        // for each movie from request render div
            // image
            // create complete movie overview - hide
            // set eventlistener for hover (show overview on hover)
            // display rating
            // option to put on watchlist
                // if already on watchlist show my rating
}