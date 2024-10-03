def build_content_data(item):
    movie = {
                    "id": item.get("id"),
                    "title": item.get("title") or item.get("name"),
                    "release_date": item.get("release_date") or item.get("first_air_date"),
                    "rating": round(item.get("vote_average"), 1),
                    "overview": item.get("overview"),
                    "image": f"https://image.tmdb.org/t/p/w342/{item.get('poster_path')}" if item.get('poster_path') else None,
                    "type": "movie" if item.get('title') else "tv",
                }
    
    return movie