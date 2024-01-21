import { Type } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsString } from 'class-validator';
import { EditShiftByDateDto } from './editShiftByDate.dto';

export class bulkShiftsToEditDto {
  //This will handel the pass of data to bulk edit shifts .
  //get shift by schedualId , and shift starting time.
  //user prefrence will be used to edit the shift .

  @IsNumber()
  scheduleId: number;

  @IsArray()
  shiftsEdit: EditShiftByDateDto[];

  /////
}
