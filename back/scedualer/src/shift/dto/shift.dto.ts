import { shift, shiftType, typeOfShift, typeOfUser, user } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  isEmail,
  isEnum,
  isNumber,
} from 'class-validator';
export class ShiftDto {
  @IsString()
  userPreference: string;

  id?: number;
  createdAt?: Date;
  updatedAt?: Date;

  @IsString()
  shiftDate: Date;

  @IsEnum(shiftType)
  shiftType: shiftType;

  @IsString()
  shiftName?: string 
  @IsString()
  shifttStartHour: Date;
  @IsString()
  shiftEndHour: Date;

  @IsOptional()
  @IsEnum(typeOfUser)
  typeOfUser?: typeOfUser;

  @IsOptional()
  @IsEnum(typeOfShift)
  typeOfShift?: typeOfShift;

  @IsOptional()
  @IsNumber()
  scheduleId?: number;

  @IsOptional()
  @IsNumber()
  userId?: number | undefined;
  userRef?: user | null;

  @IsOptional()
  
  userNeededType?: string;

  role?: string 
}
