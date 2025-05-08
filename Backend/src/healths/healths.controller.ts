import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateHealthDto } from './dto/create-health.dto';
import { UpdateHealthDto } from './dto/update-health.dto';
import { HealthService } from './healths.service';

@Controller('healths')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}
  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  findByUserId(@Param('userId') userId: string) {
    return this.healthService.findByUserId(userId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createHealthDto: CreateHealthDto) {
    return this.healthService.create(createHealthDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.healthService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: number) {
    return this.healthService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: number, @Body() updateHealthDto: UpdateHealthDto) {
    return this.healthService.update(id, updateHealthDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: number) {
    return this.healthService.remove(id);
  }
}
