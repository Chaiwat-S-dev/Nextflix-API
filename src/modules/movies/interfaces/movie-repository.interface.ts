import { Movie, MovieDetail, MovieSearchResult } from '../entities/movie.entity';

export interface SearchMoviesParams {
  query: string;
  page: number;
}

export interface GetMovieByIdParams {
  id: number | string; // Supports both numeric ID and IMDb ID (e.g., "tt3896198")
}

export interface GetPopularMoviesParams {
  page: number;
}

export interface IMovieRepository {
  searchMovies(params: SearchMoviesParams): Promise<MovieSearchResult>;
  getMovieById(params: GetMovieByIdParams): Promise<MovieDetail>;
  getPopularMovies(params: GetPopularMoviesParams): Promise<MovieSearchResult>;
}

