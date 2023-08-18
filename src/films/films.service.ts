import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { Film } from './film.model';

@Injectable()
export class FilmsService {

  constructor(@InjectModel('film') private readonly filmModel: Model<Film>) { }

  create(createFilmDto: CreateFilmDto) {
    return this.filmModel.create(createFilmDto);
  }

  findAll() {
    return this.filmModel.find();
  }

  findOne(id: string) {
    return this.filmModel.findById(id);
  }

  update(id: string, updateFilmDto: UpdateFilmDto) {
    return this.filmModel.findByIdAndUpdate({ _id: id }, { ...updateFilmDto }, { new: true });
  }

  remove(id: string) {
    return this.filmModel.findByIdAndRemove(id);
  }
}
