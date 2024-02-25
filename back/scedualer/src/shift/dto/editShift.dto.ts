import { Type } from 'class-transformer';
import {
  IsDate,
  IsISO8601,
  IsNumber,
  IsString,
  isDateString,
} from 'class-validator';

export class EditShiftDto {
  @IsNumber()
  shiftId: number;

  @IsString()
  userPreference: string;

  shiftType: "user"|"system"
}
