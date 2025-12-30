import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  IMovieRepository,
  SearchMoviesParams,
  GetMovieByIdParams,
  GetPopularMoviesParams,
  GetGenresParams,
  GetTrendingMoviesParams,
  GetMoviesParams,
} from '../interfaces/movie-repository.interface';
import {
  Movie,
  MovieDetail,
  MovieSearchResult,
  Genre,
  ProductionCompany,
  ProductionCountry,
  SpokenLanguage,
} from '../entities/movie.entity';
import { ErrorCodes } from '../../../common/constants/error-codes';

@Injectable()
export class MovieRepository implements IMovieRepository {
  private readonly httpClient: AxiosInstance;
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('TMDB_API_KEY');
    this.baseUrl = this.configService.get<string>('TMDB_BASE_URL', 'https://api.themoviedb.org/3');

    if (!this.apiKey) {
      throw new Error('TMDB_API_KEY is required');
    }

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      timeout: 10000,
    });
  }

  async searchMovies(params: SearchMoviesParams): Promise<MovieSearchResult> {
    try {
      const response = await this.httpClient.get('/search/movie', {
        params: {
          query: params.query,
          page: params.page,
        },
      });

      return this.mapToMovieSearchResult(response.data);
    } catch (error) {
      this.handleError(error, 'Failed to search movies');
    }
  }

  async getMovieById(params: GetMovieByIdParams): Promise<MovieDetail> {
    try {
      const response = await this.httpClient.get(`/movie/${params.id}`);

      return this.mapToMovieDetail(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new HttpException(
          {
            message: `Movie with ID ${params.id} not found`,
            errorCode: ErrorCodes.MOVIE_NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      this.handleError(error, `Failed to get movie with ID ${params.id}`);
    }
  }

  async getPopularMovies(params: GetPopularMoviesParams): Promise<MovieSearchResult> {
    try {
      const response = await this.httpClient.get('/movie/popular', {
        params: {
          page: params.page,
        },
      });

      return this.mapToMovieSearchResult(response.data);
    } catch (error) {
      this.handleError(error, 'Failed to get popular movies');
    }
  }

  async getGenres(params: GetGenresParams): Promise<Genre[]> {
    void params; // Intentionally unused - endpoint requires no params
    try {
      const response = await this.httpClient.get('/genre/movie/list');
      return this.mapToGenres(response.data.genres || []);
    } catch (error) {
      this.handleError(error, 'Failed to get genres');
    }
  }

  async getTrendingMovies(params: GetTrendingMoviesParams): Promise<MovieSearchResult> {
    try {
      const response = await this.httpClient.get(`/trending/movie/${params.timeWindow}`, {
        params: {
          page: params.page,
        },
      });

      return this.mapToMovieSearchResult(response.data);
    } catch (error) {
      this.handleError(error, 'Failed to get trending movies');
    }
  }

  async getMovies(params: GetMoviesParams): Promise<MovieSearchResult> {
    try {
      const requestParams: any = {
        page: params.page,
      };

      if (params.sortBy) {
        requestParams.sort_by = params.sortBy;
      }

      if (params.withGenres) {
        requestParams.with_genres = params.withGenres;
      }

      if (params.year) {
        requestParams.year = params.year;
      }

      if (params.voteAverageGte !== undefined) {
        requestParams['vote_average.gte'] = params.voteAverageGte;
      }

      const response = await this.httpClient.get('/discover/movie', {
        params: requestParams,
      });

      return this.mapToMovieSearchResult(response.data);
    } catch (error) {
      this.handleError(error, 'Failed to get movies');
    }
  }

  private mapToMovieSearchResult(data: any): MovieSearchResult {
    return {
      page: data.page,
      results: (data.results || []).map((movie: any) => this.mapToMovie(movie)),
      totalPages: data.total_pages,
      totalResults: data.total_results,
    };
  }

  private mapToMovie(data: any): Movie {
    return {
      id: data.id,
      title: data.title,
      overview: data.overview,
      releaseDate: data.release_date,
      posterPath: data.poster_path,
      backdropPath: data.backdrop_path,
      voteAverage: data.vote_average,
      voteCount: data.vote_count,
      popularity: data.popularity,
      originalLanguage: data.original_language,
      originalTitle: data.original_title,
      genreIds: data.genre_ids || [],
      adult: data.adult || false,
      video: data.video || false,
    };
  }

  private mapToMovieDetail(data: any): MovieDetail {
    const movie = this.mapToMovie(data);

    return {
      ...movie,
      genres: (data.genres || []).map((genre: any) => ({
        id: genre.id,
        name: genre.name,
      })) as Genre[],
      runtime: data.runtime,
      budget: data.budget || 0,
      revenue: data.revenue || 0,
      homepage: data.homepage,
      imdbId: data.imdb_id,
      productionCompanies: (data.production_companies || []).map((company: any) => ({
        id: company.id,
        name: company.name,
        logoPath: company.logo_path,
        originCountry: company.origin_country,
      })) as ProductionCompany[],
      productionCountries: (data.production_countries || []).map((country: any) => ({
        iso31661: country.iso_3166_1,
        name: country.name,
      })) as ProductionCountry[],
      spokenLanguages: (data.spoken_languages || []).map((language: any) => ({
        iso6391: language.iso_639_1,
        name: language.name,
      })) as SpokenLanguage[],
      status: data.status,
      tagline: data.tagline,
    };
  }

  private mapToGenres(data: any[]): Genre[] {
    return data.map((genre: any) => ({
      id: genre.id,
      name: genre.name,
    })) as Genre[];
  }

  private handleError(error: any, defaultMessage: string): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const message = error.response?.data?.status_message || defaultMessage;

      throw new HttpException(
        {
          message,
          errorCode: ErrorCodes.TMDB_API_ERROR,
        },
        status,
      );
    }

    throw new HttpException(
      {
        message: defaultMessage,
        errorCode: ErrorCodes.INTERNAL_SERVER_ERROR,
      },
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }
}
