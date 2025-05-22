import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsDateString,
  IsUUID,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string;

  @IsUUID()
  @IsNotEmpty()
  trainerId: string;

  @IsDateString()
  @IsNotEmpty()
  date: string; // Ngày hẹn (YYYY-MM-DD)

  @IsUUID()
  @IsNotEmpty()
  timeSlotId: string; // ID của ca tập

  @IsString()
  @IsOptional()
  notes?: string;
}
