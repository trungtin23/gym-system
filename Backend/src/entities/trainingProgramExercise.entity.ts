import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { TrainingProgram } from './trainingPrograms.entity';
import { Exercise } from './exercise.entity';

@Entity('training_program_exercises')
export class TrainingProgramExercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => TrainingProgram, (program) => program.exercises, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'training_program_id' })
  trainingProgram: TrainingProgram;

  @ManyToOne(() => Exercise, (exercise) => exercise.trainingProgramExercises, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'exercise_id' })
  exercise: Exercise;

  @Column({ type: 'int', nullable: true })
  sets: number; // Số hiệp

  @Column({ type: 'int', nullable: true })
  reps: number; // Số lần lặp lại

  @Column({ type: 'varchar', length: 255, nullable: true })
  weight: string; // Trọng lượng (ví dụ: "10kg", "Body weight")

  @Column({ type: 'int', nullable: true })
  restTime: number; // Thời gian nghỉ giữa các hiệp (giây)

  @Column({ type: 'int', default: 1 })
  day: number; // Ngày trong chương trình (1, 2, 3...)

  @Column({ type: 'int', default: 1 })
  order: number; // Thứ tự bài tập trong ngày

  @Column({ type: 'text', nullable: true })
  notes: string; // Ghi chú

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
