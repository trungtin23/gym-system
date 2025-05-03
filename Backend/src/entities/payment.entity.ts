import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: ['CREDIT_CARD', 'BANK_TRANSFER', 'CASH'],
    default: 'CREDIT_CARD',
  })
  method: 'CREDIT_CARD' | 'BANK_TRANSFER' | 'CASH'; // Phương thức thanh toán

  @Column({ type: 'varchar', length: 255, nullable: true })
  details: string; // Chi tiết thanh toán (ví dụ: số thẻ, thông tin ngân hàng)

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number; // Số tiền thanh toán

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  payment_date: Date; // Ngày thanh toán

  @ManyToOne(() => User, (user) => user.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User; // Quan hệ nhiều-1 với bảng User
}
