from django.urls import path
from . import views


urlpatterns = [
    path("", views.index, name="index"),
    path("watchlist/", views.watchlist, name="watchlist"),
    
    # API calls
    path("search/", views.search, name="search"),
    path("get-suggestions/", views.get_suggestions, name="get-suggestions"),
    path("get-genre-suggestions/", views.get_genre_suggestions, name="get-gerne-suggestions"),
    path("toggle-watchlist/", views.toggle_watchlist, name="toggle-watchlist"),
    path("update-user-rating/", views.update_user_rating, name="update-user-rating"),
    path("recommendations/", views.get_recommendations, name="recommendations")
]

