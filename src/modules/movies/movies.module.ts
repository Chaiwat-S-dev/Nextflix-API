import { Module } from '@nestjs/common';
import { MovieController } from './controllers/movie.controller';
import { MovieService } from './services/movie.service';
import { MovieRepository } from './repositories/movie.repository';

@Module({
  controllers: [MovieController],
  providers: [
    MovieService,
    {
      provide: 'IMovieRepository',
      useClass: MovieRepository,
    },
  ],
  exports: [MovieService],
})
export class MoviesModule {}

