import mongoose, { Schema } from 'mongoose';

export const FilmSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  releaseDate: {
    type: Date,
    default: null
  },
  ticketPrice: {
    type: Number,
    default: 0
  },
  country: {
    type: String,
    default: ''
  },
  genre: {
    type: String,
    default: ''
  },
  photo: {
    type: String,
    default: ''
  },
  ratings: [
    new Schema({
      rating: {
        type: String
      },
      user: {
        type: mongoose.Types.ObjectId,
        ref: "user"
      },
    })
  ],
  comments: [
    new Schema({
      text: { type: String },
      user: {
        type: mongoose.Types.ObjectId,
        ref: "user"
      },

    })
  ]
}, { timestamps: true });

export interface Film extends mongoose.Document {
  _id: string,
  name: string,
  description: string,
  releaseDate: Date,
  ticketPrice: number,
  country: string,
  genre: string,
  photo: string,
}