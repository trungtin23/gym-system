import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Health } from '../entities/health.entity';
import { CreateHealthDto } from './dto/create-health.dto';
import { UpdateHealthDto } from './dto/update-health.dto';
import { User } from '../entities/user.entity';

@Injectable()
export class HealthService {
  constructor(
    @InjectRepository(Health)
    private readonly healthRepository: Repository<Health>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async findByUserId(userId: string): Promise<Health> {
    const health = await this.healthRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });

    if (!health) {
      throw new NotFoundException(
        `Health record for user with ID ${userId} not found`,
      );
    }

    return health;
  }

  async create(createHealthDto: CreateHealthDto): Promise<Health> {
    const user = await this.userRepository.findOne({
      where: { id: createHealthDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID ${createHealthDto.userId} not found`,
      );
    }

    const health = this.healthRepository.create({
      ...createHealthDto,
      user,
    });

    return this.healthRepository.save(health);
  }

  async findAll(): Promise<Health[]> {
    return this.healthRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Health> {
    const health = await this.healthRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!health) {
      throw new NotFoundException(`Health record with ID ${id} not found`);
    }

    return health;
  }

  async update(id: number, updateHealthDto: UpdateHealthDto): Promise<Health> {
    const health = await this.findOne(id);

    Object.assign(health, updateHealthDto);

    return this.healthRepository.save(health);
  }

  async remove(id: number): Promise<void> {
    const health = await this.findOne(id);

    await this.healthRepository.remove(health);
  }
}
