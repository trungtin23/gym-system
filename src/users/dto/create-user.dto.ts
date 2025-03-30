import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsDecimal,
  IsDateString,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(['Male', 'Female', 'Other'])
  gender?: 'Male' | 'Female' | 'Other';

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsDecimal()
  height?: number;

  @IsOptional()
  @IsDecimal()
  weight?: number;

  @IsOptional()
  @IsString()
  goal?: string;
}
