import { Module } from '@nestjs/common';
import { FilmsService } from './films.service';
import { FilmsController } from './films.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FilmSchema } from './film.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'film', schema: FilmSchema }])
  ],
  controllers: [FilmsController],
  providers: [FilmsService]
})
export class FilmsModule { }
