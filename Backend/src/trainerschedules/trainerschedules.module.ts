import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainerSchedulesService } from './trainerschedules.service';
import { TrainerSchedulesController } from './trainerschedules.controller';
import { TrainerSchedule } from '../entities/trainerSchedule.entity';
import { Appointment } from '../entities/appointment.entity';
import { TrainingTimeSlot } from '../entities/trainingTimeSlot.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([TrainerSchedule, Appointment, TrainingTimeSlot]),
  ],
  controllers: [TrainerSchedulesController],
  providers: [TrainerSchedulesService],
  exports: [TrainerSchedulesService], // Nếu cần thiết
})
export class TrainerschedulesModule {}
