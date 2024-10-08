import {
  Role,
  UserPreference,
  userShift,
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
export class ShiftDto {
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
  @IsNumber()
  userId?: number | undefined;
  
  userRef?: user | null;

  @IsString()
  userPreference: string;

  @IsOptional()
  @IsNumber()
  scheduleId?: number;

@IsString()
  shiftType: "system" | "user";

  shiftRoleId?:number; 
  shiftRole?: Role;
  userPref?: UserPreference;
}
