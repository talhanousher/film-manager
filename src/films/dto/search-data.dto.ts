
import { IsNotEmpty } from 'class-validator';

export class SearchDataDto {
  
  @IsNotEmpty()
  text: string;

  genre: string;
  country: string;
  ticketPrice: number;
}