import json
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import requests
from django.shortcuts import get_object_or_404
from .models import Content, Watchlist
from django.core import serializers
from decouple import config

from watchlist.helpers import build_content_data


@login_required
def index(request):
    """
    Render the main watchlist page for authenticated users.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponse: The rendered HTML template for the watchlist index page.
    """

    return render(request, "watchlist/index.html", {"current_path": request.path})


@csrf_exempt
@login_required
def search(request):
    """
    Handle content search requests from the user.

    Args:
        request (HttpRequest): The HTTP request object containing search parameters.

    Returns:
        JsonResponse: Contains search results including content data and pagination info.
                      Returns an error message and HTTP status 400 for non-POST requests or failed data fetch.
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
        "Authorization": f"Bearer {config('TMDB_API_KEY')}",
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

            return JsonResponse(
                {"content": content, "currentPage": current_page}, safe=False
            )

        elif search_type == "person":
            for element in results:
                movies = element.get("known_for", [])
                for item in movies:

                    content.append(build_content_data(request, item))

            return JsonResponse(
                {"content": content, "currentPage": current_page}, safe=False
            )

    else:
        return JsonResponse(
            {"error": "Couldn't fetch movie data. Please refresh and try again"},
            status=400,
        )


@csrf_exempt
@login_required
def get_suggestions(request):
    """
    Fetch suggested content based on suggestion type and keyword provided by the user.

    Args:
        request (HttpRequest): The HTTP request object with suggestion type and keyword data.

    Returns:
        JsonResponse: Contains suggested content and pagination information.
                      Returns error message with HTTP status 400 for non-POST requests or failed data fetch.
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
        "Authorization": f"Bearer {config('TMDB_API_KEY')}",
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

        return JsonResponse(
            {
                "content": content,
                "totalPages": total_pages,
                "currentPage": current_page,
            },
            safe=False,
        )

    else:
        return JsonResponse(
            {"error": "Couldn't fetch movie data. Please refresh and try again"},
            status=400,
        )


@csrf_exempt
@login_required
def get_genre_suggestions(request):
    """
    Fetch content suggestions filtered by genre.

    Args:
        request (HttpRequest): The HTTP request object containing genre filters.

    Returns:
        JsonResponse: Contains content data filtered by genre, with pagination information.
                      Returns error message with HTTP status 400 for non-POST requests or failed data fetch.
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
        "Authorization": f"Bearer {config('TMDB_API_KEY')}",
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

        return JsonResponse(
            {
                "content": content,
                "totalPages": total_pages,
                "currentPage": current_page,
            },
            safe=False,
        )

    else:
        return JsonResponse(
            {"error": "Couldn't fetch movie data. Please refresh and try again"},
            status=400,
        )


@csrf_exempt
@login_required
def toggle_watchlist(request):
    """
    Toggle the user's watchlist status for a specific content item.

    Args:
        request (HttpRequest): The HTTP request object containing content data and action type.

    Returns:
        JsonResponse: Success message with button state (`"add"` or `"remove"`) and redirect path.
                      Returns error message with HTTP status 400 if content data is missing or method is not POST.
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
            genres=content.get("genres"),
            trailer_link=content.get("trailer_link"),
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
        watchlist_entry = get_object_or_404(
            Watchlist, user=request.user, content=content_to_remove
        )

        # delete from watchlist
        watchlist_entry.delete()

        # delete content
        content_to_remove.delete()

        # change button value
        button = "add"

    # Determine where to redirect based on the referrer or path
    referer = request.META.get("HTTP_REFERER", "")

    if "watchlist" in referer:  # Indicates the watchlist page
        return JsonResponse(
            {
                "Success": "Content successfully toggled",
                "button": button,
                "path": "/watchlist/",
            },
            status=200,
        )
    else:
        return JsonResponse(
            {"Success": "Content successfully toggled", "button": button, "path": "/"},
            status=200,
        )


def watchlist(request):
    """
    Render the user's watchlist page with content details.

    Args:
        request (HttpRequest): The HTTP request object.

    Returns:
        HttpResponse: The rendered HTML template with the user's watchlist content.
    """
    watchlist_content = Watchlist.objects.filter(user=request.user).select_related(
        "content"
    )

    content_items = [
        {
            "id": item.content.id,
            "title": item.content.title,
            "overview": item.content.overview,
            "image_link": item.content.image_link,
            "director": item.content.director,
            "actors": item.content.actors,
            "release_date": item.content.formatted_release_date(),
            "tmdb_rating": item.content.tmdb_rating,
            "user_rating": (
                10 if item.content.user_rating == 10 else item.content.user_rating
            ),
            "genre_ids": item.content.genre_ids,
            "genres": item.content.get_genres(),
            "tmdb_id": item.content.tmdb_id,
            "seasons": item.content.seasons,
            "episodes": item.content.episodes,
            "type": item.content.type,
            "trailer_link": item.content.trailer_link,
        }
        for item in watchlist_content
    ]

    return render(
        request,
        "watchlist/watchlist.html",
        {"current_path": request.path, "watchlist_content": content_items},
    )


@csrf_exempt
@login_required
def update_user_rating(request):
    """
    Update the user's rating for a specific content item.

    Args:
        request (HttpRequest): The HTTP request object containing rating and content ID.

    Returns:
        JsonResponse: Success message with status 200 if rating is updated.
                      Returns error message with HTTP status 400 if invalid data or non-POST request.
    """

    if request.method != "POST":
        return JsonResponse({"error": "Request needs to be POST."}, status=400)

    try:
        # Get data
        data = json.loads(request.body)

        # Validate inputs
        new_rating = data.get("newRating")
        tmdb_id = data.get("tmdbId")

        if new_rating is None or tmdb_id is None:
            return JsonResponse(
                {"error": "Both newRating and tmdbId are required."}, status=400
            )

        # Check if the new_rating is a valid number
        try:
            new_rating = float(new_rating)
        except ValueError:
            return JsonResponse(
                {"error": "Invalid rating value. Must be a number."}, status=400
            )

        # Check if the rating is within an acceptable range (0 to 10)
        if new_rating < 0 or new_rating > 10:
            return JsonResponse(
                {"error": "Rating must be between 0 and 10."}, status=400
            )

        # Retrieve content and update rating
        content = get_object_or_404(Content, tmdb_id=tmdb_id)
        content.user_rating = new_rating
        content.save()

        return JsonResponse({"success": "Rating successfully updated"}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON provided."}, status=400)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@login_required
def get_recommendations(request):
    """
    Retrieve content recommendations based on a specified content ID and type.

    Args:
        request (HttpRequest): The HTTP request object containing content type and ID.

    Returns:
        JsonResponse: Contains recommended content data or error message for invalid data or request failure.
    """

    if request.method != "POST":
        return JsonResponse({"error": "Request needs to be POST."}, status=400)

    try:
        # Get data
        data = json.loads(request.body)

        # Validate inputs
        tmdb_id = data.get("tmdbId")
        type = data.get("type")

        if type is None or tmdb_id is None:
            return JsonResponse(
                {"error": "Both type and tmdbId are required."}, status=400
            )

        # make api call to get recommendations
        url = f"https://api.themoviedb.org/3/{type}/{tmdb_id}/recommendations?language=en-US&page=1"

        headers = {
            "accept": "application/json",
            "Authorization": f"Bearer {config('TMDB_API_KEY')}",
        }

        response = requests.get(url, headers=headers)

        # prepare empty list to fill with content data
        content = []

        if response.status_code == 200:

            # get only the movie / tv show data
            results = response.json().get("results", [])

            # loop through content and extract relevant info
            for item in results:
                content_data = build_content_data(request, item)
                # only append if item is not already on watchlist
                if content_data["button"] != "remove":
                    content.append(content_data)

            return JsonResponse(
                {
                    "content": content,
                },
                safe=False,
            )

        else:
            return JsonResponse(
                {"error": "Couldn't fetch movie data. Please refresh and try again"},
                status=400,
            )

    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON provided."}, status=400)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)