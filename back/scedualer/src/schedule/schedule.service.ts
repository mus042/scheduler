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
                data: { name: role.name, facilityId: facilityId },
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

  async getNextScheduleForUser(userId: number, facilityId) {
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
          facilityId: facilityId,
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
  async getNextSystemSchedule(facilityId) {
    const currentDate = new Date();
    console.log('next sys schedule ', { currentDate });

    try {
      console.log('next sys schedule ');
      const scheduleArr: schedule[] = await this.prisma.schedule.findMany({
        where: {
          facilityId: facilityId,
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
        facilityId: scheduleDto.facilityId,
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
    facilityId,
  ) {
    const schedules: Record<string, shift>[] = []; // Initialize as an empty array
    console.log('get all users of the facility ', { facilityId }, { roleId });
    const allUsers: user[] = await this.userService.getAllUsers(facilityId);
    console.log({ allUsers });
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
        console.log({ shiftsForSchedule });
        const sortdShifts: shift[] = shiftsForSchedule.sort(
          (a, b) => a.shiftStartHour.getTime() - b.shiftStartHour.getTime(),
        );
        const shiftsMap = sortdShifts.reduce((map, shift) => {
          map[shift.shiftStartHour.toISOString()] = {
            userId: shift.userId,
            roleId: user.id,
            userPreference: shift.userPreference,
            userShiftId: shift.id,
          };
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
      // if (this.scheduleUtil.isShiftpossible(shift1obj, schedule)) {
      //   //update new shift
      //   const newShift: shift = await this.shiftSercvice.updateShiftById(
      //     shift1obj,
      //     shift2obj,
      //   );
      //   return newShift;
      // }
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

  /**
   * @description Return map of  roleId:shift , each role ->shift
   * @param {*} shiftMold
   * @param {(number | undefined)} schedualId
   * @param {*} [role]
   * @returns {*}  Record<roleId:shift>
   * @memberof ScheduleService
   */
  convertShiftMoldToShift(shiftMold, schedualId: number | undefined, role?) {
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
    // Initialize an empty object to store shifts by role ID
    const shiftsMap: Record<number, SystemShiftDTO> = {};

    shiftMold.userPrefs.map((role) => {
      const tmpShift: SystemShiftDTO = {
        shiftType: 'systemSchedule',
        shiftTimeName: shiftMold.name.toLowerCase(),
        typeOfShift:
          shiftMold.endHour - shiftMold.startHour > 10 ? 'long' : 'short', //TOFIX -- dynemic by hours
        shiftStartHour: startDate,
        shiftEndHour: endDate,
        shiftName: shiftMold.shiftName,
        shiftRole: role,
        scheduleId: schedualId,
      };

      shiftsMap[role.roleId] = tmpShift;
    });
    return shiftsMap;
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
  ): Record<number, Record<string, SystemShiftDTO>> {
    // Initialize an empty object to store shifts by role ID, where each role ID maps to an object
    const scheduleShiftsByRoles: Record<number, Record<string, SystemShiftDTO>> = {};
  
    for (const shiftMold of shiftsMold) {
      // Use convertShiftMoldToShift to create a shift for each role in the mold
      const tmpShiftsByRole: Record<number, SystemShiftDTO> =
        this.convertShiftMoldToShift(shiftMold, scheduleId);
  
      // Iterate over the shifts returned for each role and add them to the scheduleShiftsByRoles map
      Object.entries(tmpShiftsByRole).forEach(([roleIdStr, shift]) => {
        const roleId = parseInt(roleIdStr, 10); // Ensure roleId is a number
  
        // Initialize the object for this roleId if it doesn't already exist
        if (!scheduleShiftsByRoles[roleId]) {
          scheduleShiftsByRoles[roleId] = {};
        }
  
        // Add the shift to the object for this role, keyed by the shift's start hour in ISO string format
        const shiftKey = shift.shiftStartHour.toISOString();
        scheduleShiftsByRoles[roleId][shiftKey] = shift;
      });
    }
  
    return scheduleShiftsByRoles;
  }

  async createEmptySchedule(startDate: Date, endDate: Date, facilitId: number) {
    try {
      const newSchedule: schedule = await this.prisma.schedule.create({
        data: {
          scheduleStart: startDate,
          scheduleEnd: endDate,
          scheduleType: 'systemSchedule',
          facilityId: facilitId,
        },
      });
      console.log('generate new Schedule , Line::971', { newSchedule });
      return newSchedule;
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }
  
  
  getAllUserShiftsInSchedule(userId, scheduleShifts) {
    // Assuming each shift is an object with a property `userId`
    const userShifts = Object.entries(scheduleShifts).flatMap(([roleId, shifts]) => {
      console.log('roleId: ', {roleId})
      // if (!Array.isArray(Object.values(shifts))) {
      //   console.error(`Expected array for roleId ${roleId}, found:`, shifts);
      //   return [];
      // }
      return Object.values(shifts).filter(shift => shift.userId === userId).map(shift => ({ ...shift, roleId }));
    });
    console.log('userShifts in schedule ---',{userShifts})
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
    scheduleShifts,
  ) {
    console.log(
      'is shift possible shiftToAssign: ',
      { shiftToAssign },
      'usershift',
      { userShift },
      'scherdule shifts : ',
      { scheduleShifts },
    );
    const allUserhifts = this.getAllUserShiftsInSchedule(
      userShift.userId,
      scheduleShifts,
    );
    console.log({allUserhifts})
    const eightHoursInMilliseconds = 8 * 60 * 60 * 1000;

    const underShiftLimit = allUserhifts.length < maxAmountOfShifts;
    const sameDayShift = allUserhifts?.filter((shift) => {

      return (
        (shift.shiftStartHour.toISOString().substring(0, 10) ===
          shiftToAssign.shiftStartHour.toISOString().substring(0, 10) &&
          Math.abs(
            shiftToAssign.shiftStartHour.getTime() -
              shift.shiftEndHour.getTime(),
          ) <= eightHoursInMilliseconds) ||
        Math.abs(
          shiftToAssign.shiftEndHour.getTime() - shift.shiftStartHour.getTime(),
        ) <= eightHoursInMilliseconds
      );
    });

    console.log(
      'is shift Possible ? 1029',
      { underShiftLimit },
      allUserhifts.length,
      'same day',
      sameDayShift.length,
      'return:',
      underShiftLimit && sameDayShift.length < 1,
    );
    return  sameDayShift.length < 1;
  }

  /**
   * @description Will return an object of arrays. each array is a schedule for the role.
   * @param {Record<number, SystemShiftDTO>} shiftsMap
   * @returns {*}  {Record<number, SystemShiftDTO[]>}
   * @memberof ScheduleService
   */
  // getShiftsByRoles(
  //   shiftsMap: Record<number, SystemShiftDTO>,
  // ): Record<number, SystemShiftDTO[]> {
  //   const shiftsByRole: Record<number, SystemShiftDTO[]> = {};

  //   // Iterate over each shift in the map
  //   Object.values(shiftsMap).forEach((shift) => {
  //     // Iterate over each role in the shift's 'shiftRoles.create'

  //     shift.shiftRoles.create.forEach((role) => {
  //       // Check if the role already exists in shiftsByRole, if not, initialize it
  //       if (!shiftsByRole[role.roleId]) {
  //         shiftsByRole[role.roleId] = [];
  //       }

  //       // Add the shift to the corresponding role's array
  //       shiftsByRole[role.roleId].push(shift);
  //     });
  //   });
  //   console.log('get shifts By Roles ::1052');
  //   return shiftsByRole;
  // }

  /**
   * @description Return possible shifts for shiftToAssign.
   * @param {*} shiftsToAssign
   * @param {shift[][]} avilebleUserShifts
   * @param {ShiftDto[]} emptySchedule
   * @memberof ScheduleService
   */
  // getMatchingUsersRoles(
  //   shiftToAssign: any,
  //   avilebleUserShifts: Record<number, shift>[],
  // ) {
  //   //filter shifts to get only users with matching roles,
  //   const matchingRoleUsersSchdule = avilebleUserShifts.filter(
  //     (scheduleShifts: shift[]) =>
  //       Object.values(scheduleShifts)[0].userRef.roleId ===
  //       shiftToAssign[0].shiftRoles.create[0].roleId,
  //   );
  //   console.log('get match role, shiftToAssign :: 1075', { shiftToAssign });
  //   return matchingRoleUsersSchdule;
  // }
  findMinOptions(shiftsToSearch, userOptinalShifts: shift[][]) {
    let minOptions = { shiftIdnex: -1, numOfOptions: -1 };
    let shiftOptions: { shiftIndex: number; options: shift[] } = {
      shiftIndex: 0,
      options: [],
    };
    shiftsToSearch.forEach((shiftToFind, index) => {
      console.log(
        'Search for shift in schedule shifts ::1087',
        { shiftToFind },
        { userOptinalShifts },
      );
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
    
    console.log('assign shifts, shifts map= ', { shiftsToAssign });

    // Extract the timestamp key and shift details

    Object.entries(shiftsToAssign).forEach(([shiftDate, shiftDetails]) => {
      const availableUsers = {};
      console.log('shift , details', { shiftDate }, { shiftDetails });

      availableUsers[shiftDate] = [];
      usersSchedulesShifts.forEach((userSchedule) => {
        console.log('user shift at date ',{userSchedule} ,userSchedule[shiftDate],{shiftDate});
        if (
          userSchedule[shiftDate]
            ?.userPreference &&
          userSchedule[shiftDate]
            ?.userPreference !== '3'
        ) {
          console.log(
            'check',
            userSchedule[shiftDate],
            { shiftDate },
          );
          availableUsers[shiftDate].push(
            userSchedule[shiftDate],
          );
        }
      });

      shiftOptionsMap.set(shiftDate, {
        shift: shiftDetails,
        options: Object.values(availableUsers).flat(),
      });
    });
    // console.log({shiftOptionsMap});
    //create map for every shift in shiftToAssign -> shiftOptions in usersScheduleShifts
    const shiftsMap = shiftOptionsMap;
    const userShiftStats: Map<number, {morning: number, noon: number, night: number, longMorning: number, longNight: number , total:number}> = new Map();
  
    while (shiftsMap.size > 0) {
     
      const shiftWithLeast = this.findShiftWithLeastOptions(shiftsMap);
      //find the shifts with the least optiopns. return it and
      //once found - assign a user to it. 
      const assigendShift = this.asssignShift( //assign and return the shift 
        shiftWithLeast,
        assignedSchedule,
        roleId,
        shiftOptionsMap,
        userShiftStats,
      );
      console.log('assignd 1238 ', { assigendShift }, assignedSchedule[roleId], assignedSchedule[roleId]['2024-02-17T14:00:00.000Z']);
      if (!assigendShift) {
        // console.log('no possible users ::1170 , shift:', { shiftWithLeast });
        console.log('no possible users ::1170 , shift:', { shiftWithLeast },shiftWithLeast.shift.shiftStartHour.toISOString());
        noUserShifts.push(shiftWithLeast);
        shiftsMap.delete(shiftWithLeast.shift.shiftStartHour.toISOString());
        // console.log(shiftsMap.values.length);
      } else {
        console.log({assigendShift},  assignedSchedule[roleId]);
        //TO ADD ?- romove user if in other shifts that day / day after if night.
        assignedShifts.push(assigendShift);
        assignedSchedule[roleId][assigendShift.shiftStartHour.toISOString()].userId  = assigendShift.userId;
        shiftsMap.delete(assigendShift.shiftStartHour.toISOString());
        //Add  user stats shift map 
        if (!userShiftStats.has(assigendShift.userId)) {
          userShiftStats.set(assigendShift.userId, { morning: 0, noon: 0, night: 0, longMorning: 0, longNight: 0 ,total:0});
        }
        
        const currentUserStats = userShiftStats.get(assigendShift.userId);
        if (assigendShift.typeOfShift === 'short') {
           const shiftType = assigendShift.shiftTimeName; // morning, noon, or night
          currentUserStats[shiftType] = (currentUserStats[shiftType] || 0) + 1;
          currentUserStats['total'] = (currentUserStats['total'] || 0) + 1;
          // Update the map with the modified stats
          userShiftStats.set(assigendShift.userId, currentUserStats);
        }
        else{ if(assigendShift.shiftTimeName === 'morning'){
          currentUserStats['morningLong'] = (currentUserStats['morningLong'] || 0) + 1;
          currentUserStats['total'] = (currentUserStats['total'] || 0) + 1;
          // Update the map with the modified stats
          userShiftStats.set(assigendShift.userId, currentUserStats);
        }else{
          currentUserStats['nightLong'] = (currentUserStats['nightLong'] || 0) + 1;
          currentUserStats['total'] = (currentUserStats['total'] || 0) + 1;
          // Update the map with the modified stats
          userShiftStats.set(assigendShift.userId, currentUserStats);
        }}
      }
    }

    //return the signed and unsigned shifts
    console.log(
      'after assgining shifts ',
      { assignedSchedule },
      { shiftsToAssign },
    );
// change the day into two shifts
    const longShiftsEnabeld = true;
    if (noUserShifts.length > 0) {
      if (longShiftsEnabeld) {
        for (const shift of noUserShifts) {
          // Filter to get tuples of [string, SystemShiftDTO], then map to get just SystemShiftDTO
          const dayShiftDTOs = Object.entries(assignedSchedule[shift.shift.shiftRole.roleId])
            .filter(([key, dayShift]: [string, SystemShiftDTO]) => {
              // Ensure dayShift aligns with the desired date and has a userId
              return key.includes(shift.shift.shiftStartHour.toISOString().substring(0, 10)) &&
                     key !== shift.shift.shiftStartHour.toISOString() &&
                     dayShift.userId;
            })
            .map(([_, dayShift]:[any,SystemShiftDTO]) => dayShift); // Extract SystemShiftDTO from each tuple
        
          // Now dayShiftDTOs is an array of SystemShiftDTO objects
          if (dayShiftDTOs.length > 0) {
           console.log(dayShiftDTOs[0],dayShiftDTOs[0].shiftStartHour.getHours())
            if (shift.shift.shiftStartHour.getUTCHours() > dayShiftDTOs[0].shiftStartHour.getUTCHours()) {
              if(shift.shift.shiftStartHour.getUTCHours() > dayShiftDTOs[1].shiftStartHour.getUTCHours()){
                //night missing 
                console.log("night missing ",assignedSchedule[shift.shift.shiftRole.roleId]); 
                const nextShiftKey = this.getNextShiftKeyInMap(shift.shift.shiftStartHour.toISOString(),assignedSchedule[shift.shift.shiftRole.roleId])
                const nextShift = assignedSchedule[shift.shift.shiftRole.roleId]?.[nextShiftKey];
                console.log({nextShiftKey},{nextShift})
                if (nextShift.userId !== dayShiftDTOs[1].userId) {
                  // Can assign the user
              
                  // Instead of deleting, consider setting userId to undefined or null if that's acceptable in your data model
                  // dayShiftDTOs[1].userId = undefined; 
                  delete dayShiftDTOs[1].userId;
                  // Change start / end time and shift type to long
                  const tmpNewNight = assignedSchedule[shift.shift.shiftRole.roleId]?.[shift.shift.shiftStartHour.toISOString()];
                  if (tmpNewNight) {
                    // assignedSchedule[shift.shift.shiftRole.roleId]?.[shift.shift.shiftStartHour.toISOString()].setUTCHours(18, 0, 0, 0);
                      // tmpNewNight.userId = dayShiftDTOs[1].userId; // Reassign userId
              
                      // Directly update the shift in the schedule, assuming the role ID and shift start time are valid and exist
                      // assignedSchedule[shift.shift.shiftRole.roleId][shift.shift.shiftStartHour.toISOString()] = tmpNewNight;
                      
                  }
              }
              }else if(shift.shift.shiftStartHour.getUTCHours() < dayShiftDTOs[1].shiftStartHour.getUTCHours()){
                // Noon missing
                console.log("noon missing "); 
              }else{
                //first shift in dsy missing 
              }
            }
          }
        }
      }
    }
    return { assigend: assignedShifts, unAssigend: noUserShifts };
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
    console.log({shiftsMap});
    const entries = Object.entries(shiftsMap); // Convert to entries array
    for (let i = 0; i < entries.length; i++) {
      if (entries[i][0] === currentShiftKey && i + 1 < entries.length) {
        // Return the key of the next shift if the current key matches and there is a next shift
        return entries[i + 1][0]; // Return the key of the next shift
      }
    }
    return null; // Return null if no next shift is found
  }

  asssignShift(shiftAndOptions, assignedShifts, roleId, shiftsMap,userShiftStats) {
    //check all options and pick the best option
    //concidering the other shifts user has on the schedule
    const assignedShift =
     shiftAndOptions.shift;
    const maxAmountOfShifts = 6;
console.log({userShiftStats},"shirt and ",{shiftAndOptions})
    //Filter possible options ,
    

// Filter possible shifts
const possibleShifts = shiftAndOptions.shiftOptions.filter((shift) => {
  // Check if the shift is possible based on your custom logic
  const isPossible = this.isShiftPossible(shiftAndOptions.shift, shift, assignedShifts);
  
  // Safely check if the user has reached the max amount of shifts
  let totalShifts = 0;
  if (userShiftStats.has(shift.userId)) {
    totalShifts = userShiftStats.get(shift.userId).total || 0;
  }
  
  // Check if adding this shift would exceed the maximum allowed shifts
  return isPossible && totalShifts < maxAmountOfShifts;
});
    console.log('possible shifts : ', { possibleShifts },);
   
    if (possibleShifts.length < 1) {
      return;
    }
    if (possibleShifts.length === 1) {
   
 
          assignedShift.userId =
            possibleShifts[0].userId;
        
      
    }
  
    const selectedInedx = 0;
    //make sure user is not nedeed for next shift, if needed -> try assign other shift else ->remove user from next shift
    const nextShiftKey = this.getNextShiftKeyInMap(
      shiftAndOptions.shift.shiftStartHour.toUTCString(),
      shiftsMap,
    );
    console.log('next shift Key = ', nextShiftKey);
    if (
      nextShiftKey &&
      shiftsMap[nextShiftKey].shiftOptions.length === 1 &&
      shiftsMap[nextShiftKey].options[0].userId ===
        possibleShifts[selectedInedx].userId
    ) {
      console.log(':::1265::: user is only option for next shift ');
    }
    assignedShift.userId =
          possibleShifts[selectedInedx].userId;
 

    console.log('added user to  - ');
    return assignedShift;
  }

  /**
   * @description Create the a system schedule for the date provided.
   * @param {generateScheduleForDateDto} dto
   * @memberof ScheduleService
   */
  async createSystemSchedule(dto: generateScheduleForDateDto) {
    console.log('Create sys schedule service 903', dto);
    //create map to contain the userStatistics  
  
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
      dto.facilityId,
    );
    if (!newSchedule) {
      throw new ForbiddenException('907 sched service currentmold ');
    }
    //Generate empty shift object from mold, include empty roles
    const emptyShifts: Record<number, Record<string, SystemShiftDTO>> =
      this.genrateEmptySysSchedShifts(
        normelizedStartDate,
        newSchedule.id,
        currentMold.shiftsTemplate,
      );
    console.log('empty shifts: ', { emptyShifts });
    //get shifts to  assign for every role, each arr is schedule.
    // const schedulesShiftsByRole = this.getShiftsByRoles(emptyShifts); // get object contain arrs of shifts by roles. so each role have arr
    // console.log('schedulesShiftsByRole:::', { schedulesShiftsByRole });

    // //get Schedule of users with Roles
    // console.log('got emptyShifts, and create map shifts by roles ::1279  ');
    // //for every shift - assign the user.
    for (const [key, shiftsByRole] of Object.entries(emptyShifts)) {
      console.log(
        'for each shift in schedule by role. shifts:',
        { shiftsByRole },
        '::1284,roleId: ',
        { key },
      );
      //   //get shifts of users with matching roles
      //   //Get all avileble users schedules from users list if it exist, else all users.
      const filterdUserScheduleShifts =
        await this.getAllUsersForSchedule(
          normelizedStartDate,
          undefined,
          Number(key),
          dto.facilityId,
        );
       console.log("filterdUserScheduleShifts",{ filterdUserScheduleShifts });
      if (!filterdUserScheduleShifts) {
        throw new ForbiddenException('907 sched service currentmold ');
      }
      // console.log({ filterdUserScheduleShifts }, { shiftsByRole });
      //   //assign shifts of shiftByRole
      const assigndShifts = this.assignScheduleShifts(
        shiftsByRole, //arr of shifts ?
        filterdUserScheduleShifts,
        emptyShifts,
        Number(key),
      );
      console.log(assigndShifts);
      // this.printAssigedShifts(assigndShifts.assigend);
      //   // this.printAssigedShifts(assigndShifts.unAssigend);
        console.log(' ---- NOT ASSIGEND ---- ', assigndShifts.unAssigend);

      //   //higher roles can be assiged to lower roles empty posiostions? if yes try assigen .

      //   //if 24h scedule and unassiged shifts - try to change the day role shift to 12
    
      //   //if still no unassiged shift role , try to
      // }
      // //creart shifts in db + shiftUserRole table \
      console.log(
        'empty shcedule :',
        { emptyShifts },
        Object.values(emptyShifts).length,
      );






      // for (const shift of Object.values(emptyShifts)) {
      //   // Update shiftName based on shiftTimeName
      //   console.log('creating shift: ', { shift }, Object.values(emptyShifts));

      //   const { ...tmpShift } = { ...shift };
      //   tmpShift.shiftName = shift.shiftTimeName.toString();
      //   tmpShift.shiftTimeName = shift.shiftTimeName;
      //   // Filter out roles where userId is -1 and reassign\
      //   for (let i = tmpShift.shiftRoles.create.length - 1; i >= 0; i--) {
      //     if (tmpShift.shiftRoles.create[i].userId === undefined) {
      //       tmpShift.shiftRoles.create.splice(i, 1);
      //     }
      //   }

      //   const createdShift = await this.prisma.shift.create({
      //     data: {
      //       shiftName: tmpShift.shiftName,
      //       shiftType: tmpShift.shiftType,
      //       shiftStartHour: tmpShift.shiftStartHour,
      //       shiftEndHour: tmpShift.shiftEndHour,
      //       shiftTimeName: tmpShift.shiftTimeName,
      //       // shiftRoles: tmpShift.shiftRoles,
      //       typeOfShift: tmpShift.typeOfShift,
      //       scheduleId: tmpShift.scheduleId,
      //     },
      //   });
    }
  }

  printAssigedShifts(assigendShifts: SystemShiftDTO[]) {
    console.log('shifts lengthe:  ', assigendShifts.length);
    assigendShifts.forEach((shift) => {
      console.log('--------------------');
      console.log('Date: ', shift.shiftStartHour.toUTCString());
      console.log(' schedule roles:');
      // shift.shiftRoles.create.forEach((role, index) => {
      //   console.log('role ', { index }, ':', { role });
      // });
      console.log('--------------------');
    });
  }


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
      // const ShiftRolesDeleteRes = await this.prisma.userShiftRole.deleteMany({
      //   where: {
      //     shift: {
      //       shiftType: 'systemSchedule',
      //     },
      //   },
      // });

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
