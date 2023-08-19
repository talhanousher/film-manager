import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CommentFilmDto } from './dto/comment-film.dto';
import { CreateFilmDto } from './dto/create-film.dto';
import { RatingFilmDto } from './dto/rating-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { Film } from './film.model';

import { Client } from '@elastic/elasticsearch';
import { SearchDataDto } from './dto/search-data.dto';
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
      id: _id,
      document: { document_id: _id, ...dataForElasticSearch },
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
      doc: { document_id: _id, ...dataForElasticSearch },
    })
    return film
  }

  async remove(id: string) {
    await client.delete({
      index: 'search-films',
      id: id
    })
    await this.filmModel.findByIdAndRemove(id);
    return;
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
    if (ratingFilmDto.rating < 0 || ratingFilmDto.rating > 5) {
      throw new ForbiddenException('Invalid Rating')
    }
    const updatedFilm = await this.filmModel.findOneAndUpdate({ _id: id }, { $push: { ratings: ratingFilmDto } }, { new: true }).populate([{ path: "ratings.user comments.user", select: 'name email' }])
    const { _id, ...dataForElasticSearch } = updatedFilm.toJSON()
    await client.update({
      index: 'search-films',
      id: updatedFilm._id,
      doc: { document_id: _id, ...dataForElasticSearch },
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
      doc: { document_id: _id, ...dataForElasticSearch },
    })
    return updatedFilm;
  }

  async search(searchDataDto: SearchDataDto) {
    const query: any = {
      bool: {
        must: {
          multi_match: {
            query: searchDataDto.text,
            fields: ['name', 'description'],
            fuzziness: 'AUTO' // Optional: Include fuzzy matching for misspelled words
          }
        },
        filter: []
      }
    };
    if (searchDataDto.genre) {
      query.bool.filter.push({ term: { genre: searchDataDto.genre } })
    }
    if (searchDataDto.country) {
      query.bool.filter.push({ term: { genre: searchDataDto.country } })
    }
    if (searchDataDto.ticketPrice) {
      query.bool.filter.push({ term: { ticketPrice: searchDataDto.ticketPrice } })
    }

    const results = await client.search({
      index: 'search-films',
      body: {
        query
      }
    });
    return results.hits.hits.map(hit => hit._source);
  }

}
