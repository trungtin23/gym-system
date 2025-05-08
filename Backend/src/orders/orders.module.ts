import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entities/orders.entity';
import { User } from 'src/entities/user.entity';
import { Membership } from 'src/entities/membership.entity';
import { Payment } from 'src/entities/payment.entity';

@Module({
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
  imports: [TypeOrmModule.forFeature([Order, User, Membership, Payment])],
})
export class OrdersModule {}
