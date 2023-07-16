import { userRequest } from "@prisma/client";
import { RequestDto } from "src/user-request/dto/request.dto";


export interface serverToClientEvents{
    newRequest: (payload: RequestDto) =>void;
}