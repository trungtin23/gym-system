import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('trainers')
export class Trainer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  story: string;

  @Column({ type: 'text' })
  bio: string;

  @Column({ type: 'varchar', length: 255 })
  specialization: string;

  @Column({ type: 'int' })
  experience: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  certifications: string;

  @OneToOne(() => User, { eager: true, cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
