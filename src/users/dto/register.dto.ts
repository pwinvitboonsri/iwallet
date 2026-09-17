import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  /**
   * Email address used to log in. Must be unique across all users.
   * @example "jane.doe@example.com"
   */
  @IsNotEmpty()
  @IsEmail()
  @MaxLength(64)
  email: string;

  /**
   * Plain-text password (hashed with bcrypt before storage). 8-72 characters.
   * @example "SuperSecret123"
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(72, { message: 'Password must not exceed 72 characters' })
  password: string;
}
