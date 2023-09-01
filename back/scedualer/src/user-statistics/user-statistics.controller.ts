import { Body, Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { UserStatisticsService } from './user-statistics.service';
import { Roles } from '../auth/roles/roles.decorator';
import { GetUser } from '../Decorator';
import { JwtGuard } from '../auth/Guard';
import { RoleGuard } from '../auth/role/role.guard';

@UseGuards(JwtGuard, RoleGuard)
@Controller('user-statistics')
export class UserStatisticsController {

    constructor(private UserStatisticsService:UserStatisticsService){}

    @Roles('admin')
    @Get('getScheduleStats')
    getScheduleStats(@Body() scheduleId:number)
    {   
         return this.UserStatisticsService.getSaisticsForScedule(scheduleId); 
    }
    @Roles('admin','user')
    @Get('getUserShiftStatsForSchedule')
    userShiftStatsForSchedule(@GetUser('id') userId:number,@Query('scheduleId') scheduleId: string)
    {   
     const scehdId:number = parseInt(scheduleId)
     console.log('user statistic for schedule',{userId},{scehdId})
         return this.UserStatisticsService.getStatisticsForUserSchedule(userId,scehdId); 
    }
    @Roles('admin','user')
    @Get('getAllUserShiftStats')
    allUserShiftStats(@GetUser('id') userId:number)
    {   
        console.log('get all user Shifts Stats ', {userId});
         return this.UserStatisticsService.getAllStatisticsForUser(userId); 
    }
}
