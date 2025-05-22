import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';
// Thêm import DayOfWeek
import { CreateScheduleDto } from './dto/create-trainerschedule.dto';
import {
  DayOfWeek,
  TrainerSchedule,
} from 'src/entities/trainerSchedule.entity';

@Injectable()
export class TrainerSchedulesService {
  constructor(
    @InjectRepository(TrainerSchedule)
    private trainerScheduleRepository: Repository<TrainerSchedule>,
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<TrainerSchedule> {
    const newSchedule = this.trainerScheduleRepository.create({
      trainer: { id: createScheduleDto.trainerId },
      timeSlot: { id: createScheduleDto.timeSlotId },
      dayOfWeek: createScheduleDto.dayOfWeek,
      isAvailable: createScheduleDto.isAvailable ?? true,
    });
    return this.trainerScheduleRepository.save(newSchedule);
  }

  // Lấy lịch làm việc của một PT trong tuần
  async getTrainerWeeklySchedule(
    trainerId: string,
  ): Promise<TrainerSchedule[]> {
    const trainerSchedules = await this.trainerScheduleRepository.find({
      where: { trainer: { id: trainerId }, isAvailable: true },
      relations: ['timeSlot'],
    });

    return trainerSchedules;
  }

  // Kiểm tra xem ca này có còn trống không
  async checkSlotAvailability(
    trainerId: string,
    date: Date,
    timeSlotId: string,
  ) {
    // 1. Kiểm tra xem PT có lịch làm việc vào ngày và ca này không
    const dayOfWeekMap = [
      DayOfWeek.SUNDAY,
      DayOfWeek.MONDAY,
      DayOfWeek.TUESDAY,
      DayOfWeek.WEDNESDAY,
      DayOfWeek.THURSDAY,
      DayOfWeek.FRIDAY,
      DayOfWeek.SATURDAY,
    ];

    const dayOfWeek = dayOfWeekMap[date.getDay()];

    const schedule = await this.trainerScheduleRepository.findOne({
      where: {
        trainer: { id: trainerId },
        timeSlot: { id: timeSlotId },
        dayOfWeek,
        isAvailable: true,
      },
    });

    if (!schedule) {
      return {
        available: false,
        reason: 'PT không có lịch làm việc vào ca này',
      };
    }

    // 2. Kiểm tra xem đã có lịch hẹn vào ngày và ca này chưa
    const existingAppointment = await this.appointmentRepository.findOne({
      where: {
        trainer: { id: trainerId },
        date,
        timeSlot: { id: timeSlotId },
        status: 'CONFIRMED',
      },
    });

    if (existingAppointment) {
      return { available: false, reason: 'Ca này đã có lịch hẹn' };
    }

    return { available: true };
  }

  // Các phương thức khác...
}
