import {
  IsArray,
  IsDate,
  IsISO8601,
  IsNumber,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { shift } from '@prisma/client';

export class scheduleDto {
  @IsNumber()
  scheduleId: number;

  @IsArray()
  shiftsToUpdate: shift[];
}
