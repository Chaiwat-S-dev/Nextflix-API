export class Movie {
  id: number;
  title: string;
  overview: string;
  releaseDate: string;
  posterPath: string | null;
  backdropPath: string | null;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  originalLanguage: string;
  originalTitle: string;
  genreIds: number[];
  adult: boolean;
  video: boolean;
}

export class MovieDetail extends Movie {
  genres: Genre[];
  runtime: number | null;
  budget: number;
  revenue: number;
  homepage: string | null;
  imdbId: string | null;
  productionCompanies: ProductionCompany[];
  productionCountries: ProductionCountry[];
  spokenLanguages: SpokenLanguage[];
  status: string;
  tagline: string | null;
}

export class Genre {
  id: number;
  name: string;
}

export class ProductionCompany {
  id: number;
  name: string;
  logoPath: string | null;
  originCountry: string;
}

export class ProductionCountry {
  iso31661: string;
  name: string;
}

export class SpokenLanguage {
  iso6391: string;
  name: string;
}

export class MovieSearchResult {
  page: number;
  results: Movie[];
  totalPages: number;
  totalResults: number;
}

