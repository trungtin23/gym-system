import { IsOptional, IsNumber, IsInt, IsString, Min, Max, MaxLength } from 'class-validator';

export class CreateWorkoutResultDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  calories_burned?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  current_weight?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  bmi?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  workout_duration_minutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  completion_percentage?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  performance_notes?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  trainer_rating?: number;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  trainer_feedback?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  heart_rate_avg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  heart_rate_max?: number;

  @IsOptional()
  @IsString()
  exercises_completed?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  next_session_recommendations?: string;
} 