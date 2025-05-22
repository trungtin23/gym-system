import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { TrainingTimeSlotsService } from './training-time-slots.service';
import { ResponeData } from '../global/responses/responses.global';
import { HttpStatus, HttpMessage } from '../global/enums/enum';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from 'src/auth/role.enum';
import { CreateTimeSlotDto } from './dto/create-training-time-slot.dto';

@Controller('training-time-slots')
export class TrainingTimeSlotsController {
  constructor(private readonly timeSlotsService: TrainingTimeSlotsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.STAFF)
  async create(@Body() createTimeSlotDto: CreateTimeSlotDto) {
    try {
      const timeSlot = await this.timeSlotsService.create(createTimeSlotDto);
      return new ResponeData<any>(
        HttpMessage.CREATED_MESSAGE,
        HttpStatus.CREATED,
        timeSlot,
      );
    } catch (error) {
      return new ResponeData<null>(
        error.message || HttpMessage.ERROR_MESSAGE,
        HttpStatus.ERROR,
        null,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      const timeSlots = await this.timeSlotsService.findAll();
      return new ResponeData<any>(
        HttpMessage.SUCCESS_MESSAGE,
        HttpStatus.SUCCESS,
        timeSlots,
      );
    } catch (error) {
      return new ResponeData<null>(
        error.message || HttpMessage.ERROR_MESSAGE,
        HttpStatus.ERROR,
        null,
      );
    }
  }
}
