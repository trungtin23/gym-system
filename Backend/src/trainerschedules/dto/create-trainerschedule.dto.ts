import { IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';
import { DayOfWeek } from 'src/entities/trainerSchedule.entity';

export class CreateScheduleDto {
  @IsNotEmpty()
  trainerId: string;

  @IsNotEmpty()
  timeSlotId: string;

  @IsNotEmpty()
  dayOfWeek: DayOfWeek;

  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;
}
