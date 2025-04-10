import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponeData } from 'src/global/responses/responses.global';
import { HttpMessage, HttpStatus } from 'src/global/enums/enum';
import { User } from 'src/entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      return new ResponeData<User>(
        HttpMessage.CREATED_MESSAGE,
        HttpStatus.CREATED,
        await this.usersService.create(createUserDto),
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
      const users = await this.usersService.findAll();
      if (users.length === 0) {
        return new ResponeData<null>(
          HttpMessage.NOTFOUND_MESSAGE,
          HttpStatus.NOT_FOUND,
          null,
        );
      }
      return new ResponeData<User>(
        HttpMessage.SUCCESS_MESSAGE,
        HttpStatus.SUCESS,
        await this.usersService.findAll(),
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
  async findOne(@Param('id') id: string) {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        return new ResponeData<null>(
          HttpMessage.NOTFOUND_MESSAGE,
          HttpStatus.NOT_FOUND,
          null,
        );
      }
      return new ResponeData<User>(
        HttpMessage.SUCCESS_MESSAGE,
        HttpStatus.SUCESS,
        user,
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
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        return new ResponeData<null>(
          HttpMessage.NOTFOUND_MESSAGE,
          HttpStatus.NOT_FOUND,
          null,
        );
      }
      const result = await this.usersService.update(id, updateUserDto);

      if (result.affected === 0) {
        return new ResponeData<null>(
          HttpMessage.NOTFOUND_MESSAGE,
          HttpStatus.NOT_FOUND,
          null,
        );
      }

      const updatedUser = await this.usersService.findOne(id);
      return new ResponeData<User>(
        HttpMessage.UPDATE_MESSAGE,
        HttpStatus.SUCESS,
        updatedUser,
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
  async deleteUser(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user) {
      return new ResponeData<null>(
        HttpMessage.NOTFOUND_MESSAGE,
        HttpStatus.NOT_FOUND,
        null,
      );
    }
    const deleteUser = await this.usersService.remove(id);
    if (deleteUser.affected === 0) {
      return new ResponeData<null>(
        HttpMessage.ERROR_MESSAGE,
        HttpStatus.ERROR,
        null,
      );
    }
    return new ResponeData<User>(
      HttpMessage.DELETE_MESSAGE,
      HttpStatus.SUCESS,
      null,
    );
  }
  catch(error) {
    return new ResponeData<null>(
      error.message || HttpMessage.ERROR_MESSAGE,
      HttpStatus.ERROR,
      null,
    );
  }
}
