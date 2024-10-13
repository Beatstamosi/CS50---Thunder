import json
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import requests
from django.shortcuts import get_object_or_404
from .models import Content, Watchlist
from django.core import serializers

from watchlist.helpers import build_content_data


@login_required
def index(request):
    """
    Render the main watchlist page for authenticated users.

    Args:
        request: The HTTP request object.

    Returns:
        HttpResponse: Rendered template for the watchlist index page.
    """

    return render(request, "watchlist/index.html", {
        "current_path": request.path
    })

@csrf_exempt
@login_required
def search(request):
    """
    Handle search requests for content based on user input.

    Args:
        request: The HTTP request object.

    Returns:
        JsonResponse: A JSON response containing search results or an error message.
    """

    # Make sure it is a POST request
    if request.method != "POST":
        return JsonResponse({"error": "Post request required."}, status=400)

    # Get data
    data = json.loads(request.body)
    search_data = data.get("searchData")
    search_type = data.get("searchType")
    page = data.get("page")

    url = f"https://api.themoviedb.org/3/search/{search_type}?query={search_data}&include_adult=false&language=en-US&page={page}"

    headers = {
        "accept": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YThhNWU3Mzc5NjliNmQ3ZDI4Y2NlNjJjNGRmNWNkMCIsIm5iZiI6MTcyNzU1NzgwMS44OTk3MzUsInN1YiI6IjY2NWU0OTUzZWNiYTJlMzAyODUxNDY0ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A4l3HBwbieBa6vr9TGySOndio7HUJ8TS454W61pefvk"
    }

    response = requests.get(url, headers=headers)

    # Create empty list
    content = []

    if response.status_code == 200:
        # get content data
        results = response.json().get("results", [])

        # get page info
        total_pages = response.json().get("total_pages")
        current_page = response.json().get("page")

        if total_pages == current_page:
            current_page = "last_page"

        # continue with content data
        if search_type != "person":
            for item in results:

                content.append(build_content_data(request, item))

            return JsonResponse({
                "content": content,
                "currentPage": current_page
            }, safe=False)

        elif search_type == "person":
            for element in results:
                movies = element.get("known_for", [])
                for item in movies:
              
                    content.append(build_content_data(request, item))

            return JsonResponse({
                "content": content,
                "currentPage": current_page
            }, safe=False)
        
    else:
        return JsonResponse({"error": "Couldn't fetch movie data. Please refresh and try again"}, status=400)


@csrf_exempt
@login_required
def get_suggestions(request):
    """
    Fetch content suggestions based on the provided suggestion type and keyword.

    Args:
        request: The HTTP request object.

    Returns:
        JsonResponse: A JSON response with suggested content or an error message.
    """

    if request.method != "POST":
        return JsonResponse({"error": "Request needs to be post."}, status=400)

    # Get data
    data = json.loads(request.body)
    suggestion_type = data.get("suggestionType")
    keyword = data.get("keyword")
    page = data.get("page")

    url = f"https://api.themoviedb.org/3/{keyword}/{suggestion_type}?language=en-US&page={page}"

    headers = {
        "accept": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YThhNWU3Mzc5NjliNmQ3ZDI4Y2NlNjJjNGRmNWNkMCIsIm5iZiI6MTcyNzU1NzgwMS44OTk3MzUsInN1YiI6IjY2NWU0OTUzZWNiYTJlMzAyODUxNDY0ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A4l3HBwbieBa6vr9TGySOndio7HUJ8TS454W61pefvk"
    }

    response = requests.get(url, headers=headers)

    # prepare empty list to fill with content data
    content = []

    if response.status_code == 200:

        # get only the movie / tv show data
        results = response.json().get("results", [])

        # get page info
        total_pages = response.json().get("total_pages")
        current_page = response.json().get("page")

        if total_pages == current_page:
            current_page = "last_page"

        # loop through content and extract relevant info
        for item in results:
            content.append(build_content_data(request, item))

        return JsonResponse({
            "content": content,
            "totalPages": total_pages,
            "currentPage": current_page
        }, safe=False)
    
    else:
        return JsonResponse({"error": "Couldn't fetch movie data. Please refresh and try again"}, status=400)


@csrf_exempt
@login_required
def get_genre_suggestions(request):
    """
    Retrieve content based on genre suggestions.

    Args:
        request: The HTTP request object.

    Returns:
        JsonResponse: A JSON response containing genre-based suggestions or an error message.
    """

    if request.method != "POST":
        return JsonResponse({"error": "Request needs to be post."}, status=400)

    # Get data
    data = json.loads(request.body)
    content_type = data.get("contentType")
    genre_id = data.get("genreId")
    page = data.get("page")

    url = f"https://api.themoviedb.org/3/discover/{content_type}?include_adult=false&include_video=false&language=en-US&page={page}&sort_by=popularity.desc&with_genres={genre_id}"

    headers = {
        "accept": "application/json",
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI5YThhNWU3Mzc5NjliNmQ3ZDI4Y2NlNjJjNGRmNWNkMCIsIm5iZiI6MTcyNzU1NzgwMS44OTk3MzUsInN1YiI6IjY2NWU0OTUzZWNiYTJlMzAyODUxNDY0ZSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.A4l3HBwbieBa6vr9TGySOndio7HUJ8TS454W61pefvk"
    }

    response = requests.get(url, headers=headers)

    # prepare empty list to fill with content data
    content = []

    if response.status_code == 200:

        # get only the movie / tv show data
        results = response.json().get("results", [])

        # get page info
        total_pages = response.json().get("total_pages")
        current_page = response.json().get("page")

        if total_pages == current_page:
            current_page = "last_page"

        # loop through content and extract relevant info
        for item in results:
            content.append(build_content_data(request, item))


        return JsonResponse({
            "content": content,
            "totalPages": total_pages,
            "currentPage": current_page
        }, safe=False)
    
    else:
        return JsonResponse({"error": "Couldn't fetch movie data. Please refresh and try again"}, status=400)

@csrf_exempt
@login_required
def toggle_watchlist(request):
    """
    Toggle the watchlist status for a specific content item.

    Args:
        request: The HTTP request object.

    Returns:
        JsonResponse: A JSON response indicating the success of the action and the updated button state or an error message.
    """

    if request.method != "POST":
        return JsonResponse({"error": "Request needs to be post."}, status=400)
    
    
    # get data 
    data = json.loads(request.body)
    content = data.get("content")
    action = data.get("action")

    if not content:
        return JsonResponse({"Error": "Content data is missing"}, status=400)

    if action == "add":
        # Add to content
        content_database_entry = Content(
            title=content.get("title"),
            overview=content.get("overview"),
            image_link=content.get("image_link"),
            director=content.get("director"),
            actors=content.get("actors"),
            release_date=content.get("release_date"),
            tmdb_rating=content.get("tmdb_rating"),
            tmdb_id=content.get("tmdb_id"),
            type=content.get("type"),
            genres=content.get("genres")
        )

        # set genre ids
        genre_ids = content.get("genre_ids", [])
        content_database_entry.set_genre_ids(genre_ids)

        # set seasons and episode info if tv show
        if content.get("seasons"):
            content_database_entry.seasons = content.get("seasons")
        if content.get("episodes"):
            content_database_entry.episodes = content.get("episodes")

        # save entry
        content_database_entry.save()

        # add to watchlist
        Watchlist.objects.create(user=request.user, content=content_database_entry)

        # change button value
        button = "remove"

    elif action == "remove":
        # get content
        content_to_remove = get_object_or_404(Content, tmdb_id=content.get("tmdb_id"))

        # get watchlist entry
        watchlist_entry = get_object_or_404(Watchlist, user=request.user, content=content_to_remove)

        # delete from watchlist
        watchlist_entry.delete()

        # delete content
        content_to_remove.delete()

        # change button value
        button = "add"

    # Determine where to redirect based on the referrer or path
    referer = request.META.get('HTTP_REFERER', '')

    if 'watchlist' in referer:  # Indicates the watchlist page
        return JsonResponse({"Success": "Content successfully toggled", "button": button, "path": "/watchlist/"}, status=200)
    else:
        return JsonResponse({"Success": "Content successfully toggled", "button": button, "path": "/"}, status=200)



def watchlist(request):
    """
    Render the user's watchlist page.

    Args:
        request: The HTTP request object.

    Returns:
        HttpResponse: Rendered template for the user's watchlist.
    """
    watchlist_content = Watchlist.objects.filter(user=request.user).select_related("content")

    content_items = [
        {
            'id': item.content.id,
            'title': item.content.title,
            'overview': item.content.overview,
            'image_link': item.content.image_link,
            'director': item.content.director,
            'actors': item.content.actors,
            'release_date': item.content.formatted_release_date(),
            'tmdb_rating': item.content.tmdb_rating,
            'user_rating': item.content.user_rating,
            'genre_ids': item.content.genre_ids,
            'genres': item.content.get_genres(),
            'tmdb_id': item.content.tmdb_id,
            'seasons': item.content.seasons,
            'episodes': item.content.episodes,
            'type': item.content.type,
        }
        for item in watchlist_content
    ]

    return render(request, "watchlist/watchlist.html", {
        "current_path": request.path,
        "watchlist_content": content_items
    })
