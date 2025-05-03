import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from '../entities/trainer.entity';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class TrainerService {
  constructor(
    @InjectRepository(Trainer)
    private readonly trainerRepository: Repository<Trainer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createTrainer(createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    const { userId, specialization, experience, certifications } =
      createTrainerDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Optional: check if already trainer
    const existingTrainer = await this.trainerRepository.findOne({
      where: { user: { id: userId } },
    });
    if (existingTrainer) {
      throw new BadRequestException('User is already a trainer');
    }

    // Cập nhật role
    user.role = 'TRAINER';
    await this.userRepository.save(user);

    const trainer = this.trainerRepository.create({
      specialization,
      experience,
      certifications,
      user,
    });

    return this.trainerRepository.save(trainer);
  }

  async getAllTrainers(): Promise<Trainer[]> {
    return this.trainerRepository.find({ relations: ['user'] });
  }

  async getTrainerById(id: string): Promise<Trainer> {
    const trainer = await this.trainerRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }
    return trainer;
  }

  async updateTrainer(
    id: string,
    updateTrainerDto: UpdateTrainerDto,
  ): Promise<Trainer> {
    const trainer = await this.getTrainerById(id);
    Object.assign(trainer, updateTrainerDto);
    return this.trainerRepository.save(trainer);
  }

  async deleteTrainer(id: string): Promise<void> {
    const trainer = await this.getTrainerById(id);
    await this.trainerRepository.remove(trainer);
  }
}
