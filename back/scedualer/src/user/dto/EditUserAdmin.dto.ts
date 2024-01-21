// import { typeOfUser } from "@prisma/client"
import {
  IsEmail,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class EditUserAsAdminDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsOptional()
  @IsNumber()
  userLevel?: number;

  @IsString()
  @IsOptional()
  lastName?: string;
}
