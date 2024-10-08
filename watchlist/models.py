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
    user_rating = models.FloatField()
    genre_id = models.IntegerField()
    tmdb_id = models.IntegerField(unique=True)
    seasons = models.IntegerField(null=True)
    episodes = models.IntegerField(null=True)

    def __str__(self):
        return self.title
        

class Watchlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="watchlist")
    content = models.ForeignKey(Content, on_delete=models.CASCADE, related_name="watchlist")
    type = models.CharField(max_length=5)
    added = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.type not in ["movie", "tv"]:
            raise ValidationError("Type must be 'movie' or 'tv' ")
        

    def __str__(self):
        return f"{self.user.username}'s Watchlist"
        



