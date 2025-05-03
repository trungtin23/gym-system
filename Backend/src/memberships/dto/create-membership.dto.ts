import { IsString, IsInt, IsArray, IsNotEmpty } from 'class-validator';

export class CreateMembershipDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  price: number;

  @IsInt()
  duration: number;

  @IsString()
  description: string;

  @IsArray()
  @IsString({ each: true })
  features: string[];
}
