import {
  Controller,
  Get,
  Query,
  Param,
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { MovieService } from '../services/movie.service';
import { SearchMoviesDto } from '../dto/search-movies.dto';
import { GetMovieByIdDto } from '../dto/get-movie-by-id.dto';
import { GetPopularMoviesDto } from '../dto/get-popular-movies.dto';
import { MovieSearchResult } from '../entities/movie.entity';
import { MovieDetail } from '../entities/movie.entity';

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

  @Get(':id')
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  @ApiOperation({ summary: 'Get movie details by ID (IMDb ID format: tt1234567)' })
  @ApiParam({ name: 'id', description: 'Movie ID (IMDb ID format: tt1234567 or numeric)', example: 'tt3896198' })
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
      id: params.id as string,
    });
  }
}

