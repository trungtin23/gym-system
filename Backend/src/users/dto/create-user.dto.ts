import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  MinLength,
  IsNotEmpty,
  IsDecimal,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

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
  date_of_birth?: string;

  @IsOptional()
  @IsDecimal()
  height?: number;

  @IsOptional()
  @IsDecimal()
  weight?: number;

  @IsOptional()
  @IsString()
  goal?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsEnum(['USER', 'TRAINER', 'STAFF', 'ADMIN'])
  role?: 'USER' | 'TRAINER' | 'STAFF' | 'ADMIN';

  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE'])
  status?: 'ACTIVE' | 'INACTIVE';
}
