import { Type } from 'class-transformer';
import { IsDate, IsNumber, IsString } from 'class-validator';

export class EditShiftByDateDto {
  @Type(() => Date)
  @IsDate()
  shiftDate: Date;

  @IsString()
  userPreference: string;
}
