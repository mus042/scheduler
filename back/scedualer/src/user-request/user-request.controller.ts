import { Body, Controller, ForbiddenException, Get, Param, Post, UseGuards } from '@nestjs/common';
import { UserRequestService } from './user-request.service';
import { Roles } from '../auth/roles/roles.decorator';
import { RoleGuard } from '../auth/role/role.guard';
import { JwtGuard } from '../auth/Guard';
import { RequestDto } from './dto/request.dto';
import { GetUser } from 'src/Decorator';
import { Role } from '@prisma/client';



// @UseGuards(JwtGuard,RoleGuard)
@Controller('user-request')
export class UserRequestController {
    constructor(
        private requestService : UserRequestService,
    ){}

//     @Roles('admin','user')
    @Get('reqest')
    getRequest(@Param() requestId:number)
    {
         return this.requestService.getRequest(requestId); 
    }
//     @Roles('admin','user')
    @Get('getallUserSentrequest')
    getallUserSentrequest(@Param() requestId:number)
    {
         return this.requestService.getallUserSentrequest(requestId); 
    }
//     @Roles('admin','user')
    @Get('getallUserRecivedrequest')
    getallUserRecivedrequest(@Param() requestId:number)
    {
         return this.requestService.getallUserRecivedrequest(requestId); 
    }
//     @Roles('admin','user')@GetUser('id') userId:number,|| userId === requestDto.senderId
    @Post('setRequest')
    setRequest(@Body() requestDto:any)
    {
        console.log('dto :  controler 41 ',{...requestDto}, typeof requestDto , requestDto.senderId)
        if(true ){
         return this.requestService.setRequest(requestDto); 
    }
    else{
        throw new ForbiddenException("Error in  id ");

    }
}
    @Roles('admin','user')
    @Post('editRequest')
    editRequest(@Body() requestDto:RequestDto)
    {
        
         return this.requestService.editRequest(requestDto); 
    }

    @Roles('admin','user')
    @Post('deleteRequest')
    deleteRequest(@GetUser('userRole') userRole:Role, @Body() requestId:number)
    {
    //To add premision to delete self / as admin    
         return this.requestService.deleteRequest(requestId); 
    
    }
    
}
