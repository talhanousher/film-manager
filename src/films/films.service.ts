import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentFilmDto } from './dto/comment-film.dto';
import { CreateFilmDto } from './dto/create-film.dto';
import { RatingFilmDto } from './dto/rating-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { Film } from './film.model';

import { Client } from '@elastic/elasticsearch';
const client = new Client({
  node: process.env.ELASTIC_ENDPOINT, // Elasticsearch endpoint
  auth: {
    apiKey: { // API key ID and secret
      id: process.env.ELASTIC_ID,
      api_key: process.env.ELATSIC_API_KEY,
    }
  }
})
@Injectable()
export class FilmsService {

  constructor(@InjectModel('film') private readonly filmModel: Model<Film>) { }

  async create(createFilmDto: CreateFilmDto) {
    const film = await this.filmModel.create(createFilmDto);
    // await client.indices.create({ index: 'my_index' })
    const { _id, ...dataForElasticSearch } = film.toJSON()
    await client.index({
      index: 'search-films',
      id: film._id,
      document: dataForElasticSearch,
    })
    return film;
  }

  findAll() {
    return this.filmModel.find().populate([{ path: "ratings.user comments.user", select: 'name email' }]);
  }

  findOne(id: string) {
    return this.filmModel.findById(id).populate([{ path: "ratings.user comments.user", select: 'name email' }]);
  }

  async update(id: string, updateFilmDto: UpdateFilmDto) {
    const film = await this.filmModel.findByIdAndUpdate({ _id: id }, { ...updateFilmDto }, { new: true });
    const { _id, ...dataForElasticSearch } = film.toJSON()
    await client.update({
      index: 'search-films',
      id: film._id,
      doc: dataForElasticSearch,
    })
    return film
  }

  async remove(id: string) {
    await client.delete({
      index: 'search-films',
      id: id
    })
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
    const updatedFilm = await this.filmModel.findOneAndUpdate({ _id: id }, { $push: { ratings: ratingFilmDto } }, { new: true }).populate([{ path: "ratings.user comments.user", select: 'name email' }])
    const { _id, ...dataForElasticSearch } = updatedFilm.toJSON()
    await client.update({
      index: 'search-films',
      id: updatedFilm._id,
      doc: dataForElasticSearch,
    })
    return updatedFilm;
  }

  async addComment(id: string, commentFilmDto: CommentFilmDto) {
    const film: any = await this.filmModel.findById(id);
    if (!film) {
      throw new NotFoundException('Film Not Found!')
    }
    const updatedFilm = await this.filmModel.findOneAndUpdate({ _id: id }, { $push: { comments: commentFilmDto } }, { new: true }).populate([{ path: "ratings.user comments.user", select: 'name email' }]);
    const { _id, ...dataForElasticSearch } = updatedFilm.toJSON()
    await client.update({
      index: 'search-films',
      id: updatedFilm._id,
      doc: dataForElasticSearch,
    })
    return updatedFilm;
  }

  async search(search: any) {
    const results = await client.search({
      index: 'search-films',
      query: {
        multi_match: {
          query: search.text,
          fields: ['name', 'description', 'genre', 'country', 'ratings.rating'],
          fuzziness: 'AUTO'
        }
      },

    });
    return results.hits.hits;
  }
}
