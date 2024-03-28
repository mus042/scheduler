import {
  IsArray,
  IsDate,
  IsISO8601,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import {  user } from '@prisma/client';

export class generateScheduleForDateDto {
  @Type(() => Date)
  @IsDate()
  scedualStart: Date;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  scedualEnd?: Date;

  @IsNumber()
  facilityId: number;

  @IsOptional()
  @IsArray()
  selctedUsers?: any;
}
