import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trainer } from '../entities/trainer.entity';
import { CreateTrainerDto } from './dto/create-trainer.dto';
import { UpdateTrainerDto } from './dto/update-trainer.dto';
import { User } from '../entities/user.entity';
import { TrainerSchedule, DayOfWeek } from '../entities/trainerSchedule.entity';

@Injectable()
export class TrainerService {
  constructor(
    @InjectRepository(Trainer)
    private readonly trainerRepository: Repository<Trainer>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TrainerSchedule)
    private readonly trainerScheduleRepository: Repository<TrainerSchedule>,
  ) {}

  async createTrainer(createTrainerDto: CreateTrainerDto): Promise<Trainer> {
    const { userId, specialization, experience, certifications } =
      createTrainerDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Optional: check if already trainer
    const existingTrainer = await this.trainerRepository.findOne({
      where: { user: { id: userId } },
    });
    if (existingTrainer) {
      throw new BadRequestException('User is already a trainer');
    }

    // Cập nhật role
    user.role = 'TRAINER';
    await this.userRepository.save(user);

    const trainer = this.trainerRepository.create({
      specialization,
      experience,
      certifications,
      user,
    });

    return this.trainerRepository.save(trainer);
  }

  async getAllTrainers(): Promise<Trainer[]> {
    return this.trainerRepository.find({ relations: ['user'] });
  }

  async getTrainerById(id: string): Promise<Trainer> {
    const trainer = await this.trainerRepository.findOne({
      where: { id },
      relations: ['user'],
    });
    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }
    return trainer;
  }

  async getTrainerByUserId(userId: string): Promise<Trainer> {
    const trainer = await this.trainerRepository.findOne({
      where: { user: { id: userId } },
      relations: ['user'],
    });
    if (!trainer) {
      throw new NotFoundException(`Trainer with user ID ${userId} not found`);
    }
    return trainer;
  }

  async updateTrainer(
    id: string,
    updateTrainerDto: UpdateTrainerDto,
  ): Promise<Trainer> {
    const trainer = await this.getTrainerById(id);
    Object.assign(trainer, updateTrainerDto);
    return this.trainerRepository.save(trainer);
  }

  async deleteTrainer(id: string): Promise<void> {
    const trainer = await this.getTrainerById(id);
    await this.trainerRepository.remove(trainer);
  }

  async seedSampleData(): Promise<void> {
    // Xóa dữ liệu cũ
    await this.trainerScheduleRepository.delete({});
    
    // Tạo 9 users cho PT
    const ptUsers = [
      {
        id: 'user-pt-001',
        email: 'pt.longvuong@gymfit.com',
        password: '$2b$10$hashedpassword001',
        full_name: 'Vương Văn Long',
        phone: '0901234567',
        date_of_birth: new Date('1990-03-15'),
        gender: 'Male' as const,
        address: '123 Nguyễn Huệ, Q1, TP.HCM',
        role: 'TRAINER' as const,
        status: 'ACTIVE' as const,
      },
      {
        id: 'user-pt-002',
        email: 'pt.minhtu@gymfit.com',
        password: '$2b$10$hashedpassword002',
        full_name: 'Phạm Minh Tú',
        phone: '0912345678',
        date_of_birth: new Date('1988-07-22'),
        gender: 'Male' as const,
        address: '456 Lê Lợi, Q1, TP.HCM',
        role: 'TRAINER' as const,
        status: 'ACTIVE' as const,
      },
      {
        id: 'user-pt-003',
        email: 'pt.thanhhang@gymfit.com',
        password: '$2b$10$hashedpassword003',
        full_name: 'Nguyễn Thanh Hằng',
        phone: '0923456789',
        date_of_birth: new Date('1992-11-08'),
        gender: 'Female' as const,
        address: '789 Trần Hưng Đạo, Q5, TP.HCM',
        role: 'TRAINER' as const,
        status: 'ACTIVE' as const,
      },
      {
        id: 'user-pt-004',
        email: 'pt.ducminh@gymfit.com',
        password: '$2b$10$hashedpassword004',
        full_name: 'Trần Đức Minh',
        phone: '0934567890',
        date_of_birth: new Date('1985-05-30'),
        gender: 'Male' as const,
        address: '321 Võ Văn Tần, Q3, TP.HCM',
        role: 'TRAINER' as const,
        status: 'ACTIVE' as const,
      },
      {
        id: 'user-pt-005',
        email: 'pt.kimbang@gymfit.com',
        password: '$2b$10$hashedpassword005',
        full_name: 'Lê Kim Băng',
        phone: '0945678901',
        date_of_birth: new Date('1994-09-12'),
        gender: 'Female' as const,
        address: '654 Pasteur, Q1, TP.HCM',
        role: 'TRAINER' as const,
        status: 'ACTIVE' as const,
      },
      {
        id: 'user-pt-006',
        email: 'pt.vanhoang@gymfit.com',
        password: '$2b$10$hashedpassword006',
        full_name: 'Đỗ Văn Hoàng',
        phone: '0956789012',
        date_of_birth: new Date('1987-01-25'),
        gender: 'Male' as const,
        address: '987 Cách Mạng Tháng 8, Q10, TP.HCM',
        role: 'TRAINER' as const,
        status: 'ACTIVE' as const,
      },
      {
        id: 'user-pt-007',
        email: 'pt.thuydung@gymfit.com',
        password: '$2b$10$hashedpassword007',
        full_name: 'Vũ Thùy Dung',
        phone: '0967890123',
        date_of_birth: new Date('1991-12-03'),
        gender: 'Female' as const,
        address: '159 Điện Biên Phủ, Q3, TP.HCM',
        role: 'TRAINER' as const,
        status: 'ACTIVE' as const,
      },
      {
        id: 'user-pt-008',
        email: 'pt.quanghuy@gymfit.com',
        password: '$2b$10$hashedpassword008',
        full_name: 'Bùi Quang Huy',
        phone: '0978901234',
        date_of_birth: new Date('1989-06-18'),
        gender: 'Male' as const,
        address: '753 Nguyễn Thị Minh Khai, Q1, TP.HCM',
        role: 'TRAINER' as const,
        status: 'ACTIVE' as const,
      },
      {
        id: 'user-pt-009',
        email: 'pt.nhuthanh@gymfit.com',
        password: '$2b$10$hashedpassword009',
        full_name: 'Phan Như Thạnh',
        phone: '0989012345',
        date_of_birth: new Date('1993-04-09'),
        gender: 'Male' as const,
        address: '852 Hai Bà Trưng, Q1, TP.HCM',
        role: 'TRAINER' as const,
        status: 'ACTIVE' as const,
      }
    ];

    // Lưu users
    for (const userData of ptUsers) {
      await this.userRepository.save(userData);
    }

    // Tạo trainers
    const trainers = [
      {
        id: 'trainer-001',
        story: 'Từ một người yếu ớt, tôi đã vượt qua và trở thành PT để giúp mọi người mạnh mẽ hơn.',
        bio: 'Chuyên gia thể hình với 8 năm kinh nghiệm, từng tham gia nhiều cuộc thi quốc gia.',
        specialization: 'Thể hình',
        experience: 8,
        certifications: 'NASM-CPT, ACE Personal Trainer',
        hourlyRate: 500000,
        isAvailable: true,
        maxClientsPerDay: 8,
        user: { id: 'user-pt-001' },
      },
      {
        id: 'trainer-002',
        story: 'Đam mê powerlifting từ khi còn học đại học, giờ muốn chia sẻ kiến thức cho mọi người.',
        bio: 'Huấn luyện viên powerlifting chuyên nghiệp, kỷ lục deadlift 250kg.',
        specialization: 'Powerlifting',
        experience: 6,
        certifications: 'USAPL Certified Coach, Starting Strength',
        hourlyRate: 450000,
        isAvailable: true,
        maxClientsPerDay: 6,
        user: { id: 'user-pt-002' },
      },
      {
        id: 'trainer-003',
        story: 'Yoga đã thay đổi cuộc đời tôi, giúp tôi tìm thấy sự cân bằng và bình an nội tâm.',
        bio: 'Giảng viên yoga với triết lý sống khỏe toàn diện, từ thể chất đến tinh thần.',
        specialization: 'Yoga',
        experience: 7,
        certifications: 'RYT-500, Ashtanga Yoga Certified',
        hourlyRate: 400000,
        isAvailable: true,
        maxClientsPerDay: 10,
        user: { id: 'user-pt-003' },
      },
      {
        id: 'trainer-004',
        story: 'CrossFit là nghệ thuật của sức mạnh và sự bền bỉ. Tôi sẽ giúp bạn vượt qua giới hạn của mình.',
        bio: 'Huấn luyện viên CrossFit Level 2, chuyên về functional fitness và conditioning.',
        specialization: 'CrossFit',
        experience: 5,
        certifications: 'CrossFit Level 2, Olympic Weightlifting',
        hourlyRate: 480000,
        isAvailable: true,
        maxClientsPerDay: 7,
        user: { id: 'user-pt-004' },
      },
      {
        id: 'trainer-005',
        story: 'Cardio không chỉ là chạy bộ. Hãy để tôi chỉ cho bạn cách làm cardio thông minh và hiệu quả.',
        bio: 'Chuyên gia về cardio training và giảm cân, đã giúp hàng trăm học viên đạt mục tiêu.',
        specialization: 'Cardio/Giảm cân',
        experience: 4,
        certifications: 'HIIT Specialist, Fat Loss Specialist',
        hourlyRate: 350000,
        isAvailable: true,
        maxClientsPerDay: 12,
        user: { id: 'user-pt-005' },
      },
      {
        id: 'trainer-006',
        story: 'Functional training giúp bạn mạnh mẽ trong cuộc sống hàng ngày, không chỉ trong phòng gym.',
        bio: 'Huấn luyện viên functional training, chuyên phục hồi chấn thương và cải thiện vận động.',
        specialization: 'Functional Training',
        experience: 6,
        certifications: 'FMS Certified, SFMA Level 2',
        hourlyRate: 420000,
        isAvailable: true,
        maxClientsPerDay: 8,
        user: { id: 'user-pt-006' },
      },
      {
        id: 'trainer-007',
        story: 'Pilates là nghệ thuật kiểm soát cơ thể. Tôi sẽ giúp bạn tìm thấy sức mạnh từ bên trong.',
        bio: 'Giảng viên Pilates chuyên nghiệp, chuyên về core strengthening và posture correction.',
        specialization: 'Pilates',
        experience: 5,
        certifications: "Romana's Pilates Certified, BASI Pilates",
        hourlyRate: 380000,
        isAvailable: true,
        maxClientsPerDay: 9,
        user: { id: 'user-pt-007' },
      },
      {
        id: 'trainer-008',
        story: 'Boxing không chỉ là môn thể thao, mà còn là cách rèn luyện tinh thần và sự tự tin.',
        bio: 'Cựu vô địch boxing amateur, giờ tập trung vào fitness boxing và self-defense.',
        specialization: 'Boxing/Martial Arts',
        experience: 7,
        certifications: 'USA Boxing Certified, Muay Thai Level 1',
        hourlyRate: 450000,
        isAvailable: true,
        maxClientsPerDay: 8,
        user: { id: 'user-pt-008' },
      },
      {
        id: 'trainer-009',
        story: 'Cơ thể chúng ta có thể làm được nhiều điều tuyệt vời hơn chúng ta nghĩ. Hãy để tôi chứng minh điều đó.',
        bio: 'Huấn luyện viên toàn diện với kinh nghiệm trong nhiều lĩnh vực fitness khác nhau.',
        specialization: 'Thể hình',
        experience: 9,
        certifications: 'NASM-CPT, CSCS, Precision Nutrition Level 1',
        hourlyRate: 520000,
        isAvailable: true,
        maxClientsPerDay: 7,
        user: { id: 'user-pt-009' },
      }
    ];

    // Lưu trainers
    for (const trainerData of trainers) {
      await this.trainerRepository.save(trainerData);
    }

    // Tạo schedules cho các trainers
    const schedules = [
      // Trainer 001 - Thứ 2, 4, 6: Ca sáng và tối
      { trainer_id: 'trainer-001', time_slot_id: 'slot-001', dayOfWeek: DayOfWeek.MONDAY },
      { trainer_id: 'trainer-001', time_slot_id: 'slot-002', dayOfWeek: DayOfWeek.MONDAY },
      { trainer_id: 'trainer-001', time_slot_id: 'slot-005', dayOfWeek: DayOfWeek.MONDAY },
      { trainer_id: 'trainer-001', time_slot_id: 'slot-006', dayOfWeek: DayOfWeek.MONDAY },
      { trainer_id: 'trainer-001', time_slot_id: 'slot-001', dayOfWeek: DayOfWeek.WEDNESDAY },
      { trainer_id: 'trainer-001', time_slot_id: 'slot-002', dayOfWeek: DayOfWeek.WEDNESDAY },
      { trainer_id: 'trainer-001', time_slot_id: 'slot-005', dayOfWeek: DayOfWeek.WEDNESDAY },
      { trainer_id: 'trainer-001', time_slot_id: 'slot-006', dayOfWeek: DayOfWeek.WEDNESDAY },
      { trainer_id: 'trainer-001', time_slot_id: 'slot-001', dayOfWeek: DayOfWeek.FRIDAY },
      { trainer_id: 'trainer-001', time_slot_id: 'slot-002', dayOfWeek: DayOfWeek.FRIDAY },
      { trainer_id: 'trainer-001', time_slot_id: 'slot-005', dayOfWeek: DayOfWeek.FRIDAY },
      { trainer_id: 'trainer-001', time_slot_id: 'slot-006', dayOfWeek: DayOfWeek.FRIDAY },

      // Trainer 002 - Thứ 3, 5, 7: Ca sáng và chiều
      { trainer_id: 'trainer-002', time_slot_id: 'slot-001', dayOfWeek: DayOfWeek.TUESDAY },
      { trainer_id: 'trainer-002', time_slot_id: 'slot-002', dayOfWeek: DayOfWeek.TUESDAY },
      { trainer_id: 'trainer-002', time_slot_id: 'slot-004', dayOfWeek: DayOfWeek.TUESDAY },
      { trainer_id: 'trainer-002', time_slot_id: 'slot-005', dayOfWeek: DayOfWeek.TUESDAY },
      { trainer_id: 'trainer-002', time_slot_id: 'slot-001', dayOfWeek: DayOfWeek.THURSDAY },
      { trainer_id: 'trainer-002', time_slot_id: 'slot-002', dayOfWeek: DayOfWeek.THURSDAY },
      { trainer_id: 'trainer-002', time_slot_id: 'slot-004', dayOfWeek: DayOfWeek.THURSDAY },
      { trainer_id: 'trainer-002', time_slot_id: 'slot-005', dayOfWeek: DayOfWeek.THURSDAY },
      { trainer_id: 'trainer-002', time_slot_id: 'slot-001', dayOfWeek: DayOfWeek.SATURDAY },
      { trainer_id: 'trainer-002', time_slot_id: 'slot-002', dayOfWeek: DayOfWeek.SATURDAY },
      { trainer_id: 'trainer-002', time_slot_id: 'slot-003', dayOfWeek: DayOfWeek.SATURDAY },
      { trainer_id: 'trainer-002', time_slot_id: 'slot-004', dayOfWeek: DayOfWeek.SATURDAY },

      // Trainer 003 - Tất cả các ngày: Ca sáng sớm và tối  
      { trainer_id: 'trainer-003', time_slot_id: 'slot-001', dayOfWeek: DayOfWeek.MONDAY },
      { trainer_id: 'trainer-003', time_slot_id: 'slot-006', dayOfWeek: DayOfWeek.MONDAY },
      { trainer_id: 'trainer-003', time_slot_id: 'slot-001', dayOfWeek: DayOfWeek.TUESDAY },
      { trainer_id: 'trainer-003', time_slot_id: 'slot-006', dayOfWeek: DayOfWeek.TUESDAY },
      { trainer_id: 'trainer-003', time_slot_id: 'slot-001', dayOfWeek: DayOfWeek.WEDNESDAY },
      { trainer_id: 'trainer-003', time_slot_id: 'slot-006', dayOfWeek: DayOfWeek.WEDNESDAY },
      { trainer_id: 'trainer-003', time_slot_id: 'slot-001', dayOfWeek: DayOfWeek.THURSDAY },
      { trainer_id: 'trainer-003', time_slot_id: 'slot-006', dayOfWeek: DayOfWeek.THURSDAY },
      { trainer_id: 'trainer-003', time_slot_id: 'slot-001', dayOfWeek: DayOfWeek.FRIDAY },
      { trainer_id: 'trainer-003', time_slot_id: 'slot-006', dayOfWeek: DayOfWeek.FRIDAY },
      { trainer_id: 'trainer-003', time_slot_id: 'slot-001', dayOfWeek: DayOfWeek.SATURDAY },
      { trainer_id: 'trainer-003', time_slot_id: 'slot-006', dayOfWeek: DayOfWeek.SATURDAY },
      { trainer_id: 'trainer-003', time_slot_id: 'slot-001', dayOfWeek: DayOfWeek.SUNDAY },
      { trainer_id: 'trainer-003', time_slot_id: 'slot-006', dayOfWeek: DayOfWeek.SUNDAY },

      // Trainer 004 - Thứ 2, 4, 6: Ca chiều và tối
      { trainer_id: 'trainer-004', time_slot_id: 'slot-003', dayOfWeek: DayOfWeek.MONDAY },
      { trainer_id: 'trainer-004', time_slot_id: 'slot-004', dayOfWeek: DayOfWeek.MONDAY },
      { trainer_id: 'trainer-004', time_slot_id: 'slot-005', dayOfWeek: DayOfWeek.MONDAY },
      { trainer_id: 'trainer-004', time_slot_id: 'slot-006', dayOfWeek: DayOfWeek.MONDAY },
      { trainer_id: 'trainer-004', time_slot_id: 'slot-003', dayOfWeek: DayOfWeek.WEDNESDAY },
      { trainer_id: 'trainer-004', time_slot_id: 'slot-004', dayOfWeek: DayOfWeek.WEDNESDAY },
      { trainer_id: 'trainer-004', time_slot_id: 'slot-005', dayOfWeek: DayOfWeek.WEDNESDAY },
      { trainer_id: 'trainer-004', time_slot_id: 'slot-006', dayOfWeek: DayOfWeek.WEDNESDAY },
      { trainer_id: 'trainer-004', time_slot_id: 'slot-003', dayOfWeek: DayOfWeek.FRIDAY },
      { trainer_id: 'trainer-004', time_slot_id: 'slot-004', dayOfWeek: DayOfWeek.FRIDAY },
      { trainer_id: 'trainer-004', time_slot_id: 'slot-005', dayOfWeek: DayOfWeek.FRIDAY },
      { trainer_id: 'trainer-004', time_slot_id: 'slot-006', dayOfWeek: DayOfWeek.FRIDAY },
    ];

    // Lưu schedules (chỉ một phần để demo)
    for (const scheduleData of schedules) {
      const schedule = new TrainerSchedule();
      schedule.trainer = { id: scheduleData.trainer_id } as Trainer;
      schedule.timeSlot = { id: scheduleData.time_slot_id } as any;
      schedule.dayOfWeek = scheduleData.dayOfWeek;
      schedule.isAvailable = true;
      await this.trainerScheduleRepository.save(schedule);
    }
  }
}
