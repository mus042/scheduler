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
} from '@nestjs/common';

import { ScheduleService } from './schedule.service';
import { scheduleDto } from './dto';
import { GetUser } from '../Decorator';
import { EditShiftDto } from 'src/shift/dto/editShift.dto';
import { EditShiftByDateDto, bulkShiftsToEditDto } from '../shift/dto';
import { Type } from 'class-transformer';
import { Role, schedule, shift, typeOfUser, user } from '@prisma/client';
import { generateScheduleForDateDto } from './dto/GenerateScheduleForDate.Dto';

import { UserService } from '../user/user.service';
import { RoleGuard } from '../auth/role/role.guard';
import { Roles } from '../auth/roles/roles.decorator';

@UseGuards(JwtGuard, RoleGuard)
@Controller('schedule')
export class SchedulerController {
  constructor(private ScheduleService: ScheduleService) {}

  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  @Get('getNextSchedule')
  getNextScheduleUser(@GetUser('id') userId: number) {
    return this.ScheduleService.getNextScheduleForUser(userId);
  }

  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Get('getNextSchedule')
  getNextScheduleUserAsAdmin(@Param() userId: number) {
    console.log(userId);
    return this.ScheduleService.getNextScheduleForUser(userId);
  }

  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  @Get('getNextSystemSchedule')
  getNextScheduleSystem() {
    console.log('next sys schde');
    return this.ScheduleService.getNextSystemSchedule();
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
  cnScheduleFU(@GetUser('id') userId: number, @Body() dto: scheduleDto) {
    console.log('schedual controler ');
    const startDate = new Date(dto.scedualStart);
    const endDate = new Date(dto.scedualStart.getDate() + 7);
    const schedDto: scheduleDto = {
      scedualStart: startDate,
      scedualEnd: endDate,
      userId: userId,
    };
    return this.ScheduleService.createSchedualeForUser(schedDto);
  }

  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  @Post('editeFuterSceduleForUser')
  editeFuterSceduleForUser(@Body() shiftsToEdit: bulkShiftsToEditDto) {
    console.log('controler ',{shiftsToEdit})
    const schedualId = shiftsToEdit.scheduleId;
    const shifts = shiftsToEdit.shiftsEdit;

    // console.log({ schedualId }, { shifts });
    return this.ScheduleService.editeFuterSceduleForUser(schedualId, shifts);
  }

  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Post('createSchedule')
  createSchedule(@Body() scheduleDto: generateScheduleForDateDto) {
    console.log({ scheduleDto });
    return this.ScheduleService.createSchedule(scheduleDto);
  }

  @Roles('admin', 'user')
  @HttpCode(HttpStatus.OK)
  @Get('getReplaceForShift/:shiftId/:schedule')
  getReplaceForShift(
    @Param('shiftId') shiftId: string,
    @Param('schedule') schedule: string,
  ) {
    console.log(shiftId);
    return this.ScheduleService.findReplaceForShift(parseInt(shiftId),parseInt(schedule));
  }

  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Post('checkAdmin')
  checkAdmnin() {
    console.log('admin acsses ');
  }
}
