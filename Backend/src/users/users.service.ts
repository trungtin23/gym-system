import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.full_name = createUserDto.full_name;
    user.email = createUserDto.email;
    const saltRounds = 10;
    user.password = await bcrypt.hash(createUserDto.password, saltRounds);
    user.phone = createUserDto.phone;
    user.gender = createUserDto.gender;
    user.date_of_birth = createUserDto.date_of_birth
      ? new Date(createUserDto.date_of_birth)
      : null;
    user.address = createUserDto.address;
    user.role = createUserDto.role || 'USER';
    user.status = createUserDto.status || 'ACTIVE';

    return await this.usersRepository.save(user);
  }
  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['membership', 'payments', 'health'], // Nếu có quan hệ cần lấy
    });
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['membership'], // Nếu có quan hệ cần lấy
    });
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UpdateResult> {
    return await this.usersRepository.update(id, updateUserDto);
  }

  async remove(id): Promise<DeleteResult> {
    return await this.usersRepository.delete(id);
  }
}
