import { PartialType } from '@nestjs/mapped-types';
import { CreateScheduleDto } from './create-trainerschedule.dto';

export class UpdateTrainerscheduleDto extends PartialType(CreateScheduleDto) {}
