import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from 'src/entities/payment.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { User } from 'src/entities/user.entity';
import { VnpayService } from 'nestjs-vnpay';
import { ProductCode, VnpLocale, dateFormat } from 'vnpay';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly vnpayService: VnpayService,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createPaymentUrl(orderId: string, amount: number, ipAddr: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const paymentUrl = await this.vnpayService.buildPaymentUrl({
      vnp_Amount: amount * 100, // VNPay yêu cầu số tiền tính bằng cent-face
      vnp_IpAddr: ipAddr,
      vnp_TxnRef: `ORDER${orderId}`,
      vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
      vnp_OrderType: ProductCode.Other,
      vnp_ReturnUrl: 'http://localhost:3000/payment/vnpay-return',
      vnp_Locale: VnpLocale.VN,
      vnp_CreateDate: dateFormat(new Date()),
      vnp_ExpireDate: dateFormat(tomorrow),
    });

    return paymentUrl;
  }

  async verifyPayment(query: any) {
    const result = await this.vnpayService.verifyReturnUrl(query);
    return result;
  }

  async create(createPaymentDto: CreatePaymentDto): Promise<Payment> {
    const user = await this.usersRepository.findOne({
      where: { id: createPaymentDto.userId },
    });
    if (!user) {
      throw new NotFoundException(
        `User with ID ${createPaymentDto.userId} not found`,
      );
    }

    const payment = this.paymentsRepository.create({
      ...createPaymentDto,
      user,
    });

    return this.paymentsRepository.save(payment);
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find({ relations: ['user'] });
  }

  async findOne(id: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: Number(id) },
      relations: ['user'],
    });
    if (!payment) {
      throw new NotFoundException(`Payment with ID ${id} not found`);
    }
    return payment;
  }

  async update(
    id: string,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<Payment> {
    const payment = await this.findOne(id);
    Object.assign(payment, updatePaymentDto);
    return this.paymentsRepository.save(payment);
  }

  async remove(id: string): Promise<void> {
    const payment = await this.findOne(id);
    await this.paymentsRepository.remove(payment);
  }
}
