import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EditShiftByDateDto, ShiftDto } from './dto';
import { AuthDto } from '../auth/dto/';
import { ShiftUserStatistic, shcheduleType, shift, shiftType, user } from '@prisma/client';
import { EditShiftDto } from './dto/editShift.dto';
import { UsershiftStats } from 'src/user-statistics/userShiftStats.dto';

@Injectable()
export class ShiftService {
  constructor(private prisma: PrismaService) {}
  async creatShift(userId: number, dto: ShiftDto) {
    //create new shift

    try {
      // console.log({dto});
      const shift = await this.prisma.shift.create({
        data: {
          userId: userId,
          role:dto.userRef.userRole ,
          shiftName: dto.shiftName?dto.shiftName : dto.shiftType,
          userPreference: dto.userPreference,
          shiftDate: dto.shiftDate,
          shiftType: dto.shiftType,
          shifttStartHour: dto.shifttStartHour,
          shiftEndHour: dto.shiftEndHour,
          typeOfShift: dto.typeOfShift,
          scheduleId: dto.scheduleId,
        },
      });

      return shift;
    } catch (eror) {
      console.log(eror);
      throw new ForbiddenException('cant create shift', eror);
    }
  }

  async creatNoUserShift(dto: ShiftDto) {
    //try create new shift
    try {
      console.log({ ShiftDto });
      const shift = await this.prisma.shift.create({
        data: {
          userId: dto.userId,
          role:'',
          shiftName: dto.shiftName || dto.shiftType + "_"+dto.typeOfShift,
          userPreference: dto.userPreference,
          shiftDate: dto.shiftDate,
          shiftType: dto.shiftType,
          shifttStartHour: dto.shifttStartHour,
          shiftEndHour: dto.shiftEndHour,
          typeOfShift: dto.typeOfShift,
          scheduleId: dto.scheduleId,
        },
      });
      return shift;
    } catch (eror) {
      console.log(eror);
      throw new ForbiddenException('cant create shift', eror);
    }
  }


  async editShift(dto: EditShiftDto) {
    if (Number(dto.userPreference) > 3 || Number(dto.userPreference) < 0) {
      console.log('true');
      throw new ForbiddenException('userPref number is bigger then alowed');
    }
    try {
      console.log('edit shift ', { dto });
      const shift = await this.prisma.shift.update({
        where: {
          id: dto.shiftId,
        },
        data: {
          userPreference: dto.userPreference,
        },
      });
      // console.log({ shift }, 'shiftEdited');
      return { ...shift };
    } catch (eror) {
      console.log({ eror });
      if (eror.code === 'P2025') {
        throw new ForbiddenException('shift not fond ');
      }
      throw new ForbiddenException(eror);
    }
  }
  async replaceUser(shiftInfo){
    //update shift - Replace the user for existing shift, return new shift 
    try{
      console.log({shiftInfo},shiftInfo.shift.id)
      const formershfit = await this.prisma.shift.findUnique({
        where: { id: shiftInfo.shift.id },
        select: {
          userId: true,
        },
      });
      console.log({ formershfit});
      const originalUserId = formershfit?.userId;
      
      // Update the userId of the shift record
      const userId = shiftInfo.newUser;
      const shiftId = shiftInfo.shift.id;
      const updatedShift: shift = await this.prisma.shift.update({
        where: {
          id: shiftId,
        },
        data: {
          userId: userId,
        },
      });
      
      //get usersshifts Stats and update them 
      const originalUserShiftStats = await this.prisma.shiftUserStatistic.findUnique({where:{
        userId_scheduleId:{
          userId:originalUserId,
          scheduleId:shiftInfo.schedualId
        }
      }})
      //change count 
      if(shiftInfo.shiftType === 'morning') {
        originalUserShiftStats.morningShifts = originalUserShiftStats.morningShifts -1 
      } else if(shiftInfo.shiftType === 'noon'){
        originalUserShiftStats.noonShifts = originalUserShiftStats.noonShifts -1 ; 
      }else if(shiftInfo.shiftType ==='night'){
        originalUserShiftStats.nightShifts = originalUserShiftStats.nightShifts -1 ; 
      }
      const updateOriginalUserStat: UsershiftStats = {
        ...originalUserShiftStats
      }
      const newUserShiftStats = await this.prisma.shiftUserStatistic.findUnique({where:{
        userId_scheduleId:{
          userId:shiftInfo.newUser,
          scheduleId:shiftInfo.schedualId
        }
      }})
      //change count 
      if(shiftInfo.shiftType === 'morning') {
        originalUserShiftStats.morningShifts = originalUserShiftStats.morningShifts -1 
      } else if(shiftInfo.shiftType === 'noon'){
        originalUserShiftStats.noonShifts = originalUserShiftStats.noonShifts -1 ; 
      }else if(shiftInfo.shiftType ==='night'){
        originalUserShiftStats.nightShifts = originalUserShiftStats.nightShifts -1 ; 
      }
      const updateNewUserStat: UsershiftStats = {
        ...originalUserShiftStats
      }
      

      return updatedShift;
    }catch(error){
      console.log(error.message);
      return {};
    }
  }
  async getAllShiftsByUserId(userId: number) {
    if (userId) {
      const id: number = userId;
      try {
        const shifts = await this.prisma.shift.findMany({
          where: {
            userId: {
              equals: id,
            },
          },
        });
        console.log({ shifts });
        return shifts;
      } catch (eror) {
        console.log(eror);
      }
    }
  }
  async getAllShiftsByScheduleId(scheduleId: number) {
    //return shifts array of all the shifts under scheduleId
    const id: number = scheduleId;
    try {
      const shifts = await this.prisma.shift.findMany({
        where: {
          scheduleId: {
            equals: id,
          },
        },
        include: {
          userRef: true,
        },
      });
      // console.log({ shifts });
      shifts.forEach((element) => {
        delete element.userRef?.hash;
      });
      // console.log({ shifts }, typeof shifts);
      return shifts;
    } catch (eror) {
      console.log(eror);
    }
  }

  async getShiftById(shiftId: number) {
    //return shift by unique shiftId
    try {
      const shift: shift = await this.prisma.shift.findUnique({
        where: {
          id: shiftId,
        },
        include:{
          userRef:true,
        }
      });
      if (!shift) {
        throw new ForbiddenException('shift not fond ');
      }
      
      const userRef: user | any =shift.userId? await this.prisma.user.findUnique({
        where: {
          id: shift.userId,
        }
      }):{};
      userRef.id && delete userRef.hash;
       
      const shiftDto: ShiftDto = { ...shift, userRef };
      return shiftDto;
    } catch (eror) {
      console.log({ eror });
      if (eror.code === 'P2025') {
        throw new ForbiddenException('shift not fond ');
      }
      throw new ForbiddenException(eror);
    }
  }

  async deleteShiftById(shiftId: number) {
    try {
      const shift = await this.prisma.shift.delete({
        where: {
          id: shiftId,
        },
      });
      return 'shift delteted ';
    } catch (eror) {
      console.log({ eror });
      if (eror.code === 'P2025') {
        throw new ForbiddenException('shift not fond ');
      }
      throw new ForbiddenException(eror);
    }
  }
  async getShiftByDateScheduleId(dateofShift: Date, scheduleId: number) {
    //return a shift of scedualId and Date
    //To cheack if work
    // console.log({editShiftByDateDto});
    try {
      const shiftDate = new Date(dateofShift);
      // console.log({dateofShift,scheduleId})
      const shift = await this.prisma.shift.findFirst({
        //change to find uniqe
        where: {
          scheduleId: {
            equals: scheduleId,
          },
          shiftDate: {
            equals: shiftDate,
          },
        },
      });
      const userRef: user = await this.prisma.user.findUnique({
        where: {
          id: shift.userId,
        },
      });
      delete userRef.hash;
      const shiftDto: ShiftDto = { ...shift, userRef };
      return shiftDto;
    } catch (eror) {
      console.log({ eror });
      if (eror.code === 'P2025') {
        throw new ForbiddenException('shift not fond ');
      }
      throw new ForbiddenException(eror);
    }
  }
  async getUserShiftByDate(dateofShift: Date, userId: number) {
    //return a shift of scedualId and Date
    //To cheack if work
    // console.log({editShiftByDateDto});
    try {
      const shiftDate = new Date(dateofShift);
      // console.log({dateofShift,userId})
      const shift = await this.prisma.shift.findFirst({
        //change to find uniqe
        where: {
          userId: {
            equals: userId,
          },
          shiftDate: {
            equals: shiftDate,
          },
        },
      });

      return shift;
    } catch (eror) {
      console.log({ eror });
      if (eror.code === 'P2025') {
        throw new ForbiddenException('shift not fond ');
      }
      throw new ForbiddenException(eror);
    }
  }
  async getShiftByDateSchedType(shiftDate: Date, schedtype: shcheduleType) {
    try {
      const shift: shift = await this.prisma.shift.findFirst({
        where: {
          shifttStartHour: shiftDate,
          schedule: { sceduleType: schedtype },
        },
      });
      return shift;
    } catch (eror) {
      console.log(eror);
      return undefined;
    }
  }
  async updateShiftById(oldShift: shift | ShiftDto, newShift: shift | ShiftDto) {
    let updatedShift: shift = undefined;
    try {
      updatedShift = await this.prisma.shift.update({
        where: {
          id: oldShift.id,
        },
        data: {
          shiftDate: newShift.shiftDate,
          shifttStartHour: newShift.shifttStartHour,
          shiftEndHour: newShift.shiftEndHour,
          userId: newShift.userId,
          shiftType: newShift.shiftType,
        },
      });
      return updatedShift;
    } catch (eror) {
      throw new ForbiddenException(eror);
    }
  }
  async getNextShift(userId: number) {
    const currentDate = new Date();
    console.log({ currentDate });
    try {
      console.log('nextShift');
      const nextShift = await this.prisma.shift.findFirst({
        where: {
          shifttStartHour: {
            // Filter for shifts that have a startTime greater than the current date and time
            gt: currentDate,
          },
          userId: userId,
          schedule: {
            sceduleType: 'systemSchedule',
          },
        },
        orderBy: {
          shifttStartHour: 'asc',
        },
      });
      console.log(nextShift);
      if (nextShift) {
        const userRef: user = await this.prisma.user.findUnique({
          where: {
            id: nextShift.userId,
          },
        });
        delete userRef.hash;
        const shiftDto: ShiftDto = { ...nextShift, userRef };
        return shiftDto;
      }
    } catch (error) {
      console.error(error);
    }
  }
  async updateUserForShift(shiftId : number , newUserId: number){
    
  }
  classifyShiftTypeForStats(shiftStart : Date , shiftEnd:Date ){
    if(!shiftStart){
      throw new ForbiddenException("Date unexpcted");
    }
    
   else{
      if(shiftStart.getHours() >= 6 && shiftStart.getHours() <= 13 ){
        return "morning"
      }else if( shiftStart.getHours() >= 14 && shiftStart.getHours() <=21 && shiftEnd.getHours() <= 24  ){
        return "noon"
      }else {
        return "night"
      }
    }
  }
  getShiftTypeName(shift){
    //Return the shift type by shiftTypeId; 

  }
  async isShiftInRestDay(shift) {
    //This will accept a shift and call the schedule mold to chack if shift hours are within restDay 
    try {
      const restDay = await this.prisma.scheduleMold.findUnique({
        where: { selected: true },
        select: {
          restDayStartDay: true,
          restDayStartHour: true,
          restDayEndDay: true,
          restDayEndHour: true,
        },
      });
  
      if (!restDay) {
        throw new Error('Rest day information not found');
      }
  
  
      const res = (shift.shifttStartHour.getDay() === restDay.restDayStartDay &&
      shift.shifttStartHour.getHours > Number(restDay.restDayStartHour) ) ||
    (shift.shifttStartHour.getDay() === restDay.restDayEndDay &&
      shift.shifttStartHour.getHours() > Number(restDay.restDayEndHour))
  
      return res;
    } catch (error) {
      console.error('Error in isShiftInRestDay:', error);
      throw error;
    }

  }
  
}
