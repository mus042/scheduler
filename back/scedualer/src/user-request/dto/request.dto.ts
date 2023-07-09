import { user } from "@prisma/client";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";


export class RequestDto {
    @IsOptional()
    @IsNumber()
    id?:number 
    
    @IsNumber()
    senderId: number;
  
    @IsNumber()
    destionationUserId: number;
  
    @IsString()
    status: string;
  
    @IsBoolean()
    isAnswered: boolean;
  
    @IsString()
    requestMsg?: string;
  
    @IsNumber()
    shiftId: number;
  }