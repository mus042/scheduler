import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserRequestService } from './user-request.service';
import { Roles } from '../auth/roles/roles.decorator';
import { RoleGuard } from '../auth/role/role.guard';
import { JwtGuard } from '../auth/Guard';
import { RequestDto } from './dto/request.dto';
import { GetUser } from '../Decorator';
import { Role, serverRole, userRequest } from '@prisma/client';
import { EventsGateway } from '../events/events.gateway';
import { UserRole } from '../Decorator/userRole.decorator';

@UseGuards(JwtGuard, RoleGuard)
@Controller('user-request')
export class UserRequestController {
  constructor(
    private requestService: UserRequestService,
    private webSocket: EventsGateway,
  ) {}

  @Roles('admin', 'user')
  @Get('reqest')
  getRequest(@Param() requestId: number) {
    return this.requestService.getRequest(requestId);
  }
  @Roles('admin', 'user')
  @Get('getallUserSentrequest')
  getallUserSentrequest(@GetUser('id') userId: number) {
    return this.requestService.getallUserSentrequest(userId);
  }
  @Roles('admin', 'user')
  @Get('getallUserRecivedrequest')
  getallUserRecivedrequest(@GetUser('id') userId: number) {
    console.log({ userId });
    return this.requestService.getallUserRecivedrequest(userId);
  }
  // @Roles('admin','user')
  // @Get('getRequestDetails')
  // getRequestDetails( requestId:number, )
  // {
  //     console.log({requestId});
  //      return this.requestService.getRequestdetails(requestId);
  // }
  @Roles('admin', 'user')
  @Post('setRequest')
  setRequest(
    @GetUser('id') userId: number,
    @GetUser('userServerRole') userServerRole: serverRole,
    @Body() requestDto: RequestDto,
  ) {
    console.log(
      'dto :',
      { userServerRole },
      '  controler 41 ',
      { ...requestDto },
      typeof requestDto,
      requestDto.senderId,
    );
    if (userId === requestDto.senderId || userServerRole === 'admin') {
      const reqest = this.requestService.setRequest(requestDto);
      console.log({ reqest });
      // this.webSocket.sendRequest(reqest);
    } else {
      throw new ForbiddenException('Error in  id ');
    }
  }

  @Roles('admin', 'user')
  @Post('editRequest')
  editRequest(@Body() requestDto: RequestDto) {
    return this.requestService.editRequest(requestDto);
  }
  @Roles('admin', 'user')
  @Post('setStatus')
  setStatus(
    @Body() requestDto: any,
    @GetUser('id') userId: number,
    @GetUser('userRole') userRole: Role,
  ) {
    if (userId === requestDto.destionationUserId) {
      const shiftStartTime = new Date(requestDto.shiftStartTime);
      const shiftEndTime = new Date(requestDto.shiftEndTime);
      const req: RequestDto = {
        ...requestDto,
        shiftStartTime: shiftStartTime,
        shiftEndTime: shiftEndTime,
      };
      console.log({ req });
      return this.requestService.setStatus(req);
    } else {
      throw new ForbiddenException('error in setStatus ');
    }
  }
  @Roles('admin', 'user')
  @Post('deleteRequest')
  deleteRequest(
    @GetUser('userRole') userRole: Role,
    @Body() requestId: number,
  ) {
    //To add premision to delete self / as admin
    return this.requestService.deleteRequest(requestId);
  }
  @Roles('admin', 'user')
  @Post('replayToRquest')
  replayToRequest(
    @GetUser('userRole') userServerRole: serverRole,
    @GetUser('id') userId: number,
    @Body() request: userRequest,
  ) {
    //To add premision to delete self / as admin
    console.log({ request });
    if (
      (request.destinationUserId !== userId && userServerRole !== 'admin') ||
      request.isAnswered === true
    ) {
      console.log(
        'false userId dont match ',
        request.destinationUserId,
        { userId },
        { userServerRole },
      );
      return false;
    }
    return this.requestService.replayToRequest(request);
  }
}
