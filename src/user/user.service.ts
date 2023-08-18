import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.model';
import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {

  constructor(@InjectModel('user') private readonly userModel: Model<User>) { }

  async create(createUserDto: CreateUserDto) {
    const user = await this.userModel.create(createUserDto);
    return user.toJSON();
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email });
    return user.toJSON();
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email });
    if (user) {
      const passwordValid = await bcrypt.compare(password, user.hash)
      if (passwordValid) {
        return user;
      }
    }
    return null;
  }
}
