import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  IMovieRepository,
  SearchMoviesParams,
  GetMovieByIdParams,
  GetPopularMoviesParams,
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
    this.apiKey = this.configService.get<string>('OMDB_API_KEY');
    this.baseUrl = this.configService.get<string>('OMDB_BASE_URL', 'http://www.omdbapi.com');

    if (!this.apiKey) {
      throw new Error('OMDB_API_KEY is required');
    }

    this.httpClient = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
    });
  }

  async searchMovies(params: SearchMoviesParams): Promise<MovieSearchResult> {
    try {
      const response = await this.httpClient.get('/', {
        params: {
          s: params.query,
          page: params.page,
          apikey: this.apiKey,
        },
      });

      if (response.data.Response === 'False') {
        throw new HttpException(
          {
            message: response.data.Error || 'No movies found',
            errorCode: ErrorCodes.MOVIE_NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return this.mapToMovieSearchResult(response.data, params.page);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.handleError(error, 'Failed to search movies');
    }
  }

  async getMovieById(params: GetMovieByIdParams): Promise<MovieDetail> {
    try {
      // OMDB uses IMDb ID (string), so we accept both numeric ID and IMDb ID
      const imdbId = typeof params.id === 'string' ? params.id : `tt${String(params.id).padStart(7, '0')}`;
      
      const response = await this.httpClient.get('/', {
        params: {
          i: imdbId,
          apikey: this.apiKey,
        },
      });

      if (response.data.Response === 'False') {
        throw new HttpException(
          {
            message: response.data.Error || `Movie with ID ${params.id} not found`,
            errorCode: ErrorCodes.MOVIE_NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return this.mapToMovieDetail(response.data);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
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
    // OMDB doesn't have a popular movies endpoint, so we'll search for popular terms
    // This is a workaround - you might want to remove this endpoint or use a different approach
    try {
      const popularQueries = ['movie', 'action', 'drama', 'comedy', 'thriller'];
      const query = popularQueries[(params.page - 1) % popularQueries.length];
      
      const response = await this.httpClient.get('/', {
        params: {
          s: query,
          page: params.page,
          apikey: this.apiKey,
        },
      });

      if (response.data.Response === 'False') {
        throw new HttpException(
          {
            message: response.data.Error || 'No movies found',
            errorCode: ErrorCodes.MOVIE_NOT_FOUND,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return this.mapToMovieSearchResult(response.data, params.page);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.handleError(error, 'Failed to get popular movies');
    }
  }

  private mapToMovieSearchResult(data: any, page: number): MovieSearchResult {
    const searchResults = data.Search || [];
    const totalResults = parseInt(data.totalResults || '0', 10);
    const resultsPerPage = 10; // OMDB returns 10 results per page
    const totalPages = Math.ceil(totalResults / resultsPerPage);

    return {
      page,
      results: searchResults.map((movie: any) => this.mapToMovie(movie)),
      totalPages,
      totalResults,
    };
  }

  private mapToMovie(data: any): Movie {
    // Extract IMDb ID from imdbID field (format: tt1234567)
    const imdbId = data.imdbID || data.imdbId || '';
    const numericId = imdbId.replace('tt', '') || '0';

    // Parse ratings to get average rating
    const ratings = data.Ratings || [];
    const imdbRating = parseFloat(data.imdbRating || '0');
    const metascore = parseFloat(data.Metascore || '0');
    const voteAverage = imdbRating || (metascore / 10) || 0;
    const voteCount = parseInt(data.imdbVotes?.replace(/,/g, '') || '0', 10);

    // Parse genre string to array
    const genreString = data.Genre || '';
    const genres = genreString.split(',').map((g: string) => g.trim()).filter(Boolean);

    return {
      id: parseInt(numericId, 10) || 0,
      title: data.Title || data.title || '',
      overview: data.Plot || data.overview || '',
      releaseDate: data.Released || data.releaseDate || data.Year || '',
      posterPath: data.Poster || data.posterPath || null,
      backdropPath: data.Poster || data.backdropPath || null,
      voteAverage,
      voteCount,
      popularity: voteAverage * voteCount, // Calculate popularity score
      originalLanguage: data.Language?.split(',')[0]?.trim() || data.originalLanguage || 'en',
      originalTitle: data.Title || data.originalTitle || '',
      genreIds: genres.map((g: string, idx: number) => idx + 1), // Map genres to IDs
      adult: data.Rated === 'R' || data.Rated === 'NC-17' || data.adult || false,
      video: false,
    };
  }

  private mapToMovieDetail(data: any): MovieDetail {
    const movie = this.mapToMovie(data);

    // Parse runtime from "136 min" format
    const runtimeMatch = (data.Runtime || '').match(/(\d+)/);
    const runtime = runtimeMatch ? parseInt(runtimeMatch[1], 10) : null;

    // Parse box office revenue
    const boxOffice = data.BoxOffice || '';
    const revenue = boxOffice ? parseInt(boxOffice.replace(/[^0-9]/g, ''), 10) : 0;

    // Parse genres
    const genreString = data.Genre || '';
    const genreNames = genreString.split(',').map((g: string) => g.trim()).filter(Boolean);
    const genres = genreNames.map((name: string, idx: number) => ({
      id: idx + 1,
      name,
    })) as Genre[];

    // Parse production companies from Production field
    const productionString = data.Production || '';
    const productionCompanies = productionString
      ? productionString.split(',').map((name: string, idx: number) => ({
          id: idx + 1,
          name: name.trim(),
          logoPath: null,
          originCountry: data.Country?.split(',')[0]?.trim() || '',
        }))
      : [] as ProductionCompany[];

    // Parse countries
    const countryString = data.Country || '';
    const productionCountries = countryString
      .split(',')
      .map((name: string) => ({
        iso31661: '', // OMDB doesn't provide ISO codes
        name: name.trim(),
      })) as ProductionCountry[];

    // Parse languages
    const languageString = data.Language || '';
    const spokenLanguages = languageString
      .split(',')
      .map((name: string) => ({
        iso6391: '', // OMDB doesn't provide ISO codes
        name: name.trim(),
      })) as SpokenLanguage[];

    return {
      ...movie,
      genres,
      runtime,
      budget: 0, // OMDB doesn't provide budget
      revenue,
      homepage: data.Website !== 'N/A' ? data.Website : null,
      imdbId: data.imdbID || data.imdbId || null,
      productionCompanies,
      productionCountries,
      spokenLanguages,
      status: 'Released', // OMDB doesn't provide status, assume released
      tagline: null, // OMDB doesn't provide tagline
    };
  }

  private handleError(error: any, defaultMessage: string): never {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR;
      const errorData = error.response?.data;
      const message = errorData?.Error || errorData?.status_message || defaultMessage;

      throw new HttpException(
        {
          message,
          errorCode: ErrorCodes.OMDB_API_ERROR,
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

