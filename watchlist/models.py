from django.db import models
from django.contrib.auth import get_user_model
from django.forms import ValidationError
import json

User = get_user_model()

class Content(models.Model):
    title = models.TextField()
    overview = models.TextField()
    image_link = models.URLField()
    director = models.TextField(null=True)
    actors = models.TextField(null=True)
    release_date = models.DateField()
    tmdb_rating = models.FloatField()
    user_rating = models.FloatField(null=True, default=0)
    genre_ids = models.CharField(max_length=255, blank=True)
    genres = models.TextField(null=True, blank=True)
    tmdb_id = models.IntegerField(unique=True)
    seasons = models.IntegerField(null=True)
    episodes = models.IntegerField(null=True)
    type = models.CharField(max_length=5)
    trailer_link = models.URLField()

    def clean(self):
        if self.type not in ["movie", "tv"]:
            raise ValidationError("Type must be 'movie' or 'tv' ")
        
        if self.user_rating is not None and (self.user_rating < 0 or self.user_rating > 10):
            raise ValidationError("User Rating must be between 0 and 10.")
        
    def formatted_release_date(self):
        return self.release_date.strftime('%Y-%m-%d')
        
    def set_genre_ids(self, genre_ids):
        self.genre_ids = ','.join(map(str, genre_ids))

    def get_genre_ids(self):
        return list(map(int, self.genre_ids.split(','))) if self.genre_ids else []
    
    def set_genres(self, genre_list):
        self.genres = ','.join(genre_list)

    def get_genres(self):
        if self.genres:
            # Remove brackets and extra spaces, then split by comma
            return [genre.strip().strip("'") for genre in self.genres.strip("[]").split(",")]
        return []

    def __str__(self):
        return self.title
        

class Watchlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="my_watchlist")
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name="watchlist")
    added = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.user.username}'s Watchlist"
        



