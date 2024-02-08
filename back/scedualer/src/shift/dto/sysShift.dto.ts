import {
    Role,
  UserPreference,
 
  scheduleType,
  shift,
  shiftTimeClassification,
  typeOfShift,
  user,
} from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  isEmail,
  isEnum,
  isNumber,
} from 'class-validator';
export class SystemShiftDTO {
  @IsOptional()
  @IsNumber()
  id?: number;
  @IsOptional()
  createdAt?: Date;
  updatedAt?: Date;

  @IsString()
  shiftName?: string;
  @IsString()
  shiftStartHour: Date;
  @IsString()
  shiftEndHour: Date;

  @IsOptional()
  @IsEnum(typeOfShift)
  typeOfShift?: typeOfShift;

  @IsEnum(shiftTimeClassification)
  shiftTimeName?: shiftTimeClassification;


  @IsOptional()
  shiftMoldId?: number;
  shiftRole: Role | object;
  @IsOptional()
  @IsNumber()
  scheduleId?: number;
  @IsEnum(scheduleType)
  shiftType: scheduleType;

  }
