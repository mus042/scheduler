import {
    Role,
  UserPreference,
 
  
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
  tmpId?:number;
  @IsOptional()
  createdAt?: Date;
  updatedAt?: Date;

    userId?:number;
  @IsString()
  shiftName: string;
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
  shiftRole:{ id: number; name: string; description: string; facilityId: number; roleId?:number,role?:{name:string,id:number}} ;
  @IsOptional()
  @IsNumber()
  scheduleId?: number;
  @IsString()
  shiftType: "user"|"system";

  }
