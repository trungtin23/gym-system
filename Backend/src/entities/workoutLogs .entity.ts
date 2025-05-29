import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Exercise } from './exercise.entity';
import { TrainingProgram } from './trainingPrograms.entity';

@Entity('workout_logs')
export class WorkoutLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User; // Hội viên

  @ManyToOne(() => TrainingProgram, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'training_program_id' })
  trainingProgram: TrainingProgram; // Chương trình tập luyện (nếu có)

  @ManyToOne(() => Exercise, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise; // Bài tập

  @Column({ type: 'date' })
  date: Date; // Ngày tập

  @Column({ type: 'int', nullable: true })
  sets: number; // Số hiệp

  @Column({ type: 'int', nullable: true })
  reps: number; // Số lần lặp lại

  @Column({ type: 'varchar', length: 255, nullable: true })
  weight: string; // Trọng lượng

  @Column({ type: 'int', nullable: true })
  duration: number; // Thời gian (phút)

  @Column({ type: 'text', nullable: true })
  notes: string; // Ghi chú

  @Column({ type: 'boolean', default: false })
  completed: boolean; // Đã hoàn thành chưa

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
