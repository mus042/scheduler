import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RequestDto } from './dto/request.dto';
import { userRequest } from '@prisma/client';

@Injectable()
export class UserRequestService {
    //Handel all userRequest actions 
    constructor(
        private prisma: PrismaService,
        // private shiftSercvice: ShiftService,
        // private userService: UserService,
        // private scheduleUtil: ScheduleUtil,
      ) {}
        //set new request 
        async setRequest(requestDto:RequestDto){
            //This will set new request for a user. 
            
            if(!requestDto){
                throw new ForbiddenException("NO request to send ") 
            }
            try{
                const result:userRequest = await this.prisma.userRequest.create({
                    data:{
                        ...requestDto
                    }
                })
                console.log({result});
                return result;
            }
            catch (error){
                console.log({error})
                throw new ForbiddenException("error creating request", error)
            }
        }
        //getRequest 

        async getRequest(requestId:number){
            if(!requestId || requestId < 0){
                throw new ForbiddenException("NO request to get ") 
            }
            try{
                const result:userRequest = await this.prisma.userRequest.findUnique({
                    where:{
                        id:requestId
                    }
                })
                console.log({result});
                return result;
            }
            catch (error){
                throw new ForbiddenException("error creating request", error)
            }
        }
        //get all sent requests for user
        async getallUserSentrequest(userId:number){
            if(!userId || userId < 0){
                throw new ForbiddenException("NO request to get ") 
            }
            try{
                const result:userRequest[] = await this.prisma.userRequest.findMany({
                    where:{
                        senderId:userId,
                    }
                })
                console.log({result});
                return result;
            }
            catch (error){
                throw new ForbiddenException("error creating request", error)
            }
        }
        //get all recived requests  for user 
        async getallUserRecivedrequest(userId:number){
            if(!userId || userId < 0){
                throw new ForbiddenException("NO request to get ") 
            }
            try{
                const result:userRequest[] = await this.prisma.userRequest.findMany({
                    where:{
                        destionationUserId:userId,
                    }
                })
                console.log({result});
                return result;
            }
            catch (error){
                throw new ForbiddenException("error creating request", error)
            }
        }

        //delete request 
        async deleteRequest(requestId:number){
            if(!requestId){
                throw new ForbiddenException("NO request to send ") 
            }
            try{
                const result:userRequest = await this.prisma.userRequest.delete({
                 where:{
                    id:requestId
                 }
                })
                console.log({result});
                return result;
            }
            catch (error){
                throw new ForbiddenException("error creating request", error)
            }
        }
        //edit Request 
        async editRequest(requestDto:RequestDto){
            if(!requestDto || requestDto?.senderId < 0){
                throw new ForbiddenException("NO request to edit ") 
            }
            try{
                const result:userRequest = await this.prisma.userRequest.update({
                    where:{
                        id:requestDto.id
                    },
                    data:{
                        ...requestDto
                    }
                })
                console.log({result});
                return result;
            }
            catch (error){
                throw new ForbiddenException("error creating request", error)
            }
        }
        //change status for request ? 
        //Cancelle request 
}
