import {
    Role,
  UserPreference,
  UserShiftRole,
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

  @IsOptional()
  @IsNumber()
  scheduleId?: number;
  @IsEnum(scheduleType)
  shiftType: scheduleType;

  shiftRoles?: {create:[{userId:number , roleId:number , role:Role , shiftId:number,userPreference:string}]};
}
