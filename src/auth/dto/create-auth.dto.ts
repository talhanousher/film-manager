export class CreateAuthDto {
  name: string;
  username: string;
  email: string;
  password: string;
  hash?: string
}
