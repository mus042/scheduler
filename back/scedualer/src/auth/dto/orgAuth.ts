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

export class orgAuth {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsNumber()
  facilityId?: number;

  @IsOptional()
  @IsNumber()
  orgId?: number;

//   @IsObject()
//   user?: AuthDto
@IsEmail()
@IsNotEmpty()
email: string;

@IsString()
@IsNotEmpty()
password: string;

}
