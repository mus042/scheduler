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
  SystemShiftDTO,
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
import { filter } from 'rxjs';
const maxAmountOfShifts = 6;
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
type dayOptions =
  | number
  | Date
  | { H: number; M: number; D: number }
  | string
  | undefined;

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
  getNextDayDate(day: dayOptions) {
  
    let dayToAdd;
    let currentDate = new Date(); //hold the date with hours in case needed.
    let hoursCorrection;
    
    if (day === undefined) {
      dayToAdd = 0;

      hoursCorrection = '1,0,0,0';
    } else if (typeof day === 'string') {
      dayToAdd = Number(day);
     
      hoursCorrection = '0,0,0,0';
    } else if (typeof day === 'object' && 'D' in day) {
      dayToAdd = day.D;
      hoursCorrection = `${day.H},${day.M},0,0`;
      
  
    } else if (day instanceof Date) {
      // If day is a Date object
      dayToAdd = day.getDay();
      // currentDate.setHours(day.getUTCHours(),day.getUTCMinutes(),0,0);
      hoursCorrection = `${day.getUTCHours()},${day.getUTCMinutes()},0,0`;
      // console.log(currentDate);
    } else {
      dayToAdd = day;
      // currentDate.setHours(3, 0, 0, 0);
      hoursCorrection = `3,0,0,0`;
    }
    let adjusted;
    currentDate.setUTCHours(1, 0, 0, 0);

    // If it's Wednesday or later, add days to reach the Sunday after next
    const daysAddition = 7 - currentDate.getDay() + dayToAdd;
    
    adjusted = new Date(
      currentDate.getTime() + daysAddition * 24 * 60 * 60 * 1000,
    );

    const correction: [number, number, number, number] = hoursCorrection
      .split(',')
      .map((num) => parseInt(num, 10)) as [number, number, number, number];
    adjusted.setUTCHours(...correction);

    console.log({ adjusted }, 'adjusted Date');
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
    console.log({ schedSet }, { facilityId });
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
      const existingSelected = await this.prisma.scheduleMold.findFirst({
        where: { facilityId: facilityId, selected: true },
      });
      // If there's a selected entry, unselect it

      if (existingSelected && existingSelected.id) {
        console.log(existingSelected.id, 'id of existing');
        await this.prisma.scheduleMold.update({
          where: { id: existingSelected.id },
          data: { selected: false },
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
        },
        include: {
          scheduleTime: true,
          shiftsTemplate: {
            include: {
              userPrefs: {
                include: {
                  role: { select: { name: true, id: true } },
                },
              },
            },
          },
        },
      });
      console.log({ res });
      if (res) return res;
      else return false;
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }

  async getNextScheduleForUser(userId: number) {
    const currentDate = new Date();
    currentDate.setHours(1, 0, 0, 0);
    // currentDate.setHours(5, 0, 0);
    let adjusted;

    // If it's Wednesday or later, add days to reach the Sunday after next
    adjusted = this.getNextDayDate(0);

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
      // console.log(scheduleArr);

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
    console.log(
      'Create schedule startDate',
      { schedulMold },
      schedulMold.scheduleTime,
    );
    const startDate: Date = this.getNextDayDate(
      schedulMold.scheduleTime.startDay,
    );

    console.log('Create schedule startDate', { startDate });
    startDate.setUTCHours(
      Number(schedulMold.scheduleTime.startHour),
      Number(schedulMold.scheduleTime.startMinutes),
      0,
      0,
    );
    const endDate: Date = new Date(
      this.getNextDayDate(schedulMold.scheduleTime.endDay).getTime() +
        schedulMold.daysPerSchedule * 24 * 60 * 60 * 1000,
    );
    endDate.setUTCHours(
      Number(schedulMold.scheduleTime.endHour),
      Number(schedulMold.scheduleTime.endMinutes),
      0,
      0,
    );
    console.log('Create schedule startDate', { startDate });
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
    console.log({ startDate }, { userId });
    try {
      const schedule: schedule = await this.prisma.schedule.findFirst({
        //change to find uniqe?
        where: {
          AND: [{ scheduleStart: startDate }, { userId: userId }],
        },
      });

      console.log(userId, { schedule });
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
   * @returns {*} schedules: shift[][]
   * @memberof ScheduleService
   */
  async getAllUsersForSchedule(
    startingDate: Date,
    selectedUsers: user[] | undefined,
    roleId: number | undefined,
  ) {
    const schedules: Record<string, shift>[] = []; // Initialize as an empty array
    console.log('get all users ');
    const allUsers: user[] = await this.userService.getAllUsers();

    let filteredUsers: user[];

    if (selectedUsers && selectedUsers.length > 0) {
      filteredUsers = allUsers.filter((user) =>
        selectedUsers.some((selectedUser) => selectedUser.id === user.id),
      );
    } else {
      filteredUsers = allUsers;
    }
    if (roleId) {
      filteredUsers = filteredUsers.filter((user) => user.roleId === roleId);
      console.log({ filteredUsers });
    }
    console.log('get filteredUsers users ', { filteredUsers });
    for (const user of filteredUsers) {
      console.log('user::', user.id);
      const schedule = await this.getScheduleIdByDateAnduserId(
        user.id,
        startingDate,
      );
      if (schedule && schedule.id) {
        //schdule is not null
        console.log('schedule id ', schedule?.id);
        const shiftsForSchedule =
          await this.shiftSercvice.getAllShiftsByScheduleId(schedule.id);
        // console.log({shiftsForSchedule});
        const sortdShifts: shift[] = shiftsForSchedule.sort(
          (a, b) => a.shiftStartHour.getTime() - b.shiftStartHour.getTime(),
        );
        const shiftsMap = sortdShifts.reduce((map, shift) => {
          map[shift.shiftStartHour.toUTCString()] = {userId:shift.userId,roleId:user.id,userPreference:shift.userPreference,userShiftId:shift.id};
          return map;
        }, {});

        console.log('shiftMap ', { shiftsMap });
        if (shiftsMap) {
          schedules.push(shiftsMap); // Push each filtered shifts array
          // console.log('one user Shifts ', {filterdShifts});
        }
      }
    }
    console.log('all users Shifts ', schedules[0]);
    return schedules;
  }

  async getUsersForSchedule(users: user[], startingDate: Date) {
    //for each user get schedule and save it in schedules arr
    const schedules: shift[][] = [];
    // console.log({ users }, startingDate);
    for (const user of users) {
      const schedule: schedule = await this.getScheduleIdByDateAnduserId(
        user.id,
        startingDate,
      );
      console.log(schedule !== null && schedule !== undefined, { schedule });
      if (schedule !== null && schedule !== undefined) {
        const shiftsForSchedule: shift[] =
          await this.shiftSercvice.getAllShiftsByScheduleId(schedule?.id);

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
    // if (shiftId) {
    //   console.log({ shiftId });
    //   const shiftToReplace = await this.shiftSercvice.getShiftById(shiftId);
    //   if (shiftToReplace && scheduleIdToCheck) {
    //     const currentUser: user = { ...shiftToReplace.userRef };
    //     try {
    //       const scheduleToCheck: schedule = await this.getScheduleById(
    //         scheduleIdToCheck,
    //       );
    //       const schedShifts = await this.getAllUsersForSchedule(
    //         scheduleToCheck.scheduleStart,
    //         undefined,
    //       );
    //       if (scheduleToCheck.scheduleType !== 'systemSchedule') {
    //         throw new ForbiddenException(
    //           'Replace alowd only on system schedule',
    //         );
    //       }
    //       const avialbleUsersForShift: ShiftDto[] =
    //         this.scheduleUtil.searchPossibleUsersForShift(
    //           shiftToReplace.shiftStartHour,
    //           schedShifts,
    //         );
    //       console.log('419:', avialbleUsersForShift);
    //       const filtered = avialbleUsersForShift.filter(
    //         (shiftToFilter, index, shiftsArray) => {
    //           const isUnique =
    //             shiftsArray.findIndex(
    //               (shift) => shift.userId === shiftToFilter.userId,
    //             ) === index;

    //           // Check if the shift is not repeated and satisfies the isShiftpossible condition
    //           return (
    //             isUnique &&
    //             this.scheduleUtil.isShiftpossible(
    //               shiftToFilter,
    //               scheduleToCheck,
    //             ) &&
    //             shiftToFilter.userId !== shiftToReplace.userId
    //           );
    //         },
    //       );

    //       console.log({ filtered });
    //       return filtered;
    //     } catch (error) {
    //       console.log({ error });
    //     }
    //   }
    // }
  }

  convertShiftMoldToShift(shiftMold, schedualId: number | undefined) {
    const startDate: Date = this.getNextDayDate({
      D: Number(shiftMold.day),
      H: Number(shiftMold.startHour),
      M: 0,
    });
   
    const endDate: Date = this.getNextDayDate({
      D: Number(shiftMold.day),
      H: Number(shiftMold.endHour),
      M: 0,
    });

    const dto: SystemShiftDTO = {
      shiftType: 'systemSchedule',
      shiftTimeName: shiftMold.name, 
      typeOfShift:
        shiftMold.endHour - shiftMold.startHour > 10 ? 'long' : 'short', //TOFIX -- dynemic by hours
      shiftStartHour: startDate,
      shiftEndHour: endDate,
      shiftName:shiftMold.shiftTimeName, //Change to timeName
      shiftRoles: {
        create: shiftMold.userPrefs.map((role) => {
          return { userId: -1, roleId: role.roleId, role: role.role };
        }),
      },
    };
    dto['scheduleId'] = schedualId || dto['scheduleId'];
    console.log({dto});
    return dto;
  }
  /**
   * @description Create a new shifts arr acurding to mold.
   * @param {Date} startDate
   * @param {number} scheduleId
   * @param {any[]} shiftsMold
   * @returns {*}  shifts map
   * @memberof ScheduleService
   */
  genrateEmptySysSchedShifts(
    startDate: Date,
    scheduleId: number,
    shiftsMold: any[],
  ) {
    // Define 'shifts' as a map with numeric keys and 'SystemShiftDTO' values
    const shifts: Record<string, SystemShiftDTO> = {};

    for (const shiftMold of shiftsMold) {
      // Create shift for each mold shift
      // console.log({ shiftMold });
      const tmpShift: SystemShiftDTO = this.convertShiftMoldToShift(
        shiftMold,
        scheduleId,
      );
      // console.log({ tmpShift });

      // Use the time in milliseconds as the key for the map
      shifts[tmpShift.shiftStartHour.toUTCString()] = tmpShift;
    }

    return shifts;
  }

  async createEmptySchedule(startDate: Date, endDate: Date) {
    try {
      const newSchedule: schedule = await this.prisma.schedule.create({
        data: {
          scheduleStart: startDate,
          scheduleEnd: endDate,
          scheduleType: 'systemSchedule',
        },
      });
      console.log('generate new Schedule , Line::971',{newSchedule})
      return newSchedule;
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }
  getAllUserShiftsInSchedule(
    userId: number,
    scheduleShifts: Record<string, SystemShiftDTO>,
  ) {
    const userShifts = Object.entries(scheduleShifts)
      .filter(([key, value]) => {
        // Check if any role in shiftRoles matches the userId
        return value.shiftRoles.create.some((role) => role.userId === userId);
      })
      .map(([key, value]) => value);
console.log("all user shifts: -line :: 986",{userId},{userShifts});
    return userShifts;
  }

  /**
   * @description  Check all constrains of mold, and other user shifts.
   * @param {*} shiftToAssign
   * @param {shift} userShift
   * @param {any[]} scheduleShifts
   * @returns {*}  {boolean}
   * @memberof ScheduleService
   */
  isShiftPossible(
    shiftToAssign,
    userShift,
    scheduleShifts: Record<string, SystemShiftDTO>,
  ) {
    // Convert shiftToAssign's start hour to a Date object for comparison
    
    const allUserhifts = this.getAllUserShiftsInSchedule(
      userShift.userId,
      scheduleShifts,
    );
    const eightHoursInMilliseconds = 8 * 60 * 60 * 1000;

    const underShiftLimit = allUserhifts.length < maxAmountOfShifts;
    const sameDayShift = allUserhifts?.filter(
      (shift) =>{

        console.log(" same day ",shift.shiftStartHour.toDateString() ===
        shiftToAssign.shiftStartHour.toDateString() ,"days:",shift.shiftStartHour.toISOString().substring(0, 10),"2: ",shiftToAssign.shiftStartHour.toISOString().substring(0, 10)," time between ",(shiftToAssign.shiftStartHour.getTime() - shift.shiftEndHour.getTime())/ (1000 * 60 * 60) )
      return( 
      shift.shiftStartHour.toISOString().substring(0, 10) ===
          shiftToAssign.shiftStartHour.toISOString().substring(0, 10) 
          &&
       Math.abs((shiftToAssign.shiftStartHour.getTime() - shift.shiftEndHour.getTime())) <=
          eightHoursInMilliseconds 
          ||
        Math.abs((shiftToAssign.shiftEndHour.getTime() - shift.shiftStartHour.getTime())) <=
          eightHoursInMilliseconds)}
    );

    console.log('is shift Possible ? 1029', { underShiftLimit }, allUserhifts.length, "same day", sameDayShift.length, "return:", (underShiftLimit && sameDayShift.length < 1));
    return underShiftLimit && sameDayShift.length < 1;
  
  }

  /**
   * @description Will return an object of arrays. each array is a schedule for the role.
   * @param {Record<number, SystemShiftDTO>} shiftsMap
   * @returns {*}  {Record<number, SystemShiftDTO[]>}
   * @memberof ScheduleService
   */
  getShiftsByRoles(
    shiftsMap: Record<number, SystemShiftDTO>,
  ): Record<number, SystemShiftDTO[]> {
    const shiftsByRole: Record<number, SystemShiftDTO[]> = {};

    // Iterate over each shift in the map
    Object.values(shiftsMap).forEach((shift) => {
      // Iterate over each role in the shift's 'shiftRoles.create'
      
      shift.shiftRoles.create.forEach((role) => {
        // Check if the role already exists in shiftsByRole, if not, initialize it
        if (!shiftsByRole[role.roleId]) {
          shiftsByRole[role.roleId] = [];
        }

        // Add the shift to the corresponding role's array
        shiftsByRole[role.roleId].push(shift);
      });
    });
    console.log("get shifts By Roles ::1052" );
    return shiftsByRole;
  }

  /**
   * @description Return possible shifts for shiftToAssign.
   * @param {*} shiftsToAssign
   * @param {shift[][]} avilebleUserShifts
   * @param {ShiftDto[]} emptySchedule
   * @memberof ScheduleService
   */
  getMatchingUsersRoles(
    shiftToAssign: any,
    avilebleUserShifts: Record<number, shift>[],
  ) {
   
    //filter shifts to get only users with matching roles,
    const matchingRoleUsersSchdule = avilebleUserShifts.filter(
      (scheduleShifts: shift[]) =>
        Object.values(scheduleShifts)[0].userRef.roleId ===
        shiftToAssign[0].shiftRoles.create[0].roleId,
    );
    console.log(
      'get match role, shiftToAssign :: 1075',
      {shiftToAssign},
    );
    return matchingRoleUsersSchdule;
  }
  findMinOptions(shiftsToSearch, userOptinalShifts: shift[][]) {
    let minOptions = { shiftIdnex: -1, numOfOptions: -1 };
    let shiftOptions: { shiftIndex: number; options: shift[] } = {
      shiftIndex: 0,
      options: [],
    };
    shiftsToSearch.forEach((shiftToFind, index) => {
      console.log("Search for shift in schedule shifts ::1087",{ shiftToFind }, { userOptinalShifts });
      const tmpOptions = [];
      Object.values(userOptinalShifts).map((userShifts) => {
        // console.log(userShifts, shiftToFind.shiftStartHour.getTime());
        tmpOptions &&
          tmpOptions.push(userShifts[shiftToFind.shiftStartHour.getTime()]);
      });

      // console.log(
      //   { tmpOptions },
      //   { index },
      //   minOptions.numOfOptions > tmpOptions.length,
      //   minOptions.numOfOptions,
      //   tmpOptions.length,
      // );
      if (
        minOptions.shiftIdnex === -1 ||
        minOptions.numOfOptions > tmpOptions.length
      ) {
        minOptions.numOfOptions = tmpOptions.length;
        minOptions.shiftIdnex = index;
   
        shiftOptions = { shiftIndex: index, options: [...tmpOptions] };
      }
    });
    console.log('shiftoptions  ::1112 ', { shiftOptions });
    return shiftOptions;
  }

  assignScheduleShifts(
    shiftsToAssign,
    usersSchedulesShifts,
    assignedSchedule,
    roleId,
  ) {

    const shiftOptionsMap = new Map();
    const noUserShifts = [];
    const assignedShifts = [];
console.log("assign shifts, shifts map= ",{shiftsToAssign})
    shiftsToAssign.forEach((shift) => {
      const availableUsers = {};
      // console.log({ shift });
      availableUsers[shift.shiftStartHour.toUTCString()] = [];
      usersSchedulesShifts.map((userSchedule) => {
        //get options for shift.
        // console.log(
        //   'shift at avail',
        //   shift.shiftStartHour.toUTCString(),
        //   userSchedule[shift.shiftStartHour.toUTCString()],
        //   { userSchedule },
        // );
        if (
          userSchedule[shift.shiftStartHour.toUTCString()]?.userPreference !==
            '3'
        ) {
          availableUsers[shift.shiftStartHour.toUTCString()].push(
            userSchedule[shift.shiftStartHour.toUTCString()],
          );
        }
      });
     
      shiftOptionsMap.set(shift.shiftStartHour.toUTCString(), {
        shift: shift,
        options: Object.values(availableUsers).flat(),
      });
    });

    //create map for every shift in shiftToAssign -> shiftOptions in usersScheduleShifts
    const shiftsMap = shiftOptionsMap;
   
    while (shiftsMap.size > 0) {
      const shiftWithLeast = this.findShiftWithLeastOptions(shiftsMap);
      
      //find the shifts with the least optiopns. return it and

      //once found - assign a user to it.
      const assigendShift = this.asssignShift(
        shiftWithLeast,
        assignedSchedule,
        roleId,
        shiftOptionsMap,
      );
      if(!assigendShift){
        console.log("no possible users ::1170 , shift:",{shiftWithLeast});
        noUserShifts.push(shiftWithLeast);
        shiftsMap.delete(shiftWithLeast.shift.shiftStartHour.toUTCString());
        
      }
      else{
        
      //romove user if in other shifts that day / day after if night.
      assignedShifts.push(assigendShift);
      assignedSchedule[assigendShift.shiftStartHour.toUTCString()].shiftRoles.create = assigendShift.shiftRoles.create;
      shiftsMap.delete(assigendShift.shiftStartHour.toUTCString());
      // console.log(
      //   'After deletion:',
      //   shiftsMap.get(assigendShift.shiftStartHour.toUTCString()),
      //   { shiftsMap },
      //   assignedSchedule[assigendShift.shiftStartHour.toUTCString()].shiftRoles
      //     .create,
      // );
    }
  }
  
    //return the signed and unsigned shifts
    console.log("finished assining shifts ", {assignedSchedule},{shiftsToAssign});
    return {assigend:assignedShifts,unAssigend:noUserShifts};
  }
  findShiftWithLeastOptions(shiftOptionsMap) {
    let shiftWithLeastOptions = null;
    let leastOptionsCount = Infinity;
    console.log({ shiftOptionsMap });
    for (let [utcDate, { shift, options }] of shiftOptionsMap.entries()) {
      console.log('length ', options.length);
      const optionsLength = options.length;
      console.log({ shiftWithLeastOptions }, { optionsLength }, { options });

      if (optionsLength < leastOptionsCount) {
        leastOptionsCount = optionsLength;
        shiftWithLeastOptions = { shift: shift, shiftOptions: options };
      }
    }
    return shiftWithLeastOptions;
  }
  getNextShiftKeyInMap(currentShiftKey, shiftsMap) {
    console.log(shiftsMap)
    const entries = Object.entries(shiftsMap); // Convert to entries array
    for (let i = 0; i < entries.length; i++) {
      if (entries[i][0] === currentShiftKey && i + 1 < entries.length) {
        // Return the key of the next shift if the current key matches and there is a next shift
        return entries[i + 1][0]; // Return the key of the next shift
      }
    }
    return null; // Return null if no next shift is found
  }
  
  asssignShift(shiftAndOptions, assignedShifts, roleId,shiftsMap) {
    //check all options and pick the best option
    //concidering the other shifts user has on the schedule
    const assignedShift =
      assignedShifts[shiftAndOptions.shift.shiftStartHour.toUTCString()];
    console.log(
      "assign shift",
      { assignedShift },
      assignedShift.shiftRoles,
      "shiftAndOptions",{shiftAndOptions},
      "assignd shifts" , {assignedShifts},
      "shifts to assign : ",{shiftsMap}
    );
    //Filter possible options , 
    const possibleShifts = shiftAndOptions.shiftOptions.filter((shift)=>this.isShiftPossible(shiftAndOptions.shift, shift,assignedShifts));
    console.log("possible shifts : ", {possibleShifts})
    // console.log({possibleShifts});
    if(possibleShifts.length < 1){
      return ;
    }
    if(possibleShifts.length === 1){
      assignedShift.shiftRoles.create.forEach((role, index) => {
        console.log("role at index", {index},{role},'roleId:::',{roleId});
            if (role.roleId === roleId && role.userId !== undefined) {
              console.log("role at index", {index},{role});
              assignedShift.shiftRoles.create[index].userId =
               possibleShifts[0].userId;
            }
          });
    } 
    console.log("check other shifts to make sure user not only one. ",{shiftsMap},"shifts map :",shiftsMap.options)
    const selectedInedx = 0;
    //make sure user is not nedeed for next shift, if needed -> try assign other shift else ->remove user from next shift
    const nextShiftKey = this.getNextShiftKeyInMap(shiftAndOptions.shift.shiftStartHour.toUTCString(),shiftsMap)
    console.log("next shift Key = ",nextShiftKey)
    if(nextShiftKey && shiftsMap[nextShiftKey].shiftOptions.length === 1 && shiftsMap[nextShiftKey].options[0].userId === possibleShifts[selectedInedx].userId ){
        console.log(":::1265::: user is only option for next shift ")
    }


    assignedShift.shiftRoles.create.forEach((role, index) => {
  console.log("role at index", {index},{role},'roleId:::',{roleId});
      if (role.roleId === roleId && role.userId !== undefined) {
        console.log("role at index", {index},{role});
        assignedShift.shiftRoles.create[index].userId =
         possibleShifts[selectedInedx].userId;
      }
    });
    
   
    console.log("added user to roles - ",assignedShift.shiftRoles.create);
    return assignedShift;
  }


  /**
   * @description Create the a system schedule for the date provided.
   * @param {generateScheduleForDateDto} dto
   * @memberof ScheduleService
   */
  async createSystemSchedule(dto: generateScheduleForDateDto) {
    console.log('Create sys schedule service 903', dto);
    //Get current mold
    const currentMold = await this.getSelctedScheduleMold(dto.facilityId);

    if (currentMold === false) {
      throw new ForbiddenException('907 sched service currentmold ');
    }
    //Normalize the dates .
    const normelizedStartDate = this.getNextDayDate({
      D: currentMold.scheduleTime.startDay,
      H: currentMold.scheduleTime.startHour,
      M: currentMold.scheduleTime.startMinutes,
    });
    const normelizedendDate = this.getNextDayDate({
      D: currentMold.scheduleTime.endDay,
      H: currentMold.scheduleTime.endHour,
      M: currentMold.scheduleTime.endMinutes,
    });
    //Generate schedule to have schdule id for next steps.
    const newSchedule: schedule = await this.createEmptySchedule(
      normelizedStartDate,
      normelizedendDate,
    );
    if (!newSchedule) {
      throw new ForbiddenException('907 sched service currentmold ');
    }
    //Generate empty shift object from mold, include empty roles
    const emptyShifts: Record<string, SystemShiftDTO> =
      this.genrateEmptySysSchedShifts(
        normelizedStartDate,
        newSchedule.id,
        currentMold.shiftsTemplate,
      );
  
    //get shifts to  assign for every role, each arr is schedule.
    const schedulesShiftsByRole = this.getShiftsByRoles(emptyShifts); // get object contain arrs of shifts by roles. so each role have arr
    console.log("schedulesShiftsByRole:::",{schedulesShiftsByRole})
    //get Schedule of users with Roles
    console.log('got emptyShifts, and create map shifts by roles ::1279  ' );
    //for every role - assign the users.
    Object.entries(schedulesShiftsByRole).forEach(async ([key, shiftsByRole]) => {
      // shiftsToAssign is now an array of shifts with a same role

      console.log('for each shift in schedule by role. shift:', { shiftsByRole },'::1284,roleId: ',{key});
      //get shifts of users with matching roles
      //Get all avileble users schedules from users list if it exist, else all users.
      const filterdUserScheduleShifts: Record<number, shift>[] =
        await this.getAllUsersForSchedule(normelizedStartDate, undefined, Number(key));
      //  console.log({avilebleUserShifts});
      if (!filterdUserScheduleShifts) {
        throw new ForbiddenException('907 sched service currentmold ');
      }
      // console.log({ filterdUserScheduleShifts }, { shiftsByRole });
      //assign shifts of shiftByRole
      const assigndShifts = this.assignScheduleShifts(
        shiftsByRole,
        filterdUserScheduleShifts,
        emptyShifts,
        Number(key),
      );
      this.printAssigedShifts(assigndShifts.assigend);
      // this.printAssigedShifts(assigndShifts.unAssigend);
      console.log(assigndShifts.unAssigend)
      //creart shifts in db + shiftUserRole table \

    

    });
  }
  createScheduleShifts(shiftsToCreate){
    //map arr and create each shift.
    
  }
printAssigedShifts(assigendShifts:SystemShiftDTO[]){
  assigendShifts.forEach((shift)=>
  {
    console.log("assigend shift Date: ", shift.shiftStartHour.toUTCString());
    console.log(" schedule roles:");
    shift.shiftRoles.create.forEach((role,index)=>
    {
      console.log("role ",{index},":",{role});
    }
    )
    console.log("--------------------")
  }
  )
}

    //   async createSchedule(dto: any) {
    //     //get schedule and shift mold

    //     const schedulMold: any = await this.prisma.scheduleMold.findFirst({
    //       where: {
    //         selected: true,
    //       },
    //       include: {
    //         shiftsTemplate: {
    //           include: {
    //             userPrefs: true,
    //           },
    //         },
    //         restDays: true,
    //         scheduleTime: true,
    //       },
    //     });

    //     if (!schedulMold) {
    //       throw new Error('Schedule Mold not found');
    //     }
    //     console.log('create schedule ', { dto }, { schedulMold });
    //     const startingDate: Date = this.getNextDayDate(
    //       schedulMold.scheduleTime.startDay,
    //     );
    //     console.log('832', { startingDate });
    //     startingDate.setUTCHours(
    //       Number(schedulMold.scheduleTime.startHour),
    //       Number(schedulMold.scheduleTime.startHour),
    //       Number(schedulMold.scheduleTime.startMinutes),
    //       0,
    //     );

    //     console.log('840', { startingDate });
    //     const endindgDate: Date = new Date(
    //       this.getNextDayDate(schedulMold.endDay) +
    //         schedulMold.daysPerSchedule * 24 * 60 * 60 * 1000,
    //     );
    //     endindgDate.setUTCHours(
    //       Number(schedulMold.scheduleTime.endHour),
    //       Number(schedulMold.scheduleTime.endHour),

    //       Number(schedulMold.scheduleTime.endMinutes),
    //       0,
    //     );

    //     console.log('create schedule ', { startingDate }, { schedulMold });
    //     const availableUsers: user[] = await this.prisma.user.findMany({
    //       where: {
    //         schedules: {
    //           some: {
    //             scheduleType: 'userSchedule',
    //             scheduleStart: {
    //               equals: startingDate,
    //             },
    //           },
    //         },
    //       },
    //     });
    //     console.log({ availableUsers });

    //     // console.log({ users });

    //     console.log('create schedule ', { startingDate });
    //     const start: Date = new Date(startingDate);
    //     start.setHours(start.getHours());
    //     const end: Date = new Date(start.getDate() + schedulMold.daysPerSchedule);
    //     const useresSchedules: shift[][] = await this.getUsersForSchedule(
    //       availableUsers,
    //       startingDate,
    //     );
    //     console.log('451 schedule service - useres schedules with prefernces ');
    //     const minimunUsersForSchedule = 3;
    //     if (useresSchedules.length < minimunUsersForSchedule) {
    //       //minimun users for schedule
    //       console.log('879 user service  forbbiden error ', useresSchedules.length);
    //       throw new ForbiddenException('insufficenst users for scheudle ');
    //     }
    //     const createdSchedule: schedule = await this.prisma.schedule.create({
    //       data: {
    //         scheduleStart: startingDate,
    //         scheduleEnd: endindgDate,
    //         scheduleType: 'systemSchedule',
    //       },
    //     });
    //     const type = 'systemSchedule';
    //     const scheduleId: number = createdSchedule.id;
    //     const newSchedule: ShiftDto[] = this.scheduleUtil.generateNewScheduleShifts(
    //       startingDate,
    //       endindgDate,
    //       scheduleId,
    //       schedulMold,
    //       type,
    //     );

    //     const ceratedSched: shift[] = [];
    //     let leastOptions;
    //     try {
    //       leastOptions = this.scheduleUtil.fillMinUserShifts(
    //         newSchedule,
    //         useresSchedules,
    //       );
    //       // console.log({leastOptions});
    //     } catch (eror) {
    //       leastOptions = newSchedule;
    //       //  console.log({leastOptions})
    //     }

    //     const firstFill: any = await this.scheduleUtil.fillSchedule(
    //       leastOptions,
    //       useresSchedules,
    //     );
    //     console.log(firstFill['scheduleToFill']);
    //     const secondFill: object = await this.scheduleUtil.fillSchedule(
    //       firstFill['scheduleToFill'],
    //       useresSchedules,
    //     );
    //     const filled2Sched: ShiftDto[] = secondFill['scheduleToFill'];

    //     //  console.log({filled2Sched});
    //     for (let i = 0; i < filled2Sched.length; i++) {
    //       // console.log({filled2Sched})
    //       // if (filled2Sched[i].userId > 0) {
    //       const shiftDto: ShiftDto = {
    //         s
    //         userPreference: filled2Sched[i].userPreference,
    //         // shiftDate: filled2Sched[i].shiftDate,
    //         shiftType: filled2Sched[i].shiftType,
    //         shiftStartHour: filled2Sched[i].shiftStartHour,
    //         shiftEndHour: filled2Sched[i].shiftEndHour,
    //         typeOfShift: filled2Sched[i].typeOfShift
    //           ? filled2Sched[i].typeOfShift
    //           : typeOfShift.short,
    //         scheduleId: scheduleId,
    //       };
    //       const userid: number = filled2Sched[i].userId
    //         ? filled2Sched[i].userId
    //         : undefined;
    //       const shift: shift = await this.shiftSercvice.creatShift(
    //         userid,
    //         shiftDto,
    //       );
    //       // console.log({shift})
    //       ceratedSched.push(shift);
    //       // }
    //     }
    //     const emptyShifts = secondFill['emptyShifts'];
    //     console.log('unassigned Shifts:', secondFill['emptyShifts']);
    //     //save the shifts statistics .
    // console.group({schedulMold})
    //     const stats = await this.shiftStats.createUsersStatsForScheduleShift(
    //       ceratedSched,
    //       schedulMold.restDays
    //     );
    //     console.log(stats);

    //     // return shifts;
    //     return { filled2Sched, emptyShifts };
    //     // after filling check if any shifts left without user
  // }
  async deleteSchedule(scheduleId: number) {
    const currentDate = new Date();
    // console.log('try delete ', scheduleId);
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

      console.log('after try delete ::1492 ', { res });
      if (res) {
        // console.log('true delete ');
        return true;
      }
    } catch (error) {
      throw new ForbiddenException(error.message, error);
    }
  }
  async deleteAllSchedules() {
    console.log('try delete ');

    try {
      //delete all the reqestes
      const resultDeleteRequests = await this.prisma.userRequest.deleteMany({
        where: {
          shift: {
            shiftType: 'systemSchedule',
          },
        },
      });
      //delete all shiftRoles
      const ShiftRolesDeleteRes = await this.prisma.userShiftRole.deleteMany({
        where: {
          shift: {
            shiftType: 'systemSchedule',
          },
        },
      });

      if (!resultDeleteRequests) {
        console.log('no resultes for req compete delete ');
      }

      const res = await this.prisma.schedule.deleteMany({
        where: {
          scheduleType: 'systemSchedule',
        },
      });

      console.log('try delete ', { res });
      if (res) {
        console.log('true delete ');
        return true;
      }
    } catch (error) {
      console.log({ error });
      throw new ForbiddenException('cant delete');
    }
  }
}
