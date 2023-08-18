import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';

@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) { }

  async register(createAuthDto: CreateAuthDto) {
    const user = await this.userService.findByEmail(createAuthDto.email);
    if (user) {
      throw new ForbiddenException('User Already Exists!')
    }
    const createdUser = await this.userService.create(createAuthDto);
    const payload = {
      name: createdUser.name,
      username: createdUser.username,
      email: createdUser.email,
      id: createdUser.id
    }
    const access_token = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET, });
    return { access_token, user: createdUser };
  }
}
