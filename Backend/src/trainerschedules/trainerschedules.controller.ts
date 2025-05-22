import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';

import { ResponeData } from '../global/responses/responses.global';
import { HttpStatus, HttpMessage } from '../global/enums/enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { CreateScheduleDto } from './dto/create-trainerschedule.dto';
import { RolesGuard } from 'src/auth/roles.guard';
import { Role } from 'src/auth/role.enum';
import { TrainerSchedulesService } from './trainerschedules.service';

@Controller('trainer-schedules')
export class TrainerSchedulesController {
  constructor(
    private readonly trainerSchedulesService: TrainerSchedulesService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF, Role.TRAINER)
  async create(@Body() createScheduleDto: CreateScheduleDto) {
    try {
      const schedule =
        await this.trainerSchedulesService.create(createScheduleDto);
      return new ResponeData<any>(
        HttpMessage.CREATED_MESSAGE,
        HttpStatus.CREATED,
        schedule,
      );
    } catch (error) {
      return new ResponeData<null>(
        error.message || HttpMessage.ERROR_MESSAGE,
        HttpStatus.ERROR,
        null,
      );
    }
  }

  @Get(':trainerId/weekly')
  async getTrainerWeeklySchedule(@Param('trainerId') trainerId: string) {
    try {
      const schedules =
        await this.trainerSchedulesService.getTrainerWeeklySchedule(trainerId);
      return new ResponeData<any>(
        HttpMessage.SUCCESS_MESSAGE,
        HttpStatus.SUCCESS,
        schedules,
      );
    } catch (error) {
      return new ResponeData<null>(
        error.message || HttpMessage.ERROR_MESSAGE,
        HttpStatus.ERROR,
        null,
      );
    }
  }

  @Get(':trainerId/check-availability')
  async checkSlotAvailability(
    @Param('trainerId') trainerId: string,
    @Query('date') date: string,
    @Query('timeSlotId') timeSlotId: string,
  ) {
    try {
      const availability =
        await this.trainerSchedulesService.checkSlotAvailability(
          trainerId,
          new Date(date),
          timeSlotId,
        );
      return new ResponeData<any>(
        HttpMessage.SUCCESS_MESSAGE,
        HttpStatus.SUCCESS,
        availability,
      );
    } catch (error) {
      return new ResponeData<null>(
        error.message || HttpMessage.ERROR_MESSAGE,
        HttpStatus.ERROR,
        null,
      );
    }
  }

  // Các phương thức khác...
}
