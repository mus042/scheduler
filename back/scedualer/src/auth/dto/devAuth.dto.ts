import { Role, serverRole } from '@prisma/client';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { userProfileDto } from './userProfile.dto';

export class devAuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  userServerRole: serverRole;

  @IsNumber()
  facilityId?: number;

  @IsOptional()
  userProfile: userProfileDto;
}
