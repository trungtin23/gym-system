import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { Membership } from 'src/entities/membership.entity';

@Injectable()
export class MembershipsService {
  constructor(
    @InjectRepository(Membership)
    private membershipsRepository: Repository<Membership>,
  ) {}

  async create(createMembershipDto: CreateMembershipDto): Promise<Membership> {
    const membership = this.membershipsRepository.create(createMembershipDto);
    return await this.membershipsRepository.save(membership);
  }

  async findAll(): Promise<Membership[]> {
    return await this.membershipsRepository.find();
  }

  async findOne(id: number): Promise<Membership> {
    const membership = await this.membershipsRepository.findOne({
      where: { id },
    });
    if (!membership) {
      throw new NotFoundException(`Membership with ID ${id} not found`);
    }
    return membership;
  }

  async update(
    id: number,
    updateMembershipDto: UpdateMembershipDto,
  ): Promise<Membership> {
    const membership = await this.findOne(id);
    Object.assign(membership, updateMembershipDto);
    return await this.membershipsRepository.save(membership);
  }

  async remove(id: number): Promise<void> {
    const membership = await this.findOne(id);
    await this.membershipsRepository.remove(membership);
  }
}
