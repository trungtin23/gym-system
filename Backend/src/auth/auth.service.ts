import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    // console.log('User:', user);
    if (!user) {
      throw new UnauthorizedException('Email không tồn tại');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Sai mật khẩu');
    }

    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, role: user.role };
    // console.log('Payload:', payload);
    const token = this.jwtService.sign(payload);
    return {
      access_token: token,
    };
  }
}
