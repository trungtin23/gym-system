import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/orders.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { User } from 'src/entities/user.entity';
import { Membership } from 'src/entities/membership.entity';
import { Payment } from 'src/entities/payment.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Membership)
    private readonly membershipRepository: Repository<Membership>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { userId, membershipId, paymentId, status } = createOrderDto;

    const user = await this.userRepository.findOneOrFail({
      where: { id: userId },
    });
    const membership = await this.membershipRepository.findOneOrFail({
      where: { id: membershipId },
    });
    const payment = await this.paymentRepository.findOneOrFail({
      where: { id: paymentId },
    });

    const order = this.ordersRepository.create({
      user,
      membership,
      payment,
      status,
    });

    return this.ordersRepository.save(order);
  }

  async getAllOrders(): Promise<Order[]> {
    return this.ordersRepository.find({
      relations: ['user', 'membership', 'payment'], // Include related entities
    });
  }

  async getOrderById(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['user', 'membership', 'payment'], // Include related entities
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    return order;
  }

  async updateOrder(
    id: string,
    updateOrderDto: UpdateOrderDto,
  ): Promise<Order> {
    const order = await this.getOrderById(id);
    Object.assign(order, updateOrderDto);
    return this.ordersRepository.save(order);
  }

  async deleteOrder(id: string): Promise<boolean> {
    const result = await this.ordersRepository.delete(id);
    return result.affected > 0;
  }
}
