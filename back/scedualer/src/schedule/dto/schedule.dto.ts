import { IsDate, IsISO8601, IsNumber, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class scheduleDto {
  @Type(() => Date)
  @IsDate()
  scedualStart: Date;

  @IsNumber()
  userId?: number;

  @Type(() => Date)
  @IsDate()
  scedualEnd: Date;
}
