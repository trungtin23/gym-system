import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Appointment } from './appointment.entity';

@Entity('workout_results')
@Unique(['appointment']) // Ensure one result per appointment
export class WorkoutResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: User;

  @Column({ type: 'decimal', precision: 6, scale: 2, nullable: true })
  calories_burned: number; // Lượng calo tiêu thụ

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  current_weight: number; // Cân nặng hiện tại (kg)

  @Column({ type: 'decimal', precision: 4, scale: 2, nullable: true })
  bmi: number; // Chỉ số BMI

  @Column({ type: 'int', nullable: true })
  workout_duration_minutes: number; // Thời gian tập thực tế (phút)

  @Column({ type: 'int', nullable: true })
  completion_percentage: number; // Mức độ hoàn thành (0-100%)

  @Column({ type: 'text', nullable: true })
  performance_notes: string; // Ghi chú về hiệu suất

  @Column({ type: 'int', nullable: true })
  trainer_rating: number; // Đánh giá của PT (1-5 sao)

  @Column({ type: 'text', nullable: true })
  trainer_feedback: string; // Phản hồi từ PT

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  heart_rate_avg: number; // Nhịp tim trung bình

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  heart_rate_max: number; // Nhịp tim tối đa

  @Column({ type: 'text', nullable: true })
  exercises_completed: string; // Danh sách bài tập đã hoàn thành (JSON string)

  @Column({ type: 'text', nullable: true })
  next_session_recommendations: string; // Khuyến nghị cho buổi tập tiếp theo

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