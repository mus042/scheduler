import { IsEmail, IsNumber } from "class-validator"

export class userDto{
    @IsEmail()
    email:string

    @IsNumber()
    id:number

    
}