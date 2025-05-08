import { IsNotEmpty, IsNumber, IsArray, IsUUID } from 'class-validator';

export class CreateHealthDto {
  @IsNumber()
  @IsNotEmpty()
  height: number; // Chiều cao

  @IsNumber()
  @IsNotEmpty()
  weight: number; // Cân nặng

  @IsNumber()
  @IsNotEmpty()
  bodyFatPercentage: number; // Tỷ lệ mỡ

  @IsNumber()
  @IsNotEmpty()
  bmi: number; // BMI

  @IsArray()
  @IsNotEmpty()
  trainingGoals: string[]; // Mục đích tập luyện

  @IsUUID()
  @IsNotEmpty()
  userId: string; // ID của người dùng
}
