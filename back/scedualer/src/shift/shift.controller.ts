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
  Param,
} from '@nestjs/common';
import { userShift,systemShift, user } from '@prisma/client';

import { ShiftService } from './shift.services';
import { ShiftDto } from './dto';
import { EditShiftDto } from './dto/editShift.dto';
import { GetUser } from '../Decorator';
import { RoleGuard } from '../auth/role/role.guard';
import { Roles } from '../auth/roles/roles.decorator';

@UseGuards(JwtGuard, RoleGuard)
@Controller('shifts')
export class ShiftController {
  /**
   * Creates an instance of ShiftController.
   * @param {ShiftService} shiftService
   * @memberof ShiftController
   */
  constructor(private shiftService: ShiftService) {}

  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  @Post('createShift')
  createShift(@GetUser('id') userId: number, @Body() dto: ShiftDto) {
    /**
     * @description create new shift
     * @param {number} userId
     * @param {ShiftDto} dto
     * @returns {*}
     * @memberof ShiftController
     */
    console.log({ dto });
    return this.shiftService.creatShift(userId, dto,dto.shiftType);
  }

  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  @Post('editShift')
  editShift(@Body() dto: EditShiftDto) {
    return this.shiftService.editUserShift(dto);
  }

  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  @Get('getAllShifts')
  getAllShifts(@Body() userId: any,shiftType:"system"|"user") {
    return this.shiftService.getAllShiftsByUserId(userId.id,shiftType);
  }

  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  @Get('getshiftById')
  getShiftById(@Body() shift: userShift |systemShift| number,shiftType:'user'|'system') {
    if (typeof shift === 'number') {
      return this.shiftService.getShiftById(shift,shiftType);
    }
    return this.shiftService.getShiftById(shift.id,shiftType);
  }

  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  @Get('getshiftByScheduleId')
  getshiftByScheduleId(@Body() scheduleId: number) {
    return this.shiftService.getAllUserShiftsByScheduleId(scheduleId);
  }

  @HttpCode(HttpStatus.OK)
  @Post('deleteShiftById')
  deleteShiftById(@Body() shift: any) {
    return this.shiftService.deleteShiftById(shift.id,'system');
  }

  @Roles('user', 'admin')
  @HttpCode(HttpStatus.OK)
  @Get('nextShift')
  getNextShift(@GetUser('id') userId: number) {
    console.log({ userId });
    return this.shiftService.getNextSystemShift(userId);
  }

  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  @Post('replaceUser')
  replaceUser(@Body() shiftInfo) {
    console.log({ shiftInfo });
    return this.shiftService.replaceUser(shiftInfo);
  }
}
