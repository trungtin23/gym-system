import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsUUID,
} from 'class-validator';

export class CreateTrainerDto {
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @IsString()
  @IsNotEmpty()
  specialization: string;

  @IsInt()
  @Min(0)
  @Max(50)
  experience: number;

  @IsString()
  @IsOptional()
  certifications?: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string; // Reference to the associated User
}
