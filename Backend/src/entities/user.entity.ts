import { Health } from './health.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Membership } from './membership.entity';
import { Payment } from './payment.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  full_name: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ type: 'enum', enum: ['Male', 'Female', 'Other'], nullable: true })
  gender: 'Male' | 'Female' | 'Other';

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({
    type: 'enum',
    enum: ['USER', 'TRAINER', 'STAFF', 'ADMIN'],
    default: 'USER',
  })
  role: 'USER' | 'TRAINER' | 'STAFF' | 'ADMIN';

  @Column({ type: 'enum', enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' })
  status: 'ACTIVE' | 'INACTIVE';

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImage: string;

  @OneToOne(() => Membership)
  @JoinColumn()
  membership: Membership; // Quan hệ 1-1 với bảng Membership

  @OneToMany(() => Payment, (payment) => payment.user)
  payments: Payment[];

  @OneToOne(() => Health, (health) => health.user)
  health: Health[];
  userId: any;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at: Date;
}
