from django.db import models
from django.contrib.auth import get_user_model
from django.forms import ValidationError

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
    tmdb_id = models.IntegerField(unique=True)
    seasons = models.IntegerField(null=True)
    episodes = models.IntegerField(null=True)
    type = models.CharField(max_length=5)

    def clean(self):
        if self.type not in ["movie", "tv"]:
            raise ValidationError("Type must be 'movie' or 'tv' ")
        
    def set_genre_ids(self, genre_ids):
        self.genre_ids = ','.join(map(str, genre_ids))

    def get_genre_ids(self):
        return list(map(int, self.genre_ids.split(','))) if self.genre_ids else []

    def __str__(self):
        return self.title
        

class Watchlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="my_watchlist")
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name="watchlist")
    added = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.user.username}'s Watchlist"
        



