import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsEnum(['CREDIT_CARD', 'BANK_TRANSFER', 'CASH'])
  @IsNotEmpty()
  method: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH'; // Phương thức thanh toán

  @IsOptional()
  @IsString()
  details?: string; // Chi tiết thanh toán (ví dụ: số thẻ, thông tin ngân hàng)

  @IsNumber()
  @IsNotEmpty()
  amount: number; // Số tiền thanh toán

  @IsNotEmpty()
  @IsString()
  userId: string; // ID của người dùng
}
