import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) { }

  async register(createAuthDto: CreateAuthDto) {
    try {
      const user = await this.userService.findByEmail(createAuthDto.email);
      if (user) {
        throw new ForbiddenException('User Already Exists!')
      }
      const { hash, ...userData } = await this.userService.create(createAuthDto);
      const access_token = this.jwtService.sign(userData, { secret: process.env.JWT_SECRET, });
      return { access_token, user: userData };
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  async login(loginData: LoginAuthDto) {
    const { hash, ...user } = await this.userService.findByEmail(loginData.email);
    if (!user) {
      throw new NotFoundException('User Not Found!')
    }

    const access_token = this.jwtService.sign(user, { secret: process.env.JWT_SECRET, });
    return { access_token, user };
  }
}
