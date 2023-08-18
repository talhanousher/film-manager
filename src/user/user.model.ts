import mongoose, { Schema } from 'mongoose';

export const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  hash: {
    type: String
  }
}, { timestamps: true });

export interface User extends mongoose.Document {
  _id: string,
  name: string,
  username: string,
  email: string,
  hash: string
}