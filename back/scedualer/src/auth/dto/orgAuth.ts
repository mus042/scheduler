import { Role, user } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { AuthDto } from './auth.dto';
import { userProfileDto } from './userProfile.dto';

export class orgAuth {
  @IsString()
  @IsNotEmpty()
  name: string;

  userProfile: any;

  @IsOptional()
  @IsNumber()
  facilityId?: number;

  @IsOptional()
  @IsNumber()
  orgId?: number;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
