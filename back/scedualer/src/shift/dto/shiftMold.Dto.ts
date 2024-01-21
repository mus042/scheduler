import { UserPreference, shift, typeOfShift, user } from '@prisma/client';
import {
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  isEmail,
  isEnum,
  isNumber,
} from 'class-validator';
export class shiftMoldDto {
  @IsOptional()
  @IsNumber()
  id?: number;

  @IsString()
  name: String;

  @IsString()
  startHour: string;
  @IsString()
  endHour: string;

  @IsNumber()
  day: number;

  @IsOptional()
  @IsNumber()
  userId?: number | undefined;
  userRef?: user | null;

  @IsObject()
  userPrefs: UserPreference;

  role?: string;
}
