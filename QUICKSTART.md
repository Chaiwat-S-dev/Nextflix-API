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
OMDB_API_KEY=your_omdb_api_key_here
OMDB_BASE_URL=http://www.omdbapi.com
CACHE_TTL=300
THROTTLE_TTL=60
THROTTLE_LIMIT=10
LOG_LEVEL=info
```

**Important:** Get your OMDB API key from: http://www.omdbapi.com/apikey.aspx

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

# Get movie details (using IMDb ID)
curl "http://localhost:3000/api/movies/tt3896198"

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
- **OMDB API errors:** Verify your API key is correct
- **Module not found:** Run `npm install` again

