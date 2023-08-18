import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentFilmDto } from './dto/comment-film.dto';
import { CreateFilmDto } from './dto/create-film.dto';
import { RatingFilmDto } from './dto/rating-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { Film } from './film.model';

@Injectable()
export class FilmsService {

  constructor(@InjectModel('film') private readonly filmModel: Model<Film>) { }

  create(createFilmDto: CreateFilmDto) {
    return this.filmModel.create(createFilmDto);
  }

  findAll() {
    return this.filmModel.find().populate([{ path: "ratings.user comments.user", select: 'name email' }]);
  }

  findOne(id: string) {
    return this.filmModel.findById(id).populate([{ path: "ratings.user comments.user", select: 'name email' }]);
  }

  update(id: string, updateFilmDto: UpdateFilmDto) {
    return this.filmModel.findByIdAndUpdate({ _id: id }, { ...updateFilmDto }, { new: true });
  }

  remove(id: string) {
    return this.filmModel.findByIdAndRemove(id);
  }

  async addRating(id: string, ratingFilmDto: RatingFilmDto) {
    const film: any = await this.filmModel.findById(id);
    if (!film) {
      throw new NotFoundException('Film Not Found!')
    }
    const isAlreadyGivesRating = film.ratings.find(o => o.user.toString() === ratingFilmDto.user.toString());
    if (isAlreadyGivesRating) {
      throw new ForbiddenException('Already here!!')
    }
    return this.filmModel.findOneAndUpdate({ _id: id }, { $push: { ratings: ratingFilmDto } }, { new: true }).populate([{ path: "ratings.user comments.user", select: 'name email' }]);
  }

  async addComment(id: string, commentFilmDto: CommentFilmDto) {
    const film: any = await this.filmModel.findById(id);
    if (!film) {
      throw new NotFoundException('Film Not Found!')
    }
    return this.filmModel.findOneAndUpdate({ _id: id }, { $push: { comments: commentFilmDto } }, { new: true }).populate([{ path: "ratings.user comments.user", select: 'name email' }]);
  }
}
