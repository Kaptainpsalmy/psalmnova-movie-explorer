import requests, os
from dotenv import load_dotenv



load_dotenv()  



API_KEY = os.getenv("TMDB_API_KEY")  # or paste the key temporarily
url = f"https://api.themoviedb.org/3/trending/movie/week?api_key={API_KEY}"

response = requests.get(url)
print(response.json())
