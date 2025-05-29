import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Trainer } from './trainer.entity';
import { TrainingProgramExercise } from './trainingProgramExercise.entity';

@Entity('training_programs')
export class TrainingProgram {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string; // Tên chương trình

  @Column({ type: 'text', nullable: true })
  description: string; // Mô tả

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User; // Hội viên

  @ManyToOne(() => Trainer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trainer_id' })
  trainer: Trainer; // Huấn luyện viên

  @Column({ type: 'date' })
  startDate: Date; // Ngày bắt đầu

  @Column({ type: 'date' })
  endDate: Date; // Ngày kết thúc

  @Column({
    type: 'enum',
    enum: ['ACTIVE', 'COMPLETED', 'CANCELLED'],
    default: 'ACTIVE',
  })
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED'; // Trạng thái

  @OneToMany(
    () => TrainingProgramExercise,
    (exercise) => exercise.trainingProgram,
  )
  exercises: TrainingProgramExercise[]; // Các bài tập trong chương trình

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
