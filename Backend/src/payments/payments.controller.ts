import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
  Res,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('create')
  async createPayment(@Req() req: Request, @Res() res: Response) {
    const orderId = Date.now().toString();
    const amount = 10000; // 10000 VND
    const ipAddr = req.ip;

    const paymentUrl = await this.paymentsService.createPaymentUrl(
      orderId,
      amount,
      ipAddr,
    );
    res.redirect(paymentUrl);
  }

  @Get('vnpay-return')
  async paymentReturn(@Req() req: Request) {
    const result = await this.paymentsService.verifyPayment(req.query);
    if (result.isVerified) {
      if (result.isSuccess) {
        return `Thanh toán thành công! Mã giao dịch: ${result.vnp_TxnRef}`;
      } else {
        return `Thanh toán thất bại: ${result.message || 'Unknown error'}`;
      }
    } else {
      return 'Chữ ký không hợp lệ!';
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createPaymentDto: CreatePaymentDto) {
    return this.paymentsService.create(createPaymentDto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.paymentsService.findAll();
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.paymentsService.remove(id);
  }
}
