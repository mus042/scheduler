import { Role, serverRole } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { userProfileDto } from './userProfile.dto';

export class AuthDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsEnum(serverRole)
  userServerRole?: serverRole;

  @IsOptional()
  @IsNumber()
  facilityId?: number;

  @IsOptional()
  userProfile?: userProfileDto;
}
