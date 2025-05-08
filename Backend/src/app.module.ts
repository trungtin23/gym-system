import { AuthModule } from './auth/auth.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { MembershipsModule } from './memberships/memberships.module';
import { PaymentsModule } from './payments/payments.module';
import { TrainerModule } from './trainer/trainer.module';
import { OrdersModule } from './orders/orders.module';
import { VnpayService } from './vnpay/vnpay.service';
import { HealthsModule } from './healths/healths.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'gym_management',
      entities: [__dirname + '/entities/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    MembershipsModule,
    PaymentsModule,
    TrainerModule,
    OrdersModule,
    HealthsModule,
  ],
  controllers: [AppController],
  providers: [AppService, VnpayService],
})
export class AppModule {}
