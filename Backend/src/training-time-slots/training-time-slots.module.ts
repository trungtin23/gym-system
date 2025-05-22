import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TrainingTimeSlot } from '../entities/trainingTimeSlot.entity';
import { TrainingTimeSlotsService } from './training-time-slots.service';
import { TrainingTimeSlotsController } from './training-time-slots.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainingTimeSlot]), // Thêm dòng này
  ],
  controllers: [TrainingTimeSlotsController],
  providers: [TrainingTimeSlotsService],
  exports: [TrainingTimeSlotsService], // Xuất service nếu cần dùng ở module khác
})
export class TrainingTimeSlotsModule {}