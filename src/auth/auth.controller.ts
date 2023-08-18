import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from 'bcrypt';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async create(@Body() createAuthDto: CreateAuthDto) {
    const salt = 10;
    const hash = await bcrypt.hash(createAuthDto.password, salt);
    const user: CreateAuthDto = {
      ...createAuthDto,
      hash
    }
    return this.authService.register(user);
  }
}
