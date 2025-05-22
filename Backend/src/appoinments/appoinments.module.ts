import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentsService } from './appoinments.service';
import { AppointmentsController } from './appoinments.controller';
import { Appointment } from '../entities/appointment.entity';
import { TrainingTimeSlot } from '../entities/trainingTimeSlot.entity';
import { User } from '../entities/user.entity';
import { Trainer } from '../entities/trainer.entity';
import { TrainerschedulesModule } from '../trainerschedules/trainerschedules.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      TrainingTimeSlot, // Thêm entity này
      User,
      Trainer,
    ]),
    TrainerschedulesModule, // Import module này để sử dụng TrainerSchedulesService
  ],
  controllers: [AppointmentsController],
  providers: [AppointmentsService],
  exports: [AppointmentsService], // Nếu cần
})
export class AppoinmentsModule {}
