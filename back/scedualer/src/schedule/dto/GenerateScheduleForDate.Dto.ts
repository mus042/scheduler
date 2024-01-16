import {
  IsArray,
  IsDate,
  IsISO8601,
  IsNumber,
  IsObject,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { shift, user } from '@prisma/client';

export class generateScheduleForDateDto {
  @Type(() => Date)
  @IsDate()
  scedualStart: Date;
}
