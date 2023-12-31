import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { FilmsService } from './films.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { RatingFilmDto } from './dto/rating-film.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CommentFilmDto } from './dto/comment-film.dto';
import { SearchDataDto } from './dto/search-data.dto';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) { }

  @Post()
  create(@Body() createFilmDto: CreateFilmDto) {
    return this.filmsService.create(createFilmDto);
  }

  @Get()
  findAll() {
    return this.filmsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.filmsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFilmDto: UpdateFilmDto) {
    return this.filmsService.update(id, updateFilmDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.filmsService.remove(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/rating')
  addRating(@Req() req, @Param('id') id: string, @Body() ratingFilmDto: RatingFilmDto) {
    return this.filmsService.addRating(id, { user: req.user._id, ...ratingFilmDto });
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comment')
  addComment(@Req() req, @Param('id') id: string, @Body() commentFilmDto: CommentFilmDto) {
    return this.filmsService.addComment(id, { user: req.user._id, ...commentFilmDto });
  }

  @Post('search')
  search(@Body() searchDataDto: SearchDataDto) {
    return this.filmsService.search(searchDataDto);
  }

}
