import { Movie, MovieDetail, MovieSearchResult, Genre } from '../entities/movie.entity';

export interface SearchMoviesParams {
  query: string;
  page: number;
}

export interface GetMovieByIdParams {
  id: number; // TMDB uses numeric IDs only
}

export interface GetPopularMoviesParams {
  page: number;
}

export interface GetGenresParams {
  // Empty interface - no params needed for genres endpoint
}

export interface GetTrendingMoviesParams {
  page: number;
  timeWindow: 'day' | 'week';
}

export interface GetMoviesParams {
  page: number;
  sortBy?: string;
  withGenres?: string;
  year?: number;
  voteAverageGte?: number;
}

export interface IMovieRepository {
  searchMovies(params: SearchMoviesParams): Promise<MovieSearchResult>;
  getMovieById(params: GetMovieByIdParams): Promise<MovieDetail>;
  getPopularMovies(params: GetPopularMoviesParams): Promise<MovieSearchResult>;
  getGenres(params: GetGenresParams): Promise<Genre[]>;
  getTrendingMovies(params: GetTrendingMoviesParams): Promise<MovieSearchResult>;
  getMovies(params: GetMoviesParams): Promise<MovieSearchResult>;
}

