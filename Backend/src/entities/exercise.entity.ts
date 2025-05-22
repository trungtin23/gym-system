import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { TrainingProgramExercise } from './trainingProgramExercise.entity';

@Entity('exercises')
export class Exercise {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string; // Tên bài tập

  @Column({ type: 'text', nullable: true })
  description: string; // Mô tả

  @Column({ type: 'varchar', length: 255, nullable: true })
  videoUrl: string; // URL video hướng dẫn

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl: string; // URL hình ảnh minh họa

  @Column({
    type: 'enum',
    enum: ['CARDIO', 'STRENGTH', 'FLEXIBILITY', 'BALANCE', 'OTHER'],
    default: 'OTHER',
  })
  category: 'CARDIO' | 'STRENGTH' | 'FLEXIBILITY' | 'BALANCE' | 'OTHER'; // Phân loại bài tập

  @Column({ type: 'varchar', length: 255, nullable: true })
  targetMuscleGroups: string; // Nhóm cơ mục tiêu

  @Column({ type: 'varchar', length: 255, nullable: true })
  equipment: string; // Thiết bị cần thiết

  @OneToMany(() => TrainingProgramExercise, (tpe) => tpe.exercise)
  trainingProgramExercises: TrainingProgramExercise[];

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
