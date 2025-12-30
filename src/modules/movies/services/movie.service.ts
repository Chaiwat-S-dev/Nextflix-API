import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { IMovieRepository } from '../interfaces/movie-repository.interface';
import {
  SearchMoviesParams,
  GetMovieByIdParams,
  GetPopularMoviesParams,
} from '../interfaces/movie-repository.interface';
import { MovieSearchResult, MovieDetail } from '../entities/movie.entity';

@Injectable()
export class MovieService {
  constructor(
    @Inject('IMovieRepository') private readonly movieRepository: IMovieRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async searchMovies(params: SearchMoviesParams): Promise<MovieSearchResult> {
    const cacheKey = `movies:search:${params.query}:${params.page}`;

    const cached = await this.cacheManager.get<MovieSearchResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.movieRepository.searchMovies(params);
    await this.cacheManager.set(cacheKey, result);

    return result;
  }

  async getMovieById(params: GetMovieByIdParams): Promise<MovieDetail> {
    const cacheKey = `movies:detail:${params.id}`;

    const cached = await this.cacheManager.get<MovieDetail>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.movieRepository.getMovieById({
      id: params.id,
    });
    await this.cacheManager.set(cacheKey, result);

    return result;
  }

  async getPopularMovies(params: GetPopularMoviesParams): Promise<MovieSearchResult> {
    const cacheKey = `movies:popular:${params.page}`;

    const cached = await this.cacheManager.get<MovieSearchResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const result = await this.movieRepository.getPopularMovies(params);
    await this.cacheManager.set(cacheKey, result);

    return result;
  }
}
