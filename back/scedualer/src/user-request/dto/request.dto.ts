import { requestStatus, user } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDate,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class RequestDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsEnum(requestStatus)
  @IsOptional()
  status?: requestStatus;
  
  @IsNumber()
  senderId: number;
  @IsOptional()
  @IsString()
  senderName?: string;
  @IsString()
  @IsOptional()
  senderLastName?: string;
  @IsNumber()
  destionationUserId: number;

  @IsBoolean()
  isAnswered: boolean;

  @IsString()
  @IsOptional()
  requsetMsg?: string;

  @IsNumber()
  shiftId: number;

  @Type(() => Date)
  @IsDate()
  shiftStartTime: Date;
  @Type(() => Date)
  @IsDate()
  shiftEndTime: Date;
}
