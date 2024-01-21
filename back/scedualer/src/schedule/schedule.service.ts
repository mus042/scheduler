import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import {
  shift,
  schedule,
  user,
  typeOfShift,
  ScheduleMold,
  ShiftMold,
  ScheduleTime,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  EditShiftByDateDto,
  ShiftDto,
  bulkShiftsToEditDto,
} from '../shift/dto';
import { scheduleDto } from './dto';
import { ShiftService } from '../shift/shift.services';

import { EditShiftDto } from '../shift/dto/editShift.dto';
import { empty } from '@prisma/client/runtime';
import { generateScheduleForDateDto } from './dto/GenerateScheduleForDate.Dto';
import { UserService } from '../user/user.service';
import { ScheduleUtil } from './schedule.utilsClass';
import { error } from 'console';
import { UserStatisticsService } from '../user-statistics/user-statistics.service';

const dayToSubmit: number = 6; // the day number in wich userSched is not editable
enum shcheduleType {
  userSchedule,
  systemSchedule,
}
type scedualeDate = {
  day: { value: string; label: string } | undefined;
  hours: number;
  minutes: number;
};
type shiftTemp = {
  id?: number;
  startHour: { hours: number; minutes: number } | string;
  endHour: { hours: number; minutes: number } | string;
  day?: { value: number; label: string } | number | undefined;
  name: string;
  scheduleId?: number;
  roles?: [{ name: string; quantity: number }] | undefined;
};
type schedualSettings = {
  id?: number;
  name?: string | undefined;
  description?: string | undefined;
  facilityId: number;
  start: scedualeDate;
  end: scedualeDate;
  shiftsTemplate: shiftTemp[];
  daysPerSchedule: number | undefined;
  restDay: { start: scedualeDate; end: scedualeDate };
};
type dayOptions = number | Date | { H: number; M: number; D: number } | string | undefined;

@Injectable()
export class ScheduleService {
  constructor(
    private prisma: PrismaService,
    private shiftSercvice: ShiftService,
    private userService: UserService,
    private scheduleUtil: ScheduleUtil,
    private shiftStats: UserStatisticsService,
  ) {}
  scheduleDue: number = 2; // to change later - get from schedule object
  
  /**
   * @description Get the next date by day number or date string 
   * @param {dayOptions} day
   * @returns {*}  
   * @memberof ScheduleService
   */
  getNextDayDate(day:dayOptions) {
    console.log({day})
   let dayToAdd;
   let currentDate = new Date();//hold the date with hours in case needed. 
   if(day === undefined){
    dayToAdd = 0;
   }
   else if(typeof day === 'string'){

    dayToAdd=Number(day);
    currentDate.setHours(0,0,0,0)
   }
   else if(typeof day === 'object' && 'D' in day) {
    dayToAdd = day.D;
  
    currentDate.setUTCHours(day.H,day.M,0,0);
    console.log(currentDate);
  }
  else if (day instanceof Date) {
    // If day is a Date object
    dayToAdd = day.getDay();
    currentDate.setHours(day.getUTCHours(),day.getUTCMinutes(),0,0)
    console.log(currentDate);
  }
  else{
    dayToAdd = day;
  }
    let adjusted;

    if (currentDate.getDay() >= 3) {
      // If it's Wednesday or later, add days to reach the Sunday after next
      const daysUntilNextSunday = 7 - currentDate.getDay();
      const daysToAdd = daysUntilNextSunday + dayToAdd;
      adjusted = new Date(
        currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000,
      ); console.log({ adjusted },adjusted.getDate());
    } else {
      // If it's Tuesday or earlier, add days to reach the next Sunday
      const daysUntilNextSunday = 7 - currentDate.getDay()+dayToAdd;
      adjusted = new Date(
        currentDate.getTime() + daysUntilNextSunday * 24 * 60 * 60 * 1000,
      );
    }
    console.log({ adjusted },adjusted.getDate());
    return adjusted;
  }
  isHourMinuteObject(value: any): value is { hours: number; minutes: number } {
    return (
      value &&
      typeof value === 'object' &&
      'hours' in value &&
      'minutes' in value
    );
  }
  /**
   * @description Create new scheduleTime Object.
   * @param {{day:any,houre:number,minutes:number,fieldRelation}} time
   * @memberof ScheduleService
   * @returns ScheduleTime
   */
  async createScheduleTime(start: any, end: any) {
    //check input is valid as time : d 1-30 , h 0-24,m:0-60

    try {
      //try creating the time object
      console.log({ start }, { end }, end.day);

      const data = {
        startDay: Number(start.day),
        startHour: Number(start.hours),
        startMinutes: Number(start.minutes),
        endDay: Number(end.day),
        endHour: Number(end.hours),
        endMinutes: Number(end.minutes),
      };
      console.log({ data });
      const res = this.prisma.scheduleTime.create({
        data: {
          ...data,
        },
      });
      return res;
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }
  async deleteScheduleTime(schedTimeId: number) {
    try {
      const res = this.prisma.scheduleTime.delete({
        where: {
          id: schedTimeId,
        },
      });
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }
  async setScheduleMold(schedSet: schedualSettings, facilityId: number) {
    //Save mold to DB . convert types to match.
    console.log({ schedSet });
    const tmpMold = {
      facilityId: facilityId,
      startDay: Number(schedSet.start.day.value),
      startHour: `${schedSet.start.hours}:${schedSet.start.minutes}`,
      endDay: Number(schedSet.end.day.value),
      endHour: `${schedSet.end.hours}:${schedSet.end.minutes}`,
      restDayStartDay: Number(schedSet.restDay.start.day.value),
      restDayStartHour: `${schedSet.restDay.start.hours}:${schedSet.restDay.start.minutes}`,
      restDayEndDay: Number(schedSet.restDay.end.day.value),
      restDayEndHour: `${schedSet.restDay.end.hours}:${schedSet.restDay.end.minutes}`,
      name: schedSet.name,
      daysPerSchedule: schedSet.daysPerSchedule,
      description: schedSet.description,
      selected: true,
    };
    let createRestDays = null;
    let createScheduleTime = null;
    try {
      const existingSelected = await this.getSelctedScheduleMold(
        schedSet.facilityId,
      );
      // If there's a selected entry, unselect it
      if (existingSelected) {
        await this.prisma.scheduleMold.update({
          where: {
            id: existingSelected.id,
          },
          data: {
            selected: false,
          },
        });
      }
      console.log({ tmpMold });

      createRestDays = await this.createScheduleTime(
        {
          day: schedSet.restDay.start.day.value,
          hours: schedSet.restDay.start.hours,
          minutes: schedSet.restDay.start.minutes,
        },
        {
          day: schedSet.restDay.end.day.value,
          hours: schedSet.restDay.end.hours,
          minutes: schedSet.restDay.end.minutes,
        },
      );

      createScheduleTime = await this.createScheduleTime(
        {
          day: schedSet.start.day.value,
          hours: schedSet.start.hours,
          minutes: schedSet.start.minutes,
        },
        {
          day: schedSet.end.day.value,
          hours: schedSet.end.hours,
          minutes: schedSet.end.minutes,
        },
      );

      const createData: any = {
        name: schedSet.name,
        facilityId: facilityId,
        daysPerSchedule: schedSet.daysPerSchedule,
        description: schedSet.description,
        selected: true,
        scheduleTimeId: createScheduleTime.id,
        restDaysId: createRestDays.id,
      };
      console.log({ createData });
      const res = await this.prisma.scheduleMold.create({
        data: createData,
      });

      if (res) {
        // Create ShiftMolds and associated Ranks/UserPreferences
        for (const shift of schedSet.shiftsTemplate) {
          const startHourStr = this.isHourMinuteObject(shift.startHour)
            ? shift.startHour.hours.toString()
            : String(shift.startHour);
          const endHourStr = this.isHourMinuteObject(shift.endHour)
            ? String(shift.endHour.hours)
            : String(shift.startHour);

          // Create ShiftMold
          const shiftMold = await this.prisma.shiftMold.create({
            data: {
              name: shift.name,
              startHour: startHourStr,
              endHour: endHourStr,
              day: typeof shift.day === 'number' ? shift.day : shift.day.value,
              scheduleId: res.id,
            },
          });
          console.log(shift.roles);
          // Assuming 'shift.roles' is an array of role names
          for (const role of shift.roles) {
            let rank = await this.prisma.role.findUnique({
              where: { name: role.name },
            });
            console.log({ rank });
            if (!rank) {
              rank = await this.prisma.role.create({
                data: { name: role.name },
              });
            }

            await this.prisma.userPreference.create({
              data: {
                shiftMoldId: shiftMold.id,
                roleId: rank.id,
                userCount: role.quantity,
              },
            });
          }
        }

        console.log('Shifts and preferences created');
        return true;
      } else {
      }
    } catch (error) {
      console.log({ error });
      if (createRestDays.id) {
        await this.deleteSchedule(createRestDays.Id);
      }
      if (createScheduleTime.id) {
        await this.deleteSchedule(createScheduleTime.id);
      }

      throw new HttpException('Error in creating new mold', 400, {
        cause: new Error('Some Error'),
      });
    }
  }
  async getSelctedScheduleMold(facilityId: number) {
    console.log('selcted mold', { facilityId });
    try {
      // Check if there's already a selected entry
      const res = await this.prisma.scheduleMold.findFirst({
        where: {
          facilityId: facilityId,
          selected: true,
        },include:{
          scheduleTime:true,
          shiftsTemplate:{
            include:{
              userPrefs:{
                include:{
                  role:{select:{name:true},
                  }
                }
              }

            }
          },
          
        }
      });
 console.log({res})
      if (res) return res;
      else return false;
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }

  async getNextScheduleForUser(userId: number) {
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);
    // currentDate.setHours(5, 0, 0);
    let adjusted;

    if (currentDate.getDay() >= 3) {
      // If it's Wednesday or later, add days to reach the Sunday after next
      const daysUntilNextSunday = 7 - currentDate.getDay();
      const daysToAdd = daysUntilNextSunday + 7; // Additional 7 days to get to the Sunday after next
      adjusted = new Date(
        currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000,
      );
    } else {
      // If it's Tuesday or earlier, add days to reach the next Sunday
      const daysUntilNextSunday = 7 - currentDate.getDay();
      adjusted = new Date(
        currentDate.getTime() + daysUntilNextSunday * 24 * 60 * 60 * 1000,
      );
    }

    console.log({ adjusted }, 'Day: ' + currentDate.getDay());
    try {
      //find in db
      console.log('find nextScheudle', { adjusted });
      const scheduleArr: schedule[] = await this.prisma.schedule.findMany({
        where: {
          scheduleStart: {
            gte: adjusted,
          },
          userId: userId,
        },
        orderBy: {
          scheduleStart: 'asc',
        },
      });
      console.log('found schedule in db', scheduleArr[0]);
      const nextSchedule: schedule = scheduleArr[0];
      console.log({ nextSchedule });
      if (nextSchedule === null || !nextSchedule) {
        //Case no next schedule yet, create one.
        const startDate = new Date(adjusted.getTime());
        // startDate.setHours();
        const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        // endDate.setHours(9, 0, 0, 0);
        // console.log({ userId });
        const scedualDue: Date = new Date(startDate.getTime() - 4);
        const dto: scheduleDto = {
          scedualStart: startDate,
          scedualEnd: endDate,
          scedualDue: scedualDue,
          userId: userId,
        };
        // console.log({ dto });
        const newSchedule: any = await this.createSchedualeForUser(dto);
        // console.log(nextSchedule);
        const nextSchedule: schedule = { ...newSchedule?.newSchedule };
        const scheduleShifts: ShiftDto[] = [...newSchedule?.scheduleShifts];
        console.log('next schedule 82 sched servic ', { nextSchedule });
        const tmpSchedule = {
          data: { ...nextSchedule },
          shifts: [...scheduleShifts],
        };
        return tmpSchedule;
      } else {
        const scheduleShifts =
          await this.shiftSercvice.getAllShiftsByScheduleId(nextSchedule.id);
        const tmpSchedule = {
          data: { ...nextSchedule },
          shifts: [...scheduleShifts],
        };
        return tmpSchedule;
      }
    } catch (error) {
      console.log(error);
    }
  }
  async getNextSystemSchedule() {
    const currentDate = new Date();
    console.log('next sys schedule ', { currentDate });

    try {
      console.log('next sys schedule ');
      const scheduleArr: schedule[] = await this.prisma.schedule.findMany({
        where: {
          scheduleStart: {
            gt: currentDate,
          },
          scheduleType: 'systemSchedule',
        },
        orderBy: {
          scheduleStart: 'asc',
        },
      });
      console.log(scheduleArr);

      if (scheduleArr) {
        const nextSchedule: schedule = scheduleArr[0];
        if (nextSchedule) {
          const scheduleShifts: any =
            await this.shiftSercvice.getAllShiftsByScheduleId(nextSchedule.id);
          const tmpSchedule = {
            data: { ...nextSchedule },
            shifts: [...scheduleShifts],
          };
          return tmpSchedule;
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  async getCurrentSchedule() {
    const currentDate = new Date();
    try {
      console.log('get current schedule ', currentDate);
      const currentSchedule = await this.prisma.schedule.findFirst({
        where: {
          scheduleStart: {
            // Filter for shifts that have a startTime greater than the current date and time
            lte: currentDate,
          },

          scheduleType: 'systemSchedule',
        },
        orderBy: {
          scheduleStart: 'asc',
        },
      });
      console.log(currentSchedule?.scheduleStart);
      const currentScheduleShifts: ShiftDto[] = currentSchedule
        ? await this.shiftSercvice.getAllShiftsByScheduleId(currentSchedule.id)
        : null;
      if (currentSchedule !== null) {
        console.log(
          'cuurent schedule , 151 schd service ',
          { currentSchedule },
          currentScheduleShifts[0].userRef,
        );
        const currentScheduleData = {
          data: { ...currentSchedule },
          shifts: [...currentScheduleShifts],
        };

        return currentScheduleData;
      }
    } catch (error) {
      console.log({ error });
    }
  }
  
  async createSchedualeForUser(scheduleDto: scheduleDto) {
    const scheduleShifts: ShiftDto[] = [];
    const scheduleDue: Date = new Date(scheduleDto.scedualStart.getTime());
    console.log('Schedule start', scheduleDto.scedualStart);
    //Will create new schedule and create new shifts
    const userId = scheduleDto.userId ? scheduleDto.userId : 0;
    //get schedule and shift mold
    const schedulMold: any = await this.prisma.scheduleMold.findFirst({
      where: {
        selected: true,
      },
      include: {
        shiftsTemplate: true,
        scheduleTime: true,
        restDays: true,
      },
    });
    console.log('create sched for user , mold:', { schedulMold });
    if (!schedulMold) {
      throw new Error('Schedule Mold not found');
    }
    const schedExist: schedule = await this.prisma.schedule.findFirst({
      where: {
        userId: userId,
        scheduleStart: scheduleDto.scedualStart,
      },
    });
    if (userId === 0 || schedExist) {
      console.log(
        'Create sched for user 188 , userId or Sched exist',
        { userId },
        { schedExist },
      );
      //  if(schedExist) return schedExist;
      throw new ForbiddenException('error');
    }
    console.log({ schedulMold }, schedulMold.scheduleTime);
    const startDate: Date = this.getNextDayDate(
      schedulMold.scheduleTime.startDay,
    );
    console.log({ startDate });
    startDate.setUTCHours(
      Number(schedulMold.scheduleTime.startHour),
      Number(schedulMold.scheduleTime.startHour),
      0,
      0,
    );
    const endDate: Date = new Date(
      this.getNextDayDate(schedulMold.scheduleTime.endDay).getTime() +
        schedulMold.daysPerSchedule * 24 * 60 * 60 * 1000,
    );
    endDate.setUTCHours(
      Number(schedulMold.scheduleTime.endHour),
      Number(schedulMold.scheduleTime.endHour),
      0,
      0,
    );
    const newSchedule: schedule = await this.prisma.schedule.create({
      data: {
        userId: userId,
        scheduleStart: startDate,
        scheduleEnd: endDate,
        scheduleType: 'userSchedule',
        scheduleDue: scheduleDue,
      },
    });
    const type = 'userSchedule';
    const shiftsArr: ShiftDto[] = this.scheduleUtil.generateNewScheduleShifts(
      newSchedule.scheduleStart,
      newSchedule.scheduleEnd,
      newSchedule.id,
      schedulMold,
      type,
    );
    // console.log({shiftsArr});

    for (let i = 0; i < shiftsArr.length; i++) {
      const shift = await this.shiftSercvice.creatShift(
        scheduleDto.userId,
        shiftsArr[i],
      );
      if (shift) {
        const userRef: user = await this.prisma.user.findUnique({
          where: {
            id: shift.userId,
          },
        });
        delete userRef.hash;
        // console.log({shift})
        scheduleShifts.push({ ...shift, userRef: { ...userRef } });
      }
    }
    return { newSchedule, scheduleShifts }; //change here of something with createSchedule do no work
  }
  generateEmptySchedulObject(startingDate: Date, schedualId: number) {
    const scedualLength: number = 7;
    const emptyScheduleShifts: ShiftDto[] = [];
    const esId = schedualId;
    const esStartDate = new Date(startingDate);
    const timeZoneCorrection = esStartDate.getHours();
    esStartDate.setHours(timeZoneCorrection);

    for (let i = 0; i < scedualLength; i++) {
      for (let j = 0; j < 3; j++) {
        const esEndTime = new Date(esStartDate); // Create a new Date object for the end time
        esEndTime.setHours(esStartDate.getHours() + 8);
        const sType = j === 0 ? 'morning' : j === 1 ? 'noon' : 'night';
        const dto: ShiftDto = {
          userPreference: '0',
          shiftType: 'systemSchedule',
          shiftTimeName: sType,
          typeOfShift: 'short',
          shiftStartHour: esStartDate,
          shiftEndHour: esEndTime,
          scheduleId: esId,
          
        };
        esStartDate.setHours(esStartDate.getHours() + 8);
        emptyScheduleShifts.push(dto);
      }
    }

    // console.log({ emptyScheduleShifts });
    return emptyScheduleShifts;
  }

  async getScheduleIdByDateAnduserId(userId: number, startDate: Date) {
    const dateIso = new Date(startDate);
    console.log({ startDate });
    try {
      const schedule: schedule = await this.prisma.schedule.findFirst({
        //change to find uniqe
        where: {
          AND: [{ scheduleStart: dateIso }, { userId: userId }],
        },
      });

      // console.log(userId , {schedule});
      return schedule;
    } catch (eror) {
      console.log({ eror });
      if (eror.code === 'P2025') {
        throw new ForbiddenException('shift not fond ');
      }
      throw new ForbiddenException(eror);
    }
  }

  //This will get a ScheduleId and shiftsEditDto array and update the schedule shifts.
  async editeFuterSceduleForUser(
    scheduleId: number,
    shiftsToEdit: EditShiftByDateDto[],
  ) {
    console.log({ shiftsToEdit });
    try {
      const schedule = await this.prisma.schedule.findUnique({
        where: {
          id: scheduleId,
        },
      });

      const editedShifts: shift[] = [];
      const existingShifts: shift[] =
        await this.shiftSercvice.getAllShiftsByScheduleId(scheduleId);
      //contain user changes
      console.log(
        'edit shift',
        { shiftsToEdit },
        { existingShifts },
        scheduleId,
        shiftsToEdit[0],
      );

      existingShifts.forEach((shift: shift) => {
        const shiftTime = new Date(shift.shiftStartHour);
        console.log({ shiftTime });
        // shiftTime.setUTCHours(shiftTime.getHours());
        const shiftId = shift.id;

        shiftsToEdit.forEach(async (editInfo: EditShiftByDateDto) => {
          const userPref: string = editInfo.userPreference;
          console.log(
            { editInfo },
            shiftTime.getTime(),
            shift.shiftStartHour.getTime(),
            shiftTime.getDate(),
            shift.shiftStartHour.getDate(),
            shiftTime.getHours(),
            shift.shiftStartHour.getHours(),
          );
          if (
            shiftTime.getDate() === shift.shiftStartHour.getDate() &&
            shiftTime.getHours() === shift.shiftStartHour.getHours()
          ) {
            console.log({ shift });
            const editShiftDto: EditShiftDto = {
              shiftId: shiftId,
              userPreference: userPref,
            };
            // console.log({ editShiftDto });

            const edited: shift = await this.shiftSercvice.editShift(
              editShiftDto,
            );
            // console.log('edited shift scheduleService 208', { edited });
            editedShifts.push({ ...edited });
          }
        });
      });
      // console.log({ editedShifts });
      return [...editedShifts];
    } catch (error) {
      console.log({ error });
      throw new ForbiddenException(error.message);
    }
  }


  
  /**
   * @description All users if provided that added prefernce to thier schedule shifts. 
   * @param {Date} startingDate
   * @param {(user[]| undefined)} selctedUsers
   * @returns {*}  
   * @memberof ScheduleService
   */
  async getAllUsersForSchedule(startingDate: Date, selectedUsers:user[] |  undefined) {
  
    //for each user get schedule and save it in schedules arr
    const schedules: shift[][] = [];
    const allUsers: user[] = await this.userService.getAllUsers();

    let filteredUsers: user[];
    if (selectedUsers && selectedUsers.length > 0) {
      filteredUsers = allUsers.filter(user => 
        selectedUsers.some(selectedUser => selectedUser.id === user.id)
      );
    } else {
      filteredUsers = allUsers;
    }
   //iterate throw users ,  check if prefernce submited
    for (const user of filteredUsers) {
      const schedule: schedule = await this.getScheduleIdByDateAnduserId(
        user.id,
        startingDate,
      );
      console.log({ schedule });
      const shiftsForSchedule: shift[] =
        await this.shiftSercvice.getAllShiftsByScheduleId(schedule?.id);
      // filter empty shifts
      const filterdShifts: shift[] = shiftsForSchedule.filter(
        (item: shift) => item.userPreference === '0',
      );
      console.log('shift service 226', { filterdShifts });
      if (filterdShifts.length === 0) {
        console.log('shift service 227', { filterdShifts });
        schedules.push(filterdShifts);
      }
    }
    // console.log({schedules});
    return schedules;
  }
  async getUsersForSchedule(users: user[], startingDate: Date) {
    //for each user get schedule and save it in schedules arr
    const schedules: shift[][] = [];
    console.log({ users }, startingDate);
    for (const user of users) {
      const schedule: schedule = await this.getScheduleIdByDateAnduserId(
        user.id,
        startingDate,
      );
      console.log(schedule !== null && schedule !== undefined, { schedule });
      if (schedule !== null && schedule !== undefined) {
        console.log({ schedule });
        const shiftsForSchedule: shift[] =
          await this.shiftSercvice.getAllShiftsByScheduleId(schedule?.id);
        console.log('shfit service 356 ', schedule);
        // filter empty shifts
        const filterdShifts: shift[] = shiftsForSchedule.filter(
          (item: shift) => item.userPreference !== '0',
        );
        // console.log('shift service 360', { filterdShifts });
        if (filterdShifts !== null) {
          // console.log('shift service 362', { filterdShifts });
          schedules.push(filterdShifts);
        }
      }
    }
    // console.log({schedules});
    return schedules;
  }
  async getScheduleById(schedualId: number) {
    try {
      return await this.prisma.schedule.findUnique({
        where: {
          id: schedualId,
        },
        include: {
          shifts: true,
        },
      });
    } catch (eror) {
      throw new ForbiddenException(' there is no record to return ', eror);
    }
  }
  async replaceShifts(shift1: shift | number, shift2: shift | number) {
    let shift1obj: ShiftDto;
    let shift2obj: ShiftDto;

    if (typeof shift1 === 'number') {
      shift1obj = await this.shiftSercvice.getShiftById(shift1);
    } else {
      shift1obj = { ...shift1 };
    }
    if (typeof shift2 === 'number') {
      shift2obj = await this.shiftSercvice.getShiftById(shift2);
    } else {
      shift2obj = { ...shift2 };
    }
    if (shift1obj.scheduleId === shift2obj.scheduleId) {
      // get schedule
      const schedule: schedule = await this.getScheduleById(
        shift1obj.scheduleId,
      );
      // const scheduleShifts: shift[] = schedule.shifts;
      if (this.scheduleUtil.isShiftpossible(shift1obj, schedule)) {
        //update new shift
        const newShift: shift = await this.shiftSercvice.updateShiftById(
          shift1obj,
          shift2obj,
        );
        return newShift;
      }
    }
    return undefined;
  }

  async findReplaceForShift(shiftId: number, scheduleIdToCheck: number) {
    console.log({ shiftId });
    if (shiftId) {
      console.log({ shiftId });
      const shiftToReplace = await this.shiftSercvice.getShiftById(shiftId);
      if (shiftToReplace && scheduleIdToCheck) {
        const currentUser: user = { ...shiftToReplace.userRef };
        try {
          const scheduleToCheck: schedule = await this.getScheduleById(
            scheduleIdToCheck,
          );
          const schedShifts = await this.getAllUsersForSchedule(
            scheduleToCheck.scheduleStart,
            undefined,
          );
          if (scheduleToCheck.scheduleType !== 'systemSchedule') {
            throw new ForbiddenException(
              'Replace alowd only on system schedule',
            );
          }
          const avialbleUsersForShift: ShiftDto[] =
            this.scheduleUtil.searchPossibleUsersForShift(
              shiftToReplace.shiftStartHour,
              schedShifts,
            );
          console.log('419:', avialbleUsersForShift);
          const filtered = avialbleUsersForShift.filter(
            (shiftToFilter, index, shiftsArray) => {
              const isUnique =
                shiftsArray.findIndex(
                  (shift) => shift.userId === shiftToFilter.userId,
                ) === index;

              // Check if the shift is not repeated and satisfies the isShiftpossible condition
              return (
                isUnique &&
                this.scheduleUtil.isShiftpossible(
                  shiftToFilter,
                  scheduleToCheck,
                ) &&
                shiftToFilter.userId !== shiftToReplace.userId
              );
            },
          );

          console.log({ filtered });
          return filtered;
        } catch (error) {
          console.log({ error });
        }
      }
    }
  }

convertShiftMoldToShift(shiftMold,schedualId:number | undefined){
  const startDate:Date = this.getNextDayDate({D:Number(shiftMold.day),H:Number(shiftMold.startHour),M:0});

  console.log({startDate})
  const endDate:Date =  this.getNextDayDate({D:Number(shiftMold.day),H:Number(shiftMold.endHour),M:0});

   console.log({endDate} , shiftMold.userPrefs)
  const dto:any = {
    userPreference: '0',
    shiftType: 'systemSchedule',
    shiftTimeName: shiftMold.name,
    typeOfShift: shiftMold.endHour - shiftMold.startHour >10 ?"long" : "short",//TOFIX -- dynemic by hours 
    shiftStartHour: startDate,
    shiftEndHour: endDate,
    assignedShiftRoles:shiftMold.userPrefs

   

  }; 
  dto['scheduleId'] = schedualId || dto['scheduleId'];

  return dto;
}
  /**
   * @description Create a new shifts arr acurding to mold. 
   * @param {Date} startDate
   * @param {number} scheduleId
   * @param {any[]} shiftsMold
   * @returns {*}  shifts 
   * @memberof ScheduleService
   */
  genrateEmptySysSchedShifts(startDate:Date,scheduleId:number,shiftsMold:any[]){
    let shifts:ShiftDto[] = [];
    for(const shiftMold of shiftsMold){
      console.log({shiftMold});
      //create shift for each mold shift/ 
      const tmpShift:ShiftDto = this.convertShiftMoldToShift(shiftMold,scheduleId);//dates set to next date 
      console.log({tmpShift});
       shifts.push(tmpShift);
    }
    return shifts;

  }

async createEmptySchedule (startDate:Date,endDate:Date,) {
 try {
  const newSchedule  = await this.prisma.schedule.create({
    data:{
      scheduleStart: startDate,
        scheduleEnd: endDate,
        scheduleType: 'systemSchedule',
    }
   })
   return newSchedule;
 } catch (error) {
    throw new ForbiddenException(error);
 }
 
}
  /**
   * @description Will Assing users accurding to the needed role, 
   * @param {shift[]} emptyShifts
   * @param {shifts[][]} userScheduel
   * @memberof ScheduleService
   */
  assigningUsersToShifts(emptyShifts:any[] , userScheduel:shift[][])
  {
    const noUserShifts :shift[]= [];
    const assignedShifts:any[] = [];
      console.log("713 sched service assing users to shifts",{emptyShifts});
      //loop over the empty shifts and create shift Roles arr 
      const userShiftRoleArr:any[] = [];
      console.log({emptyShifts})
      for(const shiftToAssign of emptyShifts){
        for(const userPref of shiftToAssign.assignedShiftRoles){
            console.log({userPref});
            const possibleForShift = userScheduel.filter((userShift)=>{
              console.log({userShift})
              return( 
                userShift.userRef.roleId === userPref.roleId &&
                userShift.userPreference !== '3' && this.scheduleUtil.isShiftpossible(emptyShifts,shiftToAssign)
              )
            })
        }
      }

  }

/**
 * @description Create the a system schedule for the date provided. 
 * @param {generateScheduleForDateDto} dto
 * @memberof ScheduleService
 */
async createSystemSchedule(dto:generateScheduleForDateDto){

  console.log("Create sys schedule service 903",dto)
  //Get current mold 
  const currentMold = await this.getSelctedScheduleMold(dto.facilityId);
  
  if(currentMold === false){
    throw new ForbiddenException("907 sched service currentmold ")
  }
  //Normalize the dates .
  const normelizedStartDate = this.getNextDayDate({D:currentMold.scheduleTime.startDay,H:currentMold.scheduleTime.startHour,M: currentMold.scheduleTime.startMinutes});
  const normelizedendDate =this.getNextDayDate({D:currentMold.scheduleTime.endDay,H:currentMold.scheduleTime.endHour,M: currentMold.scheduleTime.endMinutes});
  console.log({normelizedStartDate},{currentMold},currentMold.scheduleTime,currentMold.daysPerSchedule,currentMold.shiftsTemplate);

  //Get all avileble users schedules from users list if it exist, else all users. 
  const avilebleUserShifts = await this.getAllUsersForSchedule(dto.scedualStart,dto.usersIdList);
  //  console.log({avilebleUserShifts});
   if(!avilebleUserShifts){
    throw new ForbiddenException("907 sched service currentmold ")
  }
   //Generate schedule to have schdule id for next steps. 
   const newSchedule = await this.createEmptySchedule(normelizedStartDate,normelizedendDate);
   if(!newSchedule ){
    throw new ForbiddenException("907 sched service currentmold ")
  }
  //Generate empty shift object from mold, include empty roles 
  const emptyShifts :ShiftDto[] = this.genrateEmptySysSchedShifts(normelizedStartDate,newSchedule.id,currentMold.shiftsTemplate);
  console.log({emptyShifts})
  //Assing users 
    const assingedSchedule = this.assigningUsersToShifts(emptyShifts,avilebleUserShifts);




  //return the schedule , userStats for schedule 



}




  //Create new object for new  schedule
  async createSchedule(dto: any) {
    //get schedule and shift mold

    const schedulMold: any = await this.prisma.scheduleMold.findFirst({
      where: {
        selected: true,
      },
      include: {
        shiftsTemplate: {
          include: {
            userPrefs: true,
          },
        },
        restDays: true,
        scheduleTime: true,
      },
    });

    if (!schedulMold) {
      throw new Error('Schedule Mold not found');
    }
    console.log('create schedule ', { dto }, { schedulMold });
    const startingDate: Date = this.getNextDayDate(
      schedulMold.scheduleTime.startDay,
    );
    console.log('832', { startingDate });
    startingDate.setUTCHours(
      Number(schedulMold.scheduleTime.startHour),
      Number(schedulMold.scheduleTime.startHour),
      Number(schedulMold.scheduleTime.startMinutes),
      0,
    );

    console.log('840', { startingDate });
    const endindgDate: Date = new Date(
      this.getNextDayDate(schedulMold.endDay) +
        schedulMold.daysPerSchedule * 24 * 60 * 60 * 1000,
    );
    endindgDate.setUTCHours(
      Number(schedulMold.scheduleTime.endHour),
      Number(schedulMold.scheduleTime.endHour),

      Number(schedulMold.scheduleTime.endMinutes),
      0,
    );

    console.log('create schedule ', { startingDate }, { schedulMold });
    const availableUsers: user[] = await this.prisma.user.findMany({
      where: {
        schedules: {
          some: {
            scheduleType: 'userSchedule',
            scheduleStart: {
              equals: startingDate,
            },
          },
        },
      },
    });
    console.log({ availableUsers });
   
    // console.log({ users });

    console.log('create schedule ', { startingDate });
    const start: Date = new Date(startingDate);
    start.setHours(start.getHours());
    const end: Date = new Date(start.getDate() + schedulMold.daysPerSchedule);
    const useresSchedules: shift[][] = await this.getUsersForSchedule(
      availableUsers,
      startingDate,
    );
    console.log('451 schedule service - useres schedules with prefernces ');
    const minimunUsersForSchedule = 3;
    if (useresSchedules.length < minimunUsersForSchedule) {
      //minimun users for schedule
      console.log('879 user service  forbbiden error ', useresSchedules.length);
      throw new ForbiddenException('insufficenst users for scheudle ');
    }
    const createdSchedule: schedule = await this.prisma.schedule.create({
      data: {
        scheduleStart: startingDate,
        scheduleEnd: endindgDate,
        scheduleType: 'systemSchedule',
      },
    });
    const type = 'systemSchedule';
    const scheduleId: number = createdSchedule.id;
    const newSchedule: ShiftDto[] = this.scheduleUtil.generateNewScheduleShifts(
      startingDate,
      endindgDate,
      scheduleId,
      schedulMold,
      type,
    );

    const ceratedSched: shift[] = [];
    let leastOptions;
    try {
      leastOptions = this.scheduleUtil.fillMinUserShifts(
        newSchedule,
        useresSchedules,
      );
      // console.log({leastOptions});
    } catch (eror) {
      leastOptions = newSchedule;
      //  console.log({leastOptions})
    }

    const firstFill: any = await this.scheduleUtil.fillSchedule(
      leastOptions,
      useresSchedules,
    );
    console.log(firstFill['scheduleToFill']);
    const secondFill: object = await this.scheduleUtil.fillSchedule(
      firstFill['scheduleToFill'],
      useresSchedules,
    );
    const filled2Sched: ShiftDto[] = secondFill['scheduleToFill'];

    //  console.log({filled2Sched});
    for (let i = 0; i < filled2Sched.length; i++) {
      // console.log({filled2Sched})
      // if (filled2Sched[i].userId > 0) {
      const shiftDto: ShiftDto = {
        userPreference: filled2Sched[i].userPreference,
        // shiftDate: filled2Sched[i].shiftDate,
        shiftType: filled2Sched[i].shiftType,
        shiftStartHour: filled2Sched[i].shiftStartHour,
        shiftEndHour: filled2Sched[i].shiftEndHour,
        typeOfShift: filled2Sched[i].typeOfShift
          ? filled2Sched[i].typeOfShift
          : typeOfShift.short,
        scheduleId: scheduleId,
      };
      const userid: number = filled2Sched[i].userId
        ? filled2Sched[i].userId
        : undefined;
      const shift: shift = await this.shiftSercvice.creatShift(
        userid,
        shiftDto,
      );
      // console.log({shift})
      ceratedSched.push(shift);
      // }
    }
    const emptyShifts = secondFill['emptyShifts'];
    console.log('unassigned Shifts:', secondFill['emptyShifts']);
    //save the shifts statistics .
console.group({schedulMold})
    const stats = await this.shiftStats.createUsersStatsForScheduleShift(
      ceratedSched,
      schedulMold.restDays 
    );
    console.log(stats);

    // return shifts;
    return { filled2Sched, emptyShifts };
    // after filling check if any shifts left without user
  }
  async deleteSchedule(scheduleId: number) {
    const currentDate = new Date();
    console.log('try delete ', scheduleId);
    // Parse scheduleId to integer if it's not already
    if (isNaN(scheduleId)) {
      throw new Error('Invalid schedule ID');
    }
    try {
      const resultDeleteRequests = await this.prisma.userRequest.deleteMany({
        where: {
          shift: {
            scheduleId: scheduleId,
          },
        },
      });
      //delete all the reqestes
      if (!resultDeleteRequests) {
        throw new ForbiddenException('cant compete delete ');
      }
      const res = await this.prisma.schedule.delete({
        where: {
          id: scheduleId,
        },
      });

      console.log('try delete ', { res });
      if (res) {
        console.log('true delete ');
        return true;
      }
    } catch (error) {
      throw new ForbiddenException(error.message, error);
    }
  }
}
