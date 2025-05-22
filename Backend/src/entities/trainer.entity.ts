import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Appointment } from './appointment.entity';
import { TrainingProgram } from './trainingPrograms.entity';
import { TrainerSchedule } from './trainerSchedule.entity';

@Entity('trainers')
export class Trainer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  story: string;

  @Column({ type: 'text', nullable: true })
  bio: string;

  @Column({ type: 'varchar', length: 255 })
  specialization: string;

  @Column({ type: 'int' })
  experience: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  certifications: string;

  @Column({ type: 'int', default: 0 })
  hourlyRate: number; // Giá theo giờ của PT

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean; // PT có đang nhận học viên mới không

  @Column({ type: 'int', default: 5 })
  maxClientsPerDay: number; // Số lượng khách tối đa mỗi ngày

  @OneToOne(() => User, { eager: true, cascade: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Appointment, (appointment) => appointment.trainer)
  appointments: Appointment[]; // Các lịch hẹn

  @OneToMany(() => TrainerSchedule, (schedule) => schedule.trainer)
  schedules: TrainerSchedule[]; // Lịch làm việc

  @OneToMany(() => TrainingProgram, (program) => program.trainer)
  trainingPrograms: TrainingProgram[]; // Các chương trình huấn luyện

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
