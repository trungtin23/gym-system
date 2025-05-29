import { Module } from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { TrainerController } from './trainer.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trainer } from 'src/entities/trainer.entity';
import { User } from 'src/entities/user.entity';
import { TrainerSchedule } from 'src/entities/trainerSchedule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Trainer, User, TrainerSchedule])],
  controllers: [TrainerController],
  providers: [TrainerService],
  exports: [TrainerService],
})
export class TrainerModule {}
