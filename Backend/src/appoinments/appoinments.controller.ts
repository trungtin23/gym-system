// src/appointments/appointments.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { ResponeData } from '../global/responses/responses.global';
import { HttpStatus, HttpMessage } from '../global/enums/enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { AppointmentsService } from './appoinments.service';
import { CreateAppointmentDto } from './dto/create-appoinment.dto';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from 'src/entities/trainer.entity';
import {
  UpdateAppointmentDto,
  UpdateStatusDto,
} from './dto/update-appoinment.dto';
import { Role } from 'src/auth/role.enum';

@Controller('appointments')
export class AppointmentsController {
  constructor(
    private readonly appointmentsService: AppointmentsService,
    @InjectRepository(Trainer)
    private readonly trainerRepository: Repository<Trainer>,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createAppointmentDto: CreateAppointmentDto, @Req() req) {
    try {
      const appointment =
        await this.appointmentsService.create(createAppointmentDto);
      return new ResponeData<any>(
        HttpMessage.CREATED_MESSAGE,
        HttpStatus.CREATED,
        appointment,
      );
    } catch (error) {
      return new ResponeData<null>(
        error.message || HttpMessage.ERROR_MESSAGE,
        HttpStatus.ERROR,
        null,
      );
    }
  }

  @Get('user/:userId/trainer/:trainerId')
  async getBookedAppointments(
    @Param('userId') userId: string,
    @Param('trainerId') trainerId: string,
  ) {
    return this.appointmentsService.findByUserAndTrainer(userId, trainerId);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  async findAll() {
    try {
      const appointments = await this.appointmentsService.findAll();
      return new ResponeData<any>(
        HttpMessage.SUCCESS_MESSAGE,
        HttpStatus.SUCCESS,
        appointments,
      );
    } catch (error) {
      return new ResponeData<null>(
        error.message || HttpMessage.ERROR_MESSAGE,
        HttpStatus.ERROR,
        null,
      );
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Req() req) {
    try {
      const appointment = await this.appointmentsService.findOne(id);

      // Kiểm tra quyền truy cập
      const userId = req.user.id;
      if (
        appointment.user.id !== userId &&
        appointment.trainer.user.id !== userId &&
        !['ADMIN', 'STAFF'].includes(req.user.role)
      ) {
        return new ResponeData<null>(
          'You do not have permission to view this appointment',
          HttpStatus.FORBIDDEN,
          null,
        );
      }

      return new ResponeData<any>(
        HttpMessage.SUCCESS_MESSAGE,
        HttpStatus.SUCCESS,
        appointment,
      );
    } catch (error) {
      return new ResponeData<null>(
        error.message || HttpMessage.ERROR_MESSAGE,
        HttpStatus.ERROR,
        null,
      );
    }
  }

  @Get('user/me')
  @UseGuards(JwtAuthGuard)
  async findByUser(@Req() req) {
    try {
      const userId = req.user.id;
      const appointments = await this.appointmentsService.findByUser(userId);
      return new ResponeData<any>(
        HttpMessage.SUCCESS_MESSAGE,
        HttpStatus.SUCCESS,
        appointments,
      );
    } catch (error) {
      return new ResponeData<null>(
        error.message || HttpMessage.ERROR_MESSAGE,
        HttpStatus.ERROR,
        null,
      );
    }
  }

  @Get('trainer/me')
  @UseGuards(JwtAuthGuard)
  @Roles(Role.TRAINER)
  async findByTrainer(@Req() req) {
    try {
      // Lấy trainerId dựa vào userId
      const userId = req.user.id;
      // Giả sử có một phương thức để lấy trainerId từ userId
      // Thực tế cần triển khai logic tương ứng
      const trainerId = await this.getTrainerIdFromUserId(userId);

      const appointments =
        await this.appointmentsService.findByTrainer(trainerId);
      return new ResponeData<any>(
        HttpMessage.SUCCESS_MESSAGE,
        HttpStatus.SUCCESS,
        appointments,
      );
    } catch (error) {
      return new ResponeData<null>(
        error.message || HttpMessage.ERROR_MESSAGE,
        HttpStatus.ERROR,
        null,
      );
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @Req() req,
  ) {
    try {
      const userId = req.user.id;
      const appointment = await this.appointmentsService.update(
        id,
        updateAppointmentDto,
        userId,
      );
      return new ResponeData<any>(
        HttpMessage.UPDATE_MESSAGE,
        HttpStatus.SUCCESS,
        appointment,
      );
    } catch (error) {
      return new ResponeData<null>(
        error.message || HttpMessage.ERROR_MESSAGE,
        HttpStatus.ERROR,
        null,
      );
    }
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Req() req,
  ) {
    try {
      const userId = req.user.id;
      const appointment = await this.appointmentsService.updateStatus(
        id,
        updateStatusDto,
        userId,
      );
      return new ResponeData<any>(
        HttpMessage.UPDATE_MESSAGE,
        HttpStatus.SUCCESS,
        appointment,
      );
    } catch (error) {
      return new ResponeData<null>(
        error.message || HttpMessage.ERROR_MESSAGE,
        HttpStatus.ERROR,
        null,
      );
    }
  }

  @Patch(':id/cancel')
  @UseGuards(JwtAuthGuard)
  async cancel(@Param('id') id: string, @Req() req) {
    try {
      const userId = req.user.id;
      const appointment = await this.appointmentsService.cancel(id, userId);
      return new ResponeData<any>(
        'Appointment cancelled successfully',
        HttpStatus.SUCCESS,
        appointment,
      );
    } catch (error) {
      return new ResponeData<null>(
        error.message || HttpMessage.ERROR_MESSAGE,
        HttpStatus.ERROR,
        null,
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  async remove(@Param('id') id: string) {
    try {
      await this.appointmentsService.remove(id);
      return new ResponeData<null>(
        HttpMessage.DELETE_MESSAGE,
        HttpStatus.SUCCESS,
        null,
      );
    } catch (error) {
      return new ResponeData<null>(
        error.message || HttpMessage.ERROR_MESSAGE,
        HttpStatus.ERROR,
        null,
      );
    }
  }

  // Helper method to get trainerId from userId
  private async getTrainerIdFromUserId(userId: string): Promise<string> {
    // Đây là một ví dụ, bạn cần triển khai logic thực tế
    // Ví dụ: Tìm trainer trong database dựa trên userId
    const trainer = await this.trainerRepository.findOne({
      where: { user: { id: userId } },
    });

    if (!trainer) {
      throw new NotFoundException(`Trainer with user ID ${userId} not found`);
    }

    return trainer.id;
  }
}
