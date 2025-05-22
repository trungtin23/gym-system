import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('training_time_slots')
export class TrainingTimeSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string; // Tên ca tập, ví dụ: "Buổi sáng sớm", "Buổi chiều"

  @Column({ type: 'time' })
  startTime: string; // Thời gian bắt đầu, ví dụ: "07:00:00"

  @Column({ type: 'time' })
  endTime: string; // Thời gian kết thúc, ví dụ: "08:30:00"

  @Column({ type: 'boolean', default: true })
  isActive: boolean; // Có sử dụng ca này hay không

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
