import requests
from .models import Watchlist, Content


def build_content_data(request, item):
    """
    Builds a dictionary of relevant content data extracted and formatted from an API response item.

    Args:
        request: The HTTP request object, used to access user information.
        item (dict): The item dictionary containing information about a movie or TV show.

    Returns:
        dict: A dictionary of formatted content information, including title, release date, rating,
        genre names, number of seasons and episodes (for TV shows), watchlist button state, and
        user rating if available.
    """

    content = {
        "tmdb_id": item.get("id"),
        "title": item.get("title") or item.get("name"),
        "release_date": item.get("release_date") or item.get("first_air_date"),
        "tmdb_rating": round(item.get("vote_average"), 1),
        "overview": item.get("overview"),
        "image_link": (
            f"https://image.tmdb.org/t/p/w342/{item.get('poster_path')}"
            if item.get("poster_path")
            else None
        ),
        "type": "movie" if item.get("title") else "tv",
    }

    # get actors and creator
    content_type = content.get("type")
    content_id = item.get("id")

    actors, director = get_cast(content_id, content_type)

    content["actors"] = ", ".join(actors)
    content["director"] = ", ".join(director)

    # get number of seasons and episodes
    if content_type == "tv":
        seasons, episodes = get_episode_info(content_id)

        content["seasons"] = seasons
        content["episodes"] = episodes

    # get genre information
    genre_ids = item.get("genre_ids")

    genre_names = get_genre_info(content_type, genre_ids)

    content["genres"] = genre_names
    content["genre_ids"] = genre_ids

    # get watchlist status
    button, user_rating = get_watchlist_status(request, content)

    content["button"] = button

    if user_rating is not None:
        content["user_rating"] = user_rating

    # create trailer link
    content["trailer_link"] = (
        f"https://www.youtube.com/results?search_query={content['title']}+official+trailer"
    )

    return content


def get_cast(id, content_type):
    """
    Fetches cast and director/producer data for a specified movie or TV show from the TMDB API.

    Args:
        id (int): The ID of the movie or TV show.
        content_type (str): Type of content, either "movie" or "tv".

    Returns:
        tuple: A tuple with two lists:
            - actors (list): Names of the first 5 actors.
            - director (list): Names of directors or executive producers.
    """

    url = f"https://api.themoviedb.org/3/{content_type}/{id}/credits?language=en-US"

    headers = {
        "accept": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YThhNWU3Mzc5NjliNmQ3ZDI4Y2NlNjJjNGRmNWNkMCIsIm5iZiI6MTcyNzU1NzgwMS44OTk3MzUsInN1YiI6IjY2NWU0OTUzZWNiYTJlMzAyODUxNDY0ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A4l3HBwbieBa6vr9TGySOndio7HUJ8TS454W61pefvk",
    }

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(f"Error fetching data: {response.status_code}")
        return [], []

    # get cast data
    cast = response.json().get("cast", [])

    # get first 5 actors
    actors = [person["name"] for person in cast[:8]]

    # get director / producer
    crew = response.json().get("crew", [])
    director = [
        person["name"]
        for person in crew
        if (content_type == "movie" and person.get("job") == "Director")
        or (content_type == "tv" and person.get("job") == "Executive Producer")
    ]

    return actors, director


def get_episode_info(id):
    """
    Retrieves the number of seasons and episodes for a TV show from the TMDB API.

    Args:
        id (int): The ID of the TV show.

    Returns:
        tuple: A tuple containing:
            - seasons (int): Total number of seasons.
            - episodes (int): Total number of episodes.
    """

    url = f"https://api.themoviedb.org/3/tv/{id}?language=en-US"

    headers = {
        "accept": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YThhNWU3Mzc5NjliNmQ3ZDI4Y2NlNjJjNGRmNWNkMCIsIm5iZiI6MTcyNzU1NzgwMS44OTk3MzUsInN1YiI6IjY2NWU0OTUzZWNiYTJlMzAyODUxNDY0ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A4l3HBwbieBa6vr9TGySOndio7HUJ8TS454W61pefvk",
    }

    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(f"Error fetching data: {response.status_code}")
        return

    seasons = response.json().get("number_of_seasons")
    episodes = response.json().get("number_of_episodes")

    return seasons, episodes


def get_genre_info(content_type, genre_ids):
    """
    Maps genre IDs to genre names for a movie or TV show based on content type.

    Args:
        content_type (str): The type of content, either "movie" or "tv".
        genre_ids (list): A list of genre IDs.

    Returns:
        list: A list of genre names matching the provided genre IDs.
    """

    movie_genres = {
        28: "Action",
        12: "Adventure",
        16: "Animation",
        35: "Comedy",
        80: "Crime",
        99: "Documentary",
        18: "Drama",
        10751: "Family",
        14: "Fantasy",
        36: "History",
        27: "Horror",
        10402: "Music",
        9648: "Mystery",
        10749: "Romance",
        878: "Science Fiction",
        10770: "TV Movie",
        53: "Thriller",
        10752: "War",
        37: "Western",
    }

    tv_genres = {
        10759: "Action & Adventure",
        16: "Animation",
        35: "Comedy",
        80: "Crime",
        99: "Documentary",
        18: "Drama",
        10751: "Family",
        10762: "Kids",
        9648: "Mystery",
        10763: "News",
        10764: "Reality",
        10765: "Sci-Fi & Fantasy",
        10766: "Soap",
        10767: "Talk",
        10768: "War & Politics",
        37: "Western",
    }

    # decide which genre table to use
    genres = movie_genres if content_type == "movie" else tv_genres

    # loop through genre_ids and match with name
    genre_names = [genres[id] for id in genre_ids if id in genres]

    return genre_names


def get_watchlist_status(request, content):
    """
    Determines the watchlist status of a content item for a specific user, including any existing user rating.

    Args:
        request: The HTTP request object, used to access user information.
        content (dict): A dictionary containing content information, including the TMDB ID.

    Returns:
        tuple: A tuple with:
            - button (str): "add" if the content is not in the watchlist, "remove" if it is.
            - user_rating (float or None): The user's rating if available, otherwise None.
    """

    user = request.user

    # Get watchlist filtered by user
    watchlist_user = Watchlist.objects.filter(user=user)

    # Create a list of content.tmdb_ids from the watchlist
    watchlist_content_ids = list(
        watchlist_user.values_list("content__tmdb_id", flat=True)
    )

    # check if these ids == content.id
    if content["tmdb_id"] in watchlist_content_ids:
        # if yes add remove from watchlist button
        button = "remove"

        # check if my_rating exists
        watchlist_user_content = Content.objects.get(tmdb_id=content["tmdb_id"])

        user_rating = watchlist_user_content.user_rating

        # if yes pass my_rating
        if user_rating:
            return button, user_rating
        else:
            return button, None

    else:
        # if no add to watchlist button
        button = "add"

    return button, None
