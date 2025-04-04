import { IsNotEmpty, MinLength } from 'class-validator';
export class SignInDto {
  @IsNotEmpty({ message: 'Chưa nhập tài khoản' })
  email: string;

  @MinLength(6, { message: ' Mật khẩu phải có ít nhất 8 kí tự' })
  @IsNotEmpty({ message: 'Chưa nhập mật khẩu' })
  password: string;
}
