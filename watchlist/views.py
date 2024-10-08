import json
from django.shortcuts import render
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import requests

from watchlist.helpers import build_content_data


@login_required
def index(request):
    return render(request, "watchlist/index.html")

@csrf_exempt
@login_required
def search(request):
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

                content.append(build_content_data(item))

            return JsonResponse({
                "content": content,
                "currentPage": current_page
            }, safe=False)

        elif search_type == "person":
            for element in results:
                movies = element.get("known_for", [])
                for item in movies:
              
                    content.append(build_content_data(item))

            return JsonResponse({
                "content": content,
                "currentPage": current_page
            }, safe=False)
        
    else:
        return JsonResponse({"error": "Couldn't fetch movie data. Please refresh and try again"}, status=400)


@csrf_exempt
@login_required
def get_suggestions(request):
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
            content.append(build_content_data(item))

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
            content.append(build_content_data(item))

        return JsonResponse({
            "content": content,
            "totalPages": total_pages,
            "currentPage": current_page
        }, safe=False)
    
    else:
        return JsonResponse({"error": "Couldn't fetch movie data. Please refresh and try again"}, status=400)


def watchlist(request):
    return render(request, "watchlist/watchlist.html")