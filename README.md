# Nextflix Backend API

A production-ready NestJS backend service that provides movie data by integrating with The Movie Database (TMDB) API.

## 🏗 Architecture

This project follows **Clean Architecture** principles with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────┐
│                    Controller Layer                      │
│              (HTTP Requests & Responses)                │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                     Service Layer                        │
│              (Business Logic & Caching)                  │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│                   Repository Layer                      │
│            (External API Calls - TMDB)                   │
└─────────────────────────────────────────────────────────┘
```

### Project Structure

```
src/
├── modules/
│   └── movies/
│       ├── controllers/      # HTTP request handlers
│       ├── services/         # Business logic
│       ├── repositories/     # External API integration
│       ├── dto/              # Data Transfer Objects
│       ├── interfaces/       # Repository interfaces
│       └── entities/         # Domain entities
├── common/
│   ├── filters/             # Exception filters
│   ├── interceptors/        # Request/Response interceptors
│   ├── logging/             # Logger service
│   └── constants/           # Error codes
├── config/                  # Configuration modules
├── main.ts                  # Application bootstrap
└── app.module.ts            # Root module
```

## 🚀 Features

- ✅ Clean Architecture with dependency injection
- ✅ RESTful API endpoints
- ✅ Request validation with class-validator
- ✅ Global exception handling
- ✅ In-memory caching (5-10 minutes TTL)
- ✅ Structured logging with Pino
- ✅ Swagger API documentation
- ✅ Rate limiting
- ✅ Response compression
- ✅ Health check endpoint
- ✅ Dockerized application

## 📋 Prerequisites

- Node.js 20+ 
- npm or yarn
- TMDB API Key ([Get one here](https://www.themoviedb.org/settings/api))

## 🛠 Setup Instructions

### 1. Clone and Install

```bash
cd ~/my_workspace/Nextflix
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# Application
NODE_ENV=development
PORT=3000
API_PREFIX=api

# TMDB API
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3

# Cache
CACHE_TTL=300

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# Logging
LOG_LEVEL=info
```

**Important:** Replace `your_tmdb_api_key_here` with your actual TMDB API Bearer token. Get your API key from [TMDB Settings](https://www.themoviedb.org/settings/api). The API uses Bearer token authentication in the Authorization header.

### 3. Run Locally

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The application will start on `http://localhost:3000`

## 📚 API Documentation

Once the application is running, access Swagger documentation at:

**http://localhost:3000/api/docs**

## 🌐 API Endpoints

### Search Movies

```http
GET /api/movies/search?query=The Matrix&page=1
```

**Query Parameters:**
- `query` (required): Search query string
- `page` (optional): Page number (default: 1)

**Example Response:**
```json
{
  "page": 1,
  "results": [
    {
      "id": 603,
      "title": "The Matrix",
      "overview": "Set in the 22nd century...",
      "releaseDate": "1999-03-31",
      "posterPath": "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
      "voteAverage": 8.7,
      "voteCount": 25000
    }
  ],
  "totalPages": 10,
  "totalResults": 200
}
```

### Get Movie Details

```http
GET /api/movies/:id
```

**Path Parameters:**
- `id` (required): Movie ID (numeric, e.g., `603`)

**Example:**
```http
GET /api/movies/603
```

### Get Movies List (Discover)

```http
GET /api/movies?page=1&sortBy=popularity.desc&withGenres=28&year=2020
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `sortBy` (optional): Sort order (popularity.desc, vote_average.desc, release_date.desc)
- `withGenres` (optional): Comma-separated genre IDs
- `year` (optional): Release year
- `voteAverageGte` (optional): Minimum vote average

### Get Genres

```http
GET /api/movies/genres
```

**Response:**
```json
{
  "genres": [
    {"id": 28, "name": "Action"},
    {"id": 12, "name": "Adventure"}
  ]
}
```

### Get Trending Movies

```http
GET /api/movies/trending?page=1&timeWindow=day
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `timeWindow` (optional): 'day' or 'week' (default: 'day')

### Get Popular Movies

```http
GET /api/movies/popular?page=1
```

**Query Parameters:**
- `page` (optional): Page number (default: 1)

## 🏥 Health Check

```http
GET /api/health
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🐳 Docker

### Build Docker Image

```bash
docker build -t nextflix-api .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e TMDB_API_KEY=your_api_key \
  -e PORT=3000 \
  nextflix-api
```

### Docker Compose (Optional)

Create a `docker-compose.yml`:

```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - TMDB_API_KEY=${TMDB_API_KEY}
      - CACHE_TTL=300
    healthcheck:
      test: ["CMD", "node", "-e", "require('http').get('http://localhost:3000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"]
      interval: 30s
      timeout: 3s
      retries: 3
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 📊 Error Response Format

All errors follow a consistent format:

```json
{
  "statusCode": 404,
  "message": "Movie with ID 999999 not found",
  "errorCode": "MOVIE_NOT_FOUND",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/movies/999999"
}
```

## 🔒 Rate Limiting

Public endpoints are rate-limited:
- Default: 10 requests per 60 seconds
- Search/Popular/Detail endpoints: 20 requests per 60 seconds

Rate limit headers are included in responses:
- `X-RateLimit-Limit`
- `X-RateLimit-Remaining`
- `X-RateLimit-Reset`

## 💾 Caching

The application uses in-memory caching with the following cache keys:
- `movies:search:{query}:{page}` - Search results
- `movies:detail:{movieId}` - Movie details
- `movies:popular:{page}` - Popular movies
- `movies:discover:{params}` - Discover/list movies
- `movies:trending:{timeWindow}:{page}` - Trending movies
- `movies:genres` - Genres list

Default TTL: 5 minutes (300 seconds)

## 📝 Logging

Structured logging is implemented using Pino:
- Development: Pretty-printed logs
- Production: JSON logs
- Request/Response logging with correlation IDs
- Error logging with stack traces

## 🚢 Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `TMDB_API_KEY`
   - `NODE_ENV=production`
   - `PORT=3000`

### Other Platforms

The application can be deployed to:
- Railway
- Render
- Fly.io
- Any platform supporting Node.js

## 🛡 Security Features

- Helmet.js for security headers
- Input validation
- Rate limiting
- Error message sanitization
- Request ID correlation

## 📦 Dependencies

### Core
- `@nestjs/common` - NestJS core
- `@nestjs/core` - NestJS framework
- `@nestjs/platform-express` - Express adapter

### Features
- `@nestjs/config` - Configuration management
- `@nestjs/swagger` - API documentation
- `@nestjs/throttler` - Rate limiting
- `@nestjs/cache-manager` - Caching
- `axios` - HTTP client
- `pino` - Structured logging
- `class-validator` - Validation
- `class-transformer` - Transformation

## 📄 License

MIT

## 👤 Author

Technical Assessment Project

---

**Note:** This is a technical assessment project demonstrating production-ready NestJS backend development practices.

