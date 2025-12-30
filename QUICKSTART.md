# Quick Start Guide

## 1. Install Dependencies

```bash
cd ~/my_workspace/Nextflix
npm install
```

## 2. Create .env File

Create a `.env` file in the root directory with the following content:

```env
NODE_ENV=development
PORT=3000
API_PREFIX=api
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
CACHE_TTL=300
THROTTLE_TTL=60
THROTTLE_LIMIT=10
LOG_LEVEL=info
```

**Important:** Get your TMDB API key from: https://www.themoviedb.org/settings/api

## 3. Run the Application

```bash
# Development mode (with hot reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

## 4. Test the API

Once running, the application will be available at:
- **API Base:** http://localhost:3000/api
- **Swagger Docs:** http://localhost:3000/api/docs
- **Health Check:** http://localhost:3000/api/health

### Example API Calls

```bash
# Search movies
curl "http://localhost:3000/api/movies/search?query=The%20Matrix&page=1"

# Get movie details (using numeric ID)
curl "http://localhost:3000/api/movies/603"

# Get genres list
curl "http://localhost:3000/api/movies/genres"

# Get trending movies
curl "http://localhost:3000/api/movies/trending?timeWindow=day"

# Get movies list with filtering
curl "http://localhost:3000/api/movies?sortBy=popularity.desc&withGenres=28"

# Get popular movies
curl "http://localhost:3000/api/movies/popular?page=1"
```

## 5. Verify Installation

Check that everything is working:

```bash
# Health check
curl http://localhost:3000/api/health

# Should return:
# {"status":"ok","timestamp":"2024-..."}
```

## Troubleshooting

- **Port already in use:** Change `PORT` in `.env` file
- **TMDB API errors:** Verify your API key is correct
- **Module not found:** Run `npm install` again

