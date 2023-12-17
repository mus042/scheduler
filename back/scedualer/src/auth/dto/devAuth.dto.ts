import { Role } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class devAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  userRole: Role;

  @IsString()
  facility?: string;

  @IsNumber()
  orgId?: number;

  @IsOptional()
  @IsString()
  firstName?: string;
  
  @IsOptional()
  @IsString()
  lastName?: string;
  
  @IsOptional()
  @IsString()
  phoneNumber?: number;
}
