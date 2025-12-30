import { Controller, Get, Query, Param, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { MovieService } from '../services/movie.service';
import { SearchMoviesDto } from '../dto/search-movies.dto';
import { GetMovieByIdDto } from '../dto/get-movie-by-id.dto';
import { GetPopularMoviesDto } from '../dto/get-popular-movies.dto';
import { GetMoviesDto } from '../dto/get-movies.dto';
import { GetTrendingMoviesDto } from '../dto/get-trending-movies.dto';
import { MovieSearchResult, MovieDetail, Genre } from '../entities/movie.entity';

@ApiTags('movies')
@Controller('movies')
@UseInterceptors(CacheInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  @Get('search')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Search movies' })
  @ApiQuery({ name: 'query', description: 'Search query string', example: 'The Matrix' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Movies found successfully',
    schema: {
      type: 'object',
      properties: {
        page: { type: 'number', example: 1 },
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number', example: 603 },
              title: { type: 'string', example: 'The Matrix' },
              overview: { type: 'string' },
              releaseDate: { type: 'string', example: '1999-03-31' },
              posterPath: { type: 'string', nullable: true },
              backdropPath: { type: 'string', nullable: true },
              voteAverage: { type: 'number', example: 8.7 },
              voteCount: { type: 'number', example: 25000 },
              popularity: { type: 'number' },
              originalLanguage: { type: 'string', example: 'en' },
              originalTitle: { type: 'string' },
              genreIds: { type: 'array', items: { type: 'number' } },
              adult: { type: 'boolean' },
              video: { type: 'boolean' },
            },
          },
        },
        totalPages: { type: 'number', example: 10 },
        totalResults: { type: 'number', example: 200 },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async searchMovies(@Query() query: SearchMoviesDto): Promise<MovieSearchResult> {
    return this.movieService.searchMovies({
      query: query.query,
      page: query.page || 1,
    });
  }

  @Get('popular')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Get popular movies' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiResponse({
    status: 200,
    description: 'Popular movies retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async getPopularMovies(@Query() query: GetPopularMoviesDto): Promise<MovieSearchResult> {
    return this.movieService.getPopularMovies({
      page: query.page || 1,
    });
  }

  @Get()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Get movies list with filtering and sorting' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({
    name: 'sortBy',
    description: 'Sort order',
    required: false,
    example: 'popularity.desc',
  })
  @ApiQuery({
    name: 'withGenres',
    description: 'Comma-separated genre IDs',
    required: false,
    example: '28,12',
  })
  @ApiQuery({ name: 'year', description: 'Release year', required: false, example: 2020 })
  @ApiQuery({
    name: 'voteAverageGte',
    description: 'Minimum vote average',
    required: false,
    example: 7.0,
  })
  @ApiResponse({
    status: 200,
    description: 'Movies retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async getMovies(@Query() query: GetMoviesDto): Promise<MovieSearchResult> {
    return this.movieService.getMovies({
      page: query.page || 1,
      sortBy: query.sortBy,
      withGenres: query.withGenres,
      year: query.year,
      voteAverageGte: query.voteAverageGte,
    });
  }

  @Get('genres')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Get all movie genres' })
  @ApiResponse({
    status: 200,
    description: 'Genres retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'number', example: 28 },
          name: { type: 'string', example: 'Action' },
        },
      },
    },
  })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async getGenres(): Promise<Genre[]> {
    return this.movieService.getGenres({});
  }

  @Get('trending')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Get trending movies' })
  @ApiQuery({ name: 'page', description: 'Page number', required: false, example: 1 })
  @ApiQuery({
    name: 'timeWindow',
    description: 'Time window (day or week)',
    required: false,
    example: 'day',
  })
  @ApiResponse({
    status: 200,
    description: 'Trending movies retrieved successfully',
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async getTrendingMovies(@Query() query: GetTrendingMoviesDto): Promise<MovieSearchResult> {
    return this.movieService.getTrendingMovies({
      page: query.page || 1,
      timeWindow: query.timeWindow || 'day',
    });
  }

  @Get(':id')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Get movie details by ID' })
  @ApiParam({ name: 'id', description: 'Movie ID (numeric)', example: 603 })
  @ApiResponse({
    status: 200,
    description: 'Movie details retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'number', example: 603 },
        title: { type: 'string', example: 'The Matrix' },
        overview: { type: 'string' },
        releaseDate: { type: 'string', example: '1999-03-31' },
        posterPath: { type: 'string', nullable: true },
        backdropPath: { type: 'string', nullable: true },
        voteAverage: { type: 'number', example: 8.7 },
        voteCount: { type: 'number', example: 25000 },
        popularity: { type: 'number' },
        originalLanguage: { type: 'string', example: 'en' },
        originalTitle: { type: 'string' },
        genreIds: { type: 'array', items: { type: 'number' } },
        adult: { type: 'boolean' },
        video: { type: 'boolean' },
        genres: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
            },
          },
        },
        runtime: { type: 'number', nullable: true },
        budget: { type: 'number' },
        revenue: { type: 'number' },
        homepage: { type: 'string', nullable: true },
        imdbId: { type: 'string', nullable: true },
        productionCompanies: { type: 'array' },
        productionCountries: { type: 'array' },
        spokenLanguages: { type: 'array' },
        status: { type: 'string' },
        tagline: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 429, description: 'Too many requests' })
  async getMovieById(@Param() params: GetMovieByIdDto): Promise<MovieDetail> {
    return this.movieService.getMovieById({
      id: params.id,
    });
  }
}
