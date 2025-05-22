import { PartialType } from '@nestjs/mapped-types';
import { CreateTimeSlotDto } from './create-training-time-slot.dto';

export class UpdateTrainingTimeSlotDto extends PartialType(CreateTimeSlotDto) {}
