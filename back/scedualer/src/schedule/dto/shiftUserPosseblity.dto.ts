import {
    IsDate,
    IsISO8601,
    IsNumber,
    IsOptional,
    IsString,
  } from 'class-validator';
  import { Type } from 'class-transformer';
import { user } from '@prisma/client';
  
  export class shiftUserPosseblity {
    @Type(() => Date)
    @IsDate()
    scedualStart: Date;
  
    @IsNumber()
    userId?: number;
  
    @Type(() => Date)
    @IsNumber()
    roleId: number;
  
    @IsString()
    userPref: string;
    

    userRef?: user;
  }
  