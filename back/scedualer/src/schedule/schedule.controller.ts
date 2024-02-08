import { JwtGuard } from '../auth/Guard';
import {
  Controller,
  Get,
  Patch,
  Req,
  Post,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  ParseArrayPipe,
  Param,
  Delete,
  Query,
} from '@nestjs/common';

import { ScheduleService } from './schedule.service';
import { scheduleDto } from './dto';
import { GetUser } from '../Decorator';
import { EditShiftDto } from 'src/shift/dto/editShift.dto';
import { EditShiftByDateDto, bulkShiftsToEditDto } from '../shift/dto';
import { Type } from 'class-transformer';
import { Role, ScheduleMold, schedule, shift, user } from '@prisma/client';
import { generateScheduleForDateDto } from './dto/GenerateScheduleForDate.Dto';

import { UserService } from '../user/user.service';
import { RoleGuard } from '../auth/role/role.guard';
import { Roles } from '../auth/roles/roles.decorator';

@UseGuards(JwtGuard, RoleGuard)
@Controller('schedule')
export class SchedulerController {
  constructor(private ScheduleService: ScheduleService) {}

  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Post('setScheduleMold')
  setScheduleMold(
    @Body() scheduleMold,
    @GetUser('facilityId') facilityId: number,
  ) {
    console.log('mold', { scheduleMold });
    return this.ScheduleService.setScheduleMold(scheduleMold, facilityId);
  }
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Get('getSelctedScheduleMold')
  getSelctedScheduleMold(@Query('facilityId') facilityId) {
    console.log("facilityID",{facilityId});
    return this.ScheduleService.getSelctedScheduleMold(Number(facilityId));
  }

  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  @Get('getNextSchedule')
  getNextScheduleUser(@GetUser('id','facilityId') userId: number, facilityId: number) {
    console.log('next schedule for user call', { userId });
    return this.ScheduleService.getNextScheduleForUser(userId,facilityId);
  }

  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Get('getNextScheduleAsAdmin')
  getNextScheduleUserAsAdmin(@Param() userId: number,@GetUser('facilityId') facilityId: number) {
    console.log(userId);
    return this.ScheduleService.getNextScheduleForUser(userId,facilityId);
  }

  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  @Get('getNextSystemSchedule')
  getNextScheduleSystem(@GetUser('facilityId') facilityId: number) {
    console.log('next sys schde',{facilityId},"facilitId");
    return this.ScheduleService.getNextSystemSchedule(facilityId);
  }
  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  @Get('getCurrentSchedule')
  getCurrentSchedule() {
    return this.ScheduleService.getCurrentSchedule();
  }

  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  @Post('cnScheduleFU')
  cnScheduleFU(@GetUser('id','facilityId') userId: number ,facilityId: number, @Body() dto: scheduleDto) {
    console.log('schedual controler ');
    const startDate = new Date(dto.scedualStart);
    const endDate = new Date(dto.scedualStart.getDate() + 7);
    const schedDto: scheduleDto = {
      scedualStart: startDate,
      scedualEnd: endDate,
      scedualDue: dto.scedualDue,
      userId: userId,
      facilityId:facilityId
    };
    return this.ScheduleService.createSchedualeForUser(schedDto);
  }

  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  @Post('editeFuterSceduleForUser')
  editeFuterSceduleForUser(@Body() shiftsToEdit: bulkShiftsToEditDto) {
    console.log('controler ', { shiftsToEdit });
    const schedualId = shiftsToEdit.scheduleId;
    const shifts = shiftsToEdit.shiftsEdit;

    // console.log({ schedualId }, { shifts });
    return this.ScheduleService.editeFuterSceduleForUser(schedualId, shifts);
  }

  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Post('createSchedule')
  createSchedule(@Body() scheduleDto) {
    console.log("schecdcont ", { scheduleDto });
    return this.ScheduleService.createSystemSchedule(scheduleDto);
  }
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Delete('deleteSchedule/:scheduleId')
  deleteSchedule(@Param('scheduleId') scheduleId) {
    // Extract scheduleId from path
    console.log('schedule id in controller', scheduleId, typeof scheduleId);
    const idInt: number = parseInt(scheduleId, 10);
    return this.ScheduleService.deleteAllSchedules();
  }
  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  @Get('getReplaceForShift/:shiftId/:schedule')
  getReplaceForShift(
    @Param('shiftId') shiftId: string,
    @Param('schedule') schedule: string,
  ) {
    console.log('shift id controler', { shiftId });
    return this.ScheduleService.findReplaceForShift(
      parseInt(shiftId),
      parseInt(schedule),
    );
  }

  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Post('checkAdmin')
  checkAdmnin() {
    console.log('admin acsses ');
  }
}
