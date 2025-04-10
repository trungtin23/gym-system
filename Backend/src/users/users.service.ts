import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { DeleteResult, Repository, UpdateResult } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = new User();
    user.full_Name = createUserDto.full_Name; // Ánh xạ thủ công
    user.email = createUserDto.email;
    user.password = createUserDto.password; // Đừng quên mã hóa mật khẩu
    user.phone = createUserDto.phone;
    user.gender = createUserDto.gender;
    user.birthDate = createUserDto.birthDate
      ? new Date(createUserDto.birthDate)
      : null;
    user.height = createUserDto.height;
    user.weight = createUserDto.weight;
    user.goal = createUserDto.goal;

    return await this.usersRepository.save(user);
  }
  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      // relations: [''],
    });
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password'],
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
