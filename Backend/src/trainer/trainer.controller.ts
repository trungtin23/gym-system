import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { TrainerService } from './trainer.service';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';

@Controller('trainers')
export class TrainerController {
  constructor(private readonly trainerService: TrainerService) {}

  @Post()
  async createTrainer(@Body() createTrainerDto: CreateTrainerDto) {
    return this.trainerService.createTrainer(createTrainerDto);
  }

  @Get()
  async getAllTrainers() {
    return this.trainerService.getAllTrainers();
  }

  @Get(':id')
  async getTrainerById(@Param('id') id: string) {
    return this.trainerService.getTrainerById(id);
  }

  @Put(':id')
  async updateTrainer(
    @Param('id') id: string,
    @Body() updateTrainerDto: UpdateTrainerDto,
  ) {
    return this.trainerService.updateTrainer(id, updateTrainerDto);
  }

  @Delete(':id')
  async deleteTrainer(@Param('id') id: string) {
    return this.trainerService.deleteTrainer(id);
  }
}
