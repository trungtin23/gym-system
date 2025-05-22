import { IsNotEmpty, IsString, IsBoolean, IsOptional } from 'class-validator';

export class CreateTimeSlotDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  startTime: string; // Format: HH:MM:SS

  @IsString()
  @IsNotEmpty()
  endTime: string; // Format: HH:MM:SS

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
