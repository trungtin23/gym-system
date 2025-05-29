import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { Trainer } from './trainer.entity';
import { TrainingTimeSlot } from './trainingTimeSlot.entity';
import { Rating } from './rating.entity';
import { WorkoutResult } from './workout-result.entity';

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Trainer, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'trainer_id' })
  trainer: Trainer;

  @Column({ type: 'date' })
  date: Date; // Ngày hẹn (chỉ lưu ngày)

  @ManyToOne(() => TrainingTimeSlot)
  @JoinColumn({ name: 'time_slot_id' })
  timeSlot: TrainingTimeSlot; // Ca tập

  @Column({ type: 'varchar', length: 255, nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  exercises: string;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING',
  })
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

  @Column({ type: 'varchar', length: 255, nullable: true, default: 'Phòng tập chính' })
  location: string;

  @OneToOne(() => Rating, (rating) => rating.appointment, { nullable: true })
  rating: Rating;

  @OneToOne(() => WorkoutResult, (workoutResult) => workoutResult.appointment, { nullable: true })
  workoutResult: WorkoutResult;

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
