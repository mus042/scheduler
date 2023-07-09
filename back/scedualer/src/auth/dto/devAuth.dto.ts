import { Role } from "@prisma/client"
import { IsEmail,IsNotEmpty, IsString } from "class-validator"

export class devAuthDto{

    @IsEmail()
    @IsNotEmpty()
    email:string

    @IsString()
    @IsNotEmpty()
    password: string

    
    userRole: Role

    
}