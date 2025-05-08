import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Order } from './orders.entity';

@Entity('memberships')
export class Membership {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  price: number;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'text' })
  description: string;

  @Column('simple-array')
  features: string[];
  @OneToMany(() => Order, (order) => order.membership)
  orders: Order[];
}
