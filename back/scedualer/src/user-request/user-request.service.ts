import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestDto } from './dto/request.dto';
import { shift, user, userRequest } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class UserRequestService {
  //Handel all userRequest actions
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway, // private userService: UserService, // private scheduleUtil: ScheduleUtil,
  ) {}
  //set new request
  async setRequest(requestDto: RequestDto) {
    //This will set new request for a user.

    if (!requestDto) {
      console.log({ requestDto });
      throw new ForbiddenException('NO request to send ');
    }
    try {
      console.log({ requestDto });
      const result = await this.prisma.userRequest.create({
        data: {
          senderId: requestDto.senderId,
          destionationUserId: requestDto.destionationUserId,
          shiftId: requestDto.shiftId,
          status: 'pending',
          isAnswered: false,
        },
      });
      console.log({ result });
      const user: user = await this.prisma.user.findUnique({
        where: {
          id: result.senderId,
        },
      });
      const shift: shift = await this.prisma.shift.findUnique({
        where: {
          id: result.shiftId,
        },
        include: {
          userRef: true,
        },
      });
      const request: RequestDto = {
        ...result,
        senderName: user.firstName,
        senderLastName: user.lastName,
        shiftStartTime: shift.shifttStartHour,
        shiftEndTime: shift.shiftEndHour,
      };

      const msgSent = this.setRequest(request);
      console.log(' is message sent ', msgSent);
      if (msgSent) {
        //update the request status to sent
        try {
          result.status = 'sent';
          const updateRequestResult = await this.prisma.userRequest.update({
            where: {
              id: result.id,
            },
            data: {
              status: 'sent',
            },
          });
        } catch (error) {
          console.log(error.message);
          // throw new ForbiddenException('cant update request status line 47');
        }
      }
      return result;
    } catch (error) {
      console.log({ error });
      // throw new ForbiddenException('error creating request', error.message);
    }
  }
  //getRequest

  async getRequest(requestId: number) {
    if (!requestId || requestId < 0) {
      throw new ForbiddenException('NO request to get ');
    }
    try {
      const result: userRequest = await this.prisma.userRequest.findUnique({
        where: {
          id: requestId,
        },include:{
          shift:true
        }
      });
      console.log({ result });
      return result;
    } catch (error) {
      throw new ForbiddenException('error creating request', error);
    }
  }
  //get all sent requests for user
  async getallUserSentrequest(userId: number) {
    if (!userId || userId < 0) {
      throw new ForbiddenException('NO request to get ');
    }
    try {
      console.log('userifd', { userId });
      const result: userRequest[] = await this.prisma.userRequest.findMany({
        where: {
          senderId: userId,
        },include:{
          shift:true
        }
      });
      console.log('sent ', { result });
      return result;
    } catch (error) {
      throw new ForbiddenException('error creating request', error);
    }
    return [];
  }
  //get all recived requests  for user
  async getallUserRecivedrequest(userId: number) {
    if (!userId || userId < 0 || userId === null) {
      throw new ForbiddenException('NO user to get request');
    }

    try {
      const result: userRequest[] = await this.prisma.userRequest.findMany({
        where: {
          destionationUserId: userId,
        },
        include: {
          senderUserRef: {
            select: {
              firstName: true,
              lastName: true,
              // Add any other fields from the user model that you want to include
            },
          },
          acceptingUserRef: {
            select: {
              firstName: true,
              lastName: true,
              // Add any other fields from the user model that you want to include
            },
             
            }, 
            shift:true,
          
        },
      });
      console.log('recived req: ', { result });
      return result;
    } catch (error) {
      throw new ForbiddenException('error creating request', error);
    }
  }
  //  async getRequestdetails(userRequest:RequestDto){
  //   //get the user and shift details and return object containing,
  //   try{
  //     if(userRequest){
  //       const sender:user = await this.prisma.user.findUnique({where:{
  //         id:userRequest.senderId
  //       }});
  //       const shift :shift = await this.prisma.shift.findUnique({where:{id:userRequest.shiftId}});

  //     }
  //   }
  //  }
  //delete request
  async deleteRequest(requestId: number) {
    if (!requestId) {
      throw new ForbiddenException('NO request to send ');
    }
    try {
      const result: userRequest = await this.prisma.userRequest.delete({
        where: {
          id: requestId,
        },
      });
      console.log({ result });
      return result;
    } catch (error) {
      throw new ForbiddenException('error creating request', error);
    }
  }
  //edit Request
  async editRequest(requestDto: RequestDto) {
    if (!requestDto || requestDto?.senderId < 0) {
      throw new ForbiddenException('NO request to edit ');
    }
    try {
      const result: userRequest = await this.prisma.userRequest.update({
        where: {
          id: requestDto.id,
        },
        data: {
          ...requestDto,
        },
      });
      console.log({ result });
      return result;
    } catch (error) {
      throw new ForbiddenException('error creating request', error);
    }
  }
  //change status for request 
  async setStatus(requestDto:RequestDto){
    if(requestDto && requestDto.id >= 0  ){
      console.log('request ',{requestDto})
    try {
      const res = await this.prisma.userRequest.update({
        where:{
          id: requestDto.id, 
        },data:{
          status:requestDto.status,
        }
      })
    return true;
    } catch (error) {
      console.log(error.message);
      return false;
    }
  }
}
  //Cancelle request

  async getAllPendingRequests(senderId: number) {
    // All the request.status == pending || to send
    try {
      const pendingRequests = await this.prisma.userRequest.findMany({
        where: {
          OR: [
            { status: 'pending' },
            // { status: "pending" }
          ],
        },
      });
      // for (const reqest of pendingRequests){
      //   try{
      //     this.eventsGateway.sendRequest(reqest);
      //     const result = await this.prisma.userRequest.update({
      //       where:{
      //         id: reqest.id,
      //       },data:{
      //         status: "sent"
      //       }
      //     })
      //     console.log("sent", reqest.id," to : " ,reqest.destionationUserId);
      //   }
      //   catch (error){
      //     console.log({error});
      //     throw new ForbiddenException(error.message);
      //   }
      // }
      return pendingRequests;
    } catch (error) {
      console.log({ error });
      throw new ForbiddenException(error.message);
    }
  }
  async replayToRequest(requestId: number, userId:number , requestAnswer:string) {
    if (!requestId) {
      throw new ForbiddenException(' no requestId');
    }
    try {
      const request = await this.prisma.userRequest.update({
        where: {
          id: requestId,
        },
        data:{
          isAnswered:true,
          requestAnswer:requestAnswer,
        }
      });
      
      if(!request){ //if no request. consider adding cheack for role && userId to match the request destnation.
        throw new ForbiddenException("no request or replaying user is unauthoraized.")
      }
      console.log({request});
      return request;

    } catch (error) { 
      throw new ForbiddenException(error);
    }
  }
}
