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
import { Rating } from '../entities/rating.entity';
import { WorkoutResult } from '../entities/workout-result.entity';
import { User } from '../entities/user.entity';

import { CreateAppointmentDto } from './dto/create-appoinment.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { CreateWorkoutResultDto } from './dto/create-workout-result.dto';
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
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(WorkoutResult)
    private workoutResultRepository: Repository<WorkoutResult>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
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
      relations: ['timeSlot'], // Include timeSlot relation
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
      relations: ['trainer', 'trainer.user', 'timeSlot', 'rating', 'workoutResult'],
      order: {
        date: 'DESC',
        created_at: 'DESC',
      },
    });
  }

  async findByTrainer(trainerId: string): Promise<Appointment[]> {
    return this.appointmentRepository.find({
      where: { trainer: { id: trainerId } },
      relations: ['user', 'timeSlot', 'rating', 'workoutResult'],
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

    if (updateAppointmentDto.exercises !== undefined) {
      appointment.exercises = updateAppointmentDto.exercises;
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

  // Rating methods
  async createRating(
    appointmentId: string,
    userId: string,
    createRatingDto: CreateRatingDto,
  ): Promise<Rating> {
    // Check if appointment exists and user has permission
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['user', 'trainer'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Only the user who booked the appointment can rate it
    if (appointment.user.id !== userId) {
      throw new ForbiddenException('You can only rate your own appointments');
    }

    // Only completed appointments can be rated
    if (appointment.status !== 'COMPLETED') {
      throw new BadRequestException('Only completed appointments can be rated');
    }

    // Check if rating already exists
    const existingRating = await this.ratingRepository.findOne({
      where: {
        appointment: { id: appointmentId },
        user: { id: userId },
      },
    });

    if (existingRating) {
      throw new BadRequestException('Rating already exists for this appointment. Use PATCH to update.');
    }

    // Get user entity
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Create new rating
    const rating = this.ratingRepository.create({
      appointment,
      user,
      rating: createRatingDto.rating,
      comment: createRatingDto.comment,
    });

    return this.ratingRepository.save(rating);
  }

  async getRating(appointmentId: string, userId: string): Promise<Rating | null> {
    // Check if appointment exists and user has permission
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['user', 'trainer'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // User can view their own rating, trainer can view rating for their appointments
    if (appointment.user.id !== userId && appointment.trainer.user.id !== userId) {
      throw new ForbiddenException('You do not have permission to view this rating');
    }

    return this.ratingRepository.findOne({
      where: {
        appointment: { id: appointmentId },
        user: { id: appointment.user.id }, // Always get the user's rating, not the trainer's
      },
      relations: ['user'],
    });
  }

  async updateRating(
    appointmentId: string,
    userId: string,
    updateRatingDto: CreateRatingDto,
  ): Promise<Rating> {
    // Check if appointment exists and user has permission
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['user', 'trainer'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Only the user who booked the appointment can update their rating
    if (appointment.user.id !== userId) {
      throw new ForbiddenException('You can only update your own rating');
    }

    // Only allow updating rating for completed appointments
    if (appointment.status !== 'COMPLETED') {
      throw new BadRequestException('Can only update rating for completed appointments');
    }

    // Find existing rating
    const existingRating = await this.ratingRepository.findOne({
      where: { 
        appointment: { id: appointmentId },
        user: { id: userId }
      },
    });

    if (!existingRating) {
      throw new NotFoundException('Rating not found');
    }

    // Update rating
    existingRating.rating = updateRatingDto.rating;
    existingRating.comment = updateRatingDto.comment;

    return await this.ratingRepository.save(existingRating);
  }

  // Workout Result methods
  async createWorkoutResult(
    appointmentId: string,
    trainerId: string,
    createWorkoutResultDto: CreateWorkoutResultDto,
  ): Promise<WorkoutResult> {
    // Check if appointment exists and trainer has permission
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['user', 'trainer', 'trainer.user'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Only the trainer assigned to this appointment can create workout results
    if (appointment.trainer.user.id !== trainerId) {
      throw new ForbiddenException('You can only create workout results for your own appointments');
    }

    // Only allow creating workout results for completed appointments
    if (appointment.status !== 'COMPLETED') {
      throw new BadRequestException('Can only create workout results for completed appointments');
    }

    // Check if workout result already exists
    const existingResult = await this.workoutResultRepository.findOne({
      where: { appointment: { id: appointmentId } },
    });

    if (existingResult) {
      throw new BadRequestException('Workout result already exists for this appointment');
    }

    // Auto-calculate BMI if weight is provided and user has height
    let bmi = createWorkoutResultDto.bmi;
    if (createWorkoutResultDto.current_weight && !bmi) {
      // You might want to get user's height from user profile
      // For now, we'll use the provided BMI or leave it null
    }

    // Create workout result
    const workoutResult = this.workoutResultRepository.create({
      appointment,
      member: appointment.user,
      calories_burned: createWorkoutResultDto.calories_burned,
      current_weight: createWorkoutResultDto.current_weight,
      bmi: bmi,
      workout_duration_minutes: createWorkoutResultDto.workout_duration_minutes,
      completion_percentage: createWorkoutResultDto.completion_percentage,
      performance_notes: createWorkoutResultDto.performance_notes,
      trainer_rating: createWorkoutResultDto.trainer_rating,
      trainer_feedback: createWorkoutResultDto.trainer_feedback,
      heart_rate_avg: createWorkoutResultDto.heart_rate_avg,
      heart_rate_max: createWorkoutResultDto.heart_rate_max,
      exercises_completed: createWorkoutResultDto.exercises_completed,
      next_session_recommendations: createWorkoutResultDto.next_session_recommendations,
    });

    return await this.workoutResultRepository.save(workoutResult);
  }

  async getWorkoutResult(appointmentId: string, userId: string): Promise<WorkoutResult | null> {
    // Check if appointment exists and user has permission
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['user', 'trainer', 'trainer.user'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Allow both member and trainer to view workout results
    const isMember = appointment.user.id === userId;
    const isTrainer = appointment.trainer.user.id === userId;

    if (!isMember && !isTrainer) {
      throw new ForbiddenException('You can only view workout results for your own appointments');
    }

    return await this.workoutResultRepository.findOne({
      where: { appointment: { id: appointmentId } },
      relations: ['appointment', 'member'],
    });
  }

  async updateWorkoutResult(
    appointmentId: string,
    trainerId: string,
    updateWorkoutResultDto: CreateWorkoutResultDto,
  ): Promise<WorkoutResult> {
    // Check if appointment exists and trainer has permission
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['user', 'trainer', 'trainer.user'],
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Only the trainer assigned to this appointment can update workout results
    if (appointment.trainer.user.id !== trainerId) {
      throw new ForbiddenException('You can only update workout results for your own appointments');
    }

    // Find existing workout result
    const existingResult = await this.workoutResultRepository.findOne({
      where: { appointment: { id: appointmentId } },
    });

    if (!existingResult) {
      throw new NotFoundException('Workout result not found');
    }

    // Auto-calculate BMI if weight is provided
    let bmi = updateWorkoutResultDto.bmi;
    if (updateWorkoutResultDto.current_weight && !bmi) {
      // You might want to get user's height from user profile
      // For now, we'll use the provided BMI or leave it as is
    }

    // Update workout result
    Object.assign(existingResult, {
      calories_burned: updateWorkoutResultDto.calories_burned ?? existingResult.calories_burned,
      current_weight: updateWorkoutResultDto.current_weight ?? existingResult.current_weight,
      bmi: bmi ?? existingResult.bmi,
      workout_duration_minutes: updateWorkoutResultDto.workout_duration_minutes ?? existingResult.workout_duration_minutes,
      completion_percentage: updateWorkoutResultDto.completion_percentage ?? existingResult.completion_percentage,
      performance_notes: updateWorkoutResultDto.performance_notes ?? existingResult.performance_notes,
      trainer_rating: updateWorkoutResultDto.trainer_rating ?? existingResult.trainer_rating,
      trainer_feedback: updateWorkoutResultDto.trainer_feedback ?? existingResult.trainer_feedback,
      heart_rate_avg: updateWorkoutResultDto.heart_rate_avg ?? existingResult.heart_rate_avg,
      heart_rate_max: updateWorkoutResultDto.heart_rate_max ?? existingResult.heart_rate_max,
      exercises_completed: updateWorkoutResultDto.exercises_completed ?? existingResult.exercises_completed,
      next_session_recommendations: updateWorkoutResultDto.next_session_recommendations ?? existingResult.next_session_recommendations,
    });

    return await this.workoutResultRepository.save(existingResult);
  }
}
