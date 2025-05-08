import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('healths')
export class Health {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float' })
  height: number; // Chiều cao

  @Column({ type: 'float' })
  weight: number; // Cân nặng

  @Column({ type: 'float' })
  bodyFatPercentage: number; // Tỷ lệ mỡ

  @Column({ type: 'float' })
  bmi: number; // BMI

  @Column({ type: 'simple-array' })
  trainingGoals: string[]; // Mục đích tập luyện (nhiều mục đích)

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}
