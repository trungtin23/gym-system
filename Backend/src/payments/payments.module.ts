import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Payment } from 'src/entities/payment.entity';
import { User } from 'src/entities/user.entity';
import { VnpayModule } from 'nestjs-vnpay';
import { HashAlgorithm, ignoreLogger } from 'vnpay';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, User]),
    VnpayModule.register({
      tmnCode: 'JRNO6CET',
      secureSecret: 'OZ24BZHPIGUSDB49MOGLT7CT33VCHI8E',
      vnpayHost: ' https://sandbox.vnpayment.vn/paymentv2/vpcpay.html', // Host của VNPay (sandbox hoặc production)
      // Cấu hình tùy chọn
      testMode: true, // Chế độ test (ghi đè vnpayHost thành sandbox nếu là true)
      hashAlgorithm: HashAlgorithm.SHA512, // Use a valid hash algorithm
      enableLog: true, // Bật/tắt ghi log
      loggerFn: ignoreLogger, // Hàm xử lý log tùy chỉnh
    }),
  ],
  controllers: [PaymentsController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
