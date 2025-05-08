import { Module } from '@nestjs/common';
import { HealthService } from './healths.service';
import { HealthController } from './healths.controller';
import { User } from 'src/entities/user.entity';
import { Health } from 'src/entities/health.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Health, User])],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthsModule {}
