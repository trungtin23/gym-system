// src/appointments/appointments.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, Repository } from 'typeorm';
import { Appointment } from '../entities/appointment.entity';

import { CreateAppointmentDto } from './dto/create-appoinment.dto';
import {
  UpdateAppointmentDto,
  UpdateStatusDto,
} from './dto/update-appoinment.dto';
import { TrainerSchedulesService } from 'src/trainerschedules/trainerschedules.service';
import { TrainingTimeSlot } from 'src/entities/trainingTimeSlot.entity';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepository: Repository<Appointment>,
    @InjectRepository(TrainingTimeSlot)
    private timeSlotRepository: Repository<TrainingTimeSlot>,
    private trainerSchedulesService: TrainerSchedulesService,
  ) {}

  async create(
    createAppointmentDto: CreateAppointmentDto,
  ): Promise<Appointment> {
    const { userId, trainerId, date, timeSlotId, notes } = createAppointmentDto;

    // Kiểm tra ca có khả dụng không
    const dateObj = new Date(date);
    const availability =
      await this.trainerSchedulesService.checkSlotAvailability(
        trainerId,
        dateObj,
        timeSlotId,
      );

    if (!availability.available) {
      throw new BadRequestException(availability.reason);
    }

    // Tạo lịch hẹn mới
    const newAppointment = this.appointmentRepository.create({
      user: { id: userId },
      trainer: { id: trainerId },
      date: dateObj,
      timeSlot: { id: timeSlotId },
      notes,
      status: 'PENDING',
    });

    return this.appointmentRepository.save(newAppointment);
  }

  async findByUserAndTrainer(userId: string, trainerId: string) {
    const appointments = await this.appointmentRepository.find({
      where: {
        user: { id: userId }, // Use the relation.id syntax
        trainer: { id: trainerId }, // Use the relation.id syntax
      },
      order: {
        date: 'ASC',
      },
    });

    return {
      status: 'SUCCESS',
      data: appointments,
    };
  }

  async findAll(): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      relations: ['user', 'trainer', 'trainer.user', 'timeSlot'],
      order: {
        date: 'DESC',
        created_at: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id },
      relations: ['user', 'trainer', 'trainer.user', 'timeSlot'],
    });

    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }

    return appointment;
  }

  async findByUser(userId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { user: { id: userId } },
      relations: ['trainer', 'trainer.user', 'timeSlot'],
      order: {
        date: 'DESC',
        created_at: 'DESC',
      },
    });
  }

  async findByTrainer(trainerId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { trainer: { id: trainerId } },
      relations: ['user', 'timeSlot'],
      order: {
        date: 'DESC',
        created_at: 'DESC',
      },
    });
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    userId: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Kiểm tra quyền
    if (
      appointment.user.id !== userId &&
      appointment.trainer.user.id !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this appointment',
      );
    }

    // Không cho phép chỉnh sửa các cuộc hẹn đã hoàn thành hoặc đã hủy
    if (
      appointment.status === 'COMPLETED' ||
      appointment.status === 'CANCELLED'
    ) {
      throw new BadRequestException(
        `Cannot update ${appointment.status.toLowerCase()} appointment`,
      );
    }

    // Cập nhật các trường
    if (updateAppointmentDto.date) {
      appointment.date = new Date(updateAppointmentDto.date);
    }

    if (updateAppointmentDto.timeSlotId) {
      // Nếu thay đổi ca tập, cần kiểm tra ca mới có khả dụng không
      const newTimeSlotId = updateAppointmentDto.timeSlotId;
      const availability =
        await this.trainerSchedulesService.checkSlotAvailability(
          appointment.trainer.id,
          appointment.date,
          newTimeSlotId,
        );

      if (!availability.available) {
        throw new BadRequestException(availability.reason);
      }

      appointment.timeSlot = { id: newTimeSlotId } as TrainingTimeSlot;
    }

    if (updateAppointmentDto.notes !== undefined) {
      appointment.notes = updateAppointmentDto.notes;
    }

    if (updateAppointmentDto.status) {
      appointment.status = updateAppointmentDto.status;
    }

    return this.appointmentRepository.save(appointment);
  }

  async updateStatus(
    id: string,
    updateStatusDto: UpdateStatusDto,
    userId: string,
  ): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Kiểm tra quyền - chỉ người tạo hoặc PT mới có thể cập nhật trạng thái
    if (
      appointment.user.id !== userId &&
      appointment.trainer.user.id !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to update this appointment',
      );
    }

    // Chỉ PT mới có thể xác nhận lịch
    if (
      updateStatusDto.status === 'CONFIRMED' &&
      appointment.trainer.user.id !== userId
    ) {
      throw new ForbiddenException('Only the trainer can confirm appointments');
    }

    // Chỉ PT mới có thể đánh dấu hoàn thành
    if (
      updateStatusDto.status === 'COMPLETED' &&
      appointment.trainer.user.id !== userId
    ) {
      throw new ForbiddenException(
        'Only the trainer can mark appointments as completed',
      );
    }

    // Không thể cập nhật lịch đã hoàn thành
    if (
      appointment.status === 'COMPLETED' &&
      updateStatusDto.status !== 'COMPLETED'
    ) {
      throw new BadRequestException('Cannot update a completed appointment');
    }

    appointment.status = updateStatusDto.status;

    return this.appointmentRepository.save(appointment);
  }

  async cancel(id: string, userId: string): Promise<Appointment> {
    const appointment = await this.findOne(id);

    // Kiểm tra quyền - chỉ người tạo hoặc PT mới có thể hủy lịch
    if (
      appointment.user.id !== userId &&
      appointment.trainer.user.id !== userId
    ) {
      throw new ForbiddenException(
        'You do not have permission to cancel this appointment',
      );
    }

    // Không thể hủy lịch đã hoàn thành
    if (appointment.status === 'COMPLETED') {
      throw new BadRequestException('Cannot cancel completed appointment');
    }

    // Không thể hủy lịch đã bị hủy
    if (appointment.status === 'CANCELLED') {
      throw new BadRequestException('This appointment is already cancelled');
    }

    appointment.status = 'CANCELLED';

    return this.appointmentRepository.save(appointment);
  }

  // Tìm lịch hẹn của một PT trong một khoảng thời gian cụ thể
  async findByTrainerAndDateRange(
    trainerId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: {
        trainer: { id: trainerId },
        date: Between(startDate, endDate),
        status: In(['CONFIRMED', 'PENDING']),
      },
      relations: ['user', 'timeSlot'],
      order: { date: 'ASC' },
    });
  }

  // Tìm lịch hẹn theo ngày và ca tập
  async findByDateAndTimeSlot(
    trainerId: string,
    date: Date,
    timeSlotId: string,
  ): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: {
        trainer: { id: trainerId },
        date: date,
        timeSlot: { id: timeSlotId },
        status: In(['CONFIRMED', 'PENDING']),
      },
      relations: ['user', 'timeSlot'],
    });
  }

  // Lấy số lượng lịch hẹn theo trạng thái của một PT
  async countByTrainerAndStatus(
    trainerId: string,
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
  ): Promise<number> {
    return this.appointmentRepository.count({
      where: {
        trainer: { id: trainerId },
        status,
      },
    });
  }

  // Lấy số lượng lịch hẹn theo trạng thái của một người dùng
  async countByUserAndStatus(
    userId: string,
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED',
  ): Promise<number> {
    return this.appointmentRepository.count({
      where: {
        user: { id: userId },
        status,
      },
    });
  }

  async remove(id: string): Promise<void> {
    const result = await this.appointmentRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Appointment with ID ${id} not found`);
    }
  }
}
