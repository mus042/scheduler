import { IsEAN, IsEmail, IsOptional, IsString, isEmail } from "class-validator"

export class EditUserDto{   
@IsEmail()
email:string

@IsString()
@IsOptional()
firstName?:string
    
    
    
@IsString()
@IsOptional()
lastName?:string
}