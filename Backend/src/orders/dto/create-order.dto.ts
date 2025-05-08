import { IsNotEmpty, IsUUID, IsEnum, IsInt } from 'class-validator';

export class CreateOrderDto {
  @IsUUID()
  @IsNotEmpty()
  userId: string; // ID của người dùng (UUID)

  @IsInt()
  @IsNotEmpty()
  membershipId: number; // ID của gói thành viên (INT)

  @IsInt()
  @IsNotEmpty()
  paymentId: number; // ID của thanh toán (INT)

  @IsEnum(['PENDING', 'COMPLETED', 'CANCELLED'])
  @IsNotEmpty()
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED'; // Trạng thái đơn hàng
}
