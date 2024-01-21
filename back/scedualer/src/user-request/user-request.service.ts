import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestDto } from './dto/request.dto';
import { UserProfile, shift, user, userRequest } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';
import { request } from 'http';
import { Socket } from 'socket.io';

@Injectable()
export class UserRequestService {
  //Handel all userRequest actions
  constructor(
    private prisma: PrismaService,
    private eventsGateway: EventsGateway,
  ) {}

  /**
   * @description set new request
   * @param {RequestDto} requestDto
   * @returns {*}
   * @memberof UserRequestService
   */
  async setRequest(requestDto: RequestDto) {
    //This will set new request for a user.

    if (!requestDto) {
      //Case no dto
      console.log({ requestDto });
      throw new ForbiddenException('NO request to send ');
    }
    try {
      console.log({ requestDto });
      const result = await this.prisma.userRequest.create({
        data: {
          senderId: requestDto.senderId,
          destinationUserId: requestDto.destinationUserId,
          shiftId: requestDto.shiftId,
          status: 'pending',
          isAnswered: false,
        },
      });
      console.log({ result });
      const userProfile: any = await this.prisma.userProfile.findUnique({
        where: {
          userId: result.senderId,
        },
        select: {
          firstName: true,
          lastName: true,
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
      console.log({ userProfile }, { shift }, 'userReqService 60');
      const request = {
        ...result,
        senderName: userProfile.firstName,
        senderLastName: userProfile.lastName,
        shiftStartTime: shift.shiftStartHour,
        shiftEndTime: shift.shiftEndHour,
      };
      //Send event over webSocket
      const msgSent = this.eventsGateway.sendRequest(request);
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
          console.log(error.message, { error });
          // throw new ForbiddenException('cant update request status line 47');
        }
      }
      return result;
    } catch (error) {
      console.log({ error });
      // throw new ForbiddenException('error creating request', error.message);
    }
  }

  /** Get requrest Bt RquestId
   * @description
   * @param {number} requestId
   * @returns {*}
   * @memberof UserRequestService
   */
  async getRequest(requestId: number) {
    if (!requestId || requestId < 0) {
      throw new ForbiddenException('NO request to get ');
    }
    try {
      const result: userRequest = await this.prisma.userRequest.findUnique({
        where: {
          id: requestId,
        },
        include: {
          shift: true,
        },
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
        },
        include: {
          shift: true,
        },
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
          destinationUserId: userId,
        },
        include: {
          senderUserRef: {
            select: {
              userProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          acceptingUserRef: {
            select: {
              userProfile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          shift: true,
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
  async setStatus(requestDto: RequestDto) {
    if (requestDto && requestDto.id >= 0) {
      console.log('request ', { requestDto });
      try {
        const res = await this.prisma.userRequest.update({
          where: {
            id: requestDto.id,
          },
          data: {
            status: requestDto.status,
          },
        });
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
      throw new ForbiddenException(
        'No request or replaying user is unauthorized.',
        { cause: new Error('Some additional error details') },
      );
    }
  }
  async replayToRequest(request: userRequest) {
    console.log('replay to req', { request });
    if (!request.id && request.requestAnswer !== null) {
      throw new ForbiddenException(
        'No request or replaying user is unauthorized.',
        { cause: new Error('Some additional error details') },
      );
    }
    // try {
    const updatedReq: userRequest = await this.prisma.userRequest.update({
      where: {
        id: request.id,
      },
      data: {
        isAnswered: true,
        status: 'seen',
        requestAnswer: request.requestAnswer,
        requestAnswerMsg: request.requestAnswerMsg,
      },
    });
    console.log('replay', { updatedReq }, ' request new replay', {
      updatedReq,
    });
    if (!updatedReq) {
      console.log('not update');
      throw new ForbiddenException(
        'No request or replaying user is unauthorized.',
        { cause: new Error('Some additional error details') },
      );
    }
    console.log({ updatedReq });
    //emit update for sender switch sender-reciver
    const tmpReq: userRequest = request;
    tmpReq.destinationUserId = request.senderId;
    tmpReq.senderId = request.destinationUserId;

    const msgSent = this.eventsGateway.sendRequest(request);
    console.log(' is message sent ', msgSent);
    //if(request.requestAnswer === 'true'){
    //send request for manager approvel..
    //
    //}

    return updatedReq;

    // } catch (error) {
    //   console.log("no2")
    //   throw new ForbiddenException("No request or replaying user is unauthorized.", { cause: new Error("Some additional error details") });

    // }
  }
  // emitRequest(requestToSend:userRequest,user:user,shift:shift){
  //   //Will conver to requsetDto and emit the messege
  //   const request: RequestDto = {
  //     ...requestToSend,
  //     senderName: user.firstName,
  //     senderLastName: user.lastName,
  //     shiftStartTime: shift.shiftStartHour,
  //     shiftEndTime: shift.shiftEndHour,
  //   };
  //   const msgSent = this.eventsGateway.sendRequest(request);
  //   console.log(' is message sent ', msgSent);
  // }
}
