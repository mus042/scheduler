import { JwtGuard } from "../auth/Guard";
import { Controller, Get, Patch, Req,Post, UseGuards,Body, HttpCode, HttpStatus, ParseIntPipe, Param } from '@nestjs/common';
import { shift, user } from "@prisma/client";


import { ShiftService } from "./shift.services";
import { ShiftDto } from "./dto";
import { EditShiftDto } from "./dto/editShift.dto";
import { GetUser } from "../Decorator";
import { RoleGuard } from "../auth/role/role.guard";
import { Roles } from "../auth/roles/roles.decorator";



@UseGuards(JwtGuard, RoleGuard)
@Controller('shifts')
export class ShiftController{
    constructor(
        private shiftService:ShiftService
    ){}


    @Roles('user','admin')
    @HttpCode(HttpStatus.OK)
    @Post('createShift')//rout to create new shift
    createShift(@GetUser('id') userId:number,
                @Body() dto: ShiftDto  ){
        console.log({dto});
        return this.shiftService.creatShift(userId,dto);
    };

    @Roles('user','admin')
    @HttpCode(HttpStatus.OK)
    @Post('editShift')
    editShift(@Body() dto:EditShiftDto){
        return this.shiftService.editShift(dto);
    }

    
  @Roles('user','admin')
    @HttpCode(HttpStatus.OK)
    @Get('getAllShifts')
    getAllShifts(@Body() userId:any){
        return this.shiftService.getAllShiftsByUserId(userId.id);
    }


    @Roles('user','admin')
    @HttpCode(HttpStatus.OK)
    @Get('getshiftById')
    getShiftById(@Body() shift:shift|number){
        if(typeof shift === 'number'){
            return this.shiftService.getShiftById(shift);
        }
        return this.shiftService.getShiftById(shift.id);
    }
    
  @Roles('user','admin')
    @HttpCode(HttpStatus.OK)
    @Get('getshiftByScheduleId')
    getshiftByScheduleId(@Body() scheduleId:number){
        return this.shiftService.getAllShiftsByScheduleId(scheduleId);
    }

    @HttpCode(HttpStatus.OK)
    @Post('deleteShiftById')
    deleteShiftById(@Body() shift:any){
        return this.shiftService.deleteShiftById(shift.id);
    }

   
  @Roles('user','admin')
    @HttpCode(HttpStatus.OK)
    @Get('nextShift')
    getNextShift(@GetUser('id') userId: number){
        console.log({userId})
        return this.shiftService.getNextShift(userId);
    }

    @Roles('admin')
    @HttpCode(HttpStatus.OK)
    @Post('replaceUser')
    replaceUser(@Body() shiftInfo){
        console.log({shiftInfo})
        return this.shiftService.replaceUser(shiftInfo)
    }
}