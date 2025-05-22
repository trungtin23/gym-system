import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TrainingTimeSlot } from 'src/entities/trainingTimeSlot.entity';
import { Repository } from 'typeorm';
import { CreateTimeSlotDto } from './dto/create-training-time-slot.dto';

@Injectable()
export class TrainingTimeSlotsService {
  constructor(
    @InjectRepository(TrainingTimeSlot)
    private timeSlotRepository: Repository<TrainingTimeSlot>,
  ) {}

  async create(
    createTimeSlotDto: CreateTimeSlotDto,
  ): Promise<TrainingTimeSlot> {
    const newTimeSlot = this.timeSlotRepository.create(createTimeSlotDto);
    return this.timeSlotRepository.save(newTimeSlot);
  }

  async findAll(): Promise<TrainingTimeSlot[]> {
    return this.timeSlotRepository.find({
      where: { isActive: true },
      order: { startTime: 'ASC' },
    });
  }

  // Các phương thức khác...
}
