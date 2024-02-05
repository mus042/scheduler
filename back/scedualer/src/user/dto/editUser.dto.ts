import { IsEAN, IsEmail, IsNumber, IsOptional, IsString, isEmail } from 'class-validator';

export class EditUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsNumber()
  roleId:number;
}
