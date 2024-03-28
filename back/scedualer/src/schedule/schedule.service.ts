import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import {
  userShift,
  userSchedule,
  user,
  typeOfShift,
  ScheduleMold,
  ShiftMold,
  ScheduleTime,
  shiftTimeClassification,
  SystemSchedule,
  systemShift,
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
import { elementAt, filter } from 'rxjs';
import { shiftUserPosseblity } from './dto/shiftUserPosseblity.dto';
import { UsershiftStats } from 'src/user-statistics/userShiftStats.dto';
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
type scheduleUsersShiftsStats = Map<
  number,
  {
    morning: { sum: number; keys: number[] };
    noon: { sum: number; keys: number[] };
    night: { sum: number; keys: number[] };
    longMorning: { sum: number; keys: number[] };
    longNight: { sum: number; keys: number[] };
    total: number;
  }
>;

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

      hoursCorrection = '6,0,0,0';
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
        await this.deleteScheduleTime(createRestDays.Id);
      }
      if (createScheduleTime.id) {
        await this.deleteSystemSchedule(createScheduleTime.id);
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

  async getNextScheduleForUser(userId: number, facilityId: number) {
    const timeBeforeDue = 4;
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
      const scheduleArr: userSchedule[] =
        await this.prisma.userSchedule.findMany({
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
      console.log(
        '--getnext schedule for user ---  found schedule in db',
        scheduleArr[0],
      );
      const nextSchedule: userSchedule = scheduleArr[0];
      console.log('next schedule for user', { nextSchedule });
      if (nextSchedule === null || !nextSchedule) {
        //Case no next schedule yet, create one.
        const startDate = new Date(adjusted.getTime());
        const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        const scedualDue: Date = new Date(startDate.getTime() - timeBeforeDue);

        const dto: scheduleDto = {
          scedualStart: startDate,
          scedualEnd: endDate,
          scedualDue: scedualDue,
          userId: userId,
          facilityId: facilityId,
        };
        console.log({ dto });
        const newSchedule: any = await this.createSchedualeForUser(dto);
        // console.log(nextSchedule);
        const nextSchedule: SystemSchedule = { ...newSchedule?.newSchedule };
        const scheduleShifts: ShiftDto[] = [...newSchedule?.scheduleShifts];
        console.log('next schedule 82 sched servic ', { nextSchedule });
        const tmpSchedule = {
          data: { ...nextSchedule },
          shifts: [...scheduleShifts],
        };
        return tmpSchedule;
      } else {
        const scheduleShifts =
          await this.shiftSercvice.getAllUserShiftsByScheduleId(
            nextSchedule.id,
          );
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
      const scheduleArr: SystemSchedule[] =
        await this.prisma.systemSchedule.findMany({
          where: {
            facilityId: facilityId,
            scheduleStart: {
              gt: currentDate,
            },
          },
          orderBy: {
            scheduleStart: 'asc',
          },
        });

      if (scheduleArr) {
        const nextSchedule: SystemSchedule = scheduleArr[0];
        if (nextSchedule) {
          const scheduleShifts: any =
            await this.shiftSercvice.getAllSystemShiftsByScheduleId(
              nextSchedule.id,
            );
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
  async getCurrentSchedule(facilityId) {
    const selctedSettings = await this.getSelctedScheduleMold(facilityId);
    const currentDate = new Date();
    console.log({ selctedSettings }, 'startDate from settings');
    if (selctedSettings !== false) {
      let diff = currentDate.getDay() - selctedSettings.scheduleTime.startDay;
      // Adjust the currentDate to get the startDay of the current week
      const startDate = new Date(
        currentDate.getTime() - diff * 24 * 60 * 60 * 1000,
      );
      startDate.setUTCHours(
        selctedSettings.scheduleTime.startHour,
        selctedSettings.scheduleTime.startMinutes,
        0,
        0,
      );

      //get first day of schedule,
      try {
        console.log(
          'get current schedule ',
          { startDate },
          selctedSettings.scheduleTime.startDay,
          diff,
        );
        const currentSchedule = await this.prisma.systemSchedule.findFirst({
          where: {
            facilityId: facilityId,
            scheduleStart: {
              lte: startDate,
            },
          },
          orderBy: {
            scheduleStart: 'asc',
          },
        });
        console.log('current sched start', currentSchedule);
        const currentScheduleShifts: systemShift[] = currentSchedule
          ? await this.shiftSercvice.getAllSystemShiftsByScheduleId(
              currentSchedule.id,
            )
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
    const schedExist: userSchedule = await this.prisma.userSchedule.findFirst({
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
    console.log(
      'Create schedule startDate',
      { startDate },
      { userId },
      scheduleDto.facilityId,
    );
    const newSchedule: userSchedule = await this.prisma.userSchedule.create({
      data: {
        userId: userId,
        scheduleStart: startDate,
        scheduleEnd: endDate,
        scheduleDue: scheduleDue,
        facilityId: scheduleDto.facilityId,
        isLocked: false,
      },
    });
    const type = 'user';
    const shiftsArr: ShiftDto[] = this.scheduleUtil.generateNewScheduleShifts(
      newSchedule.scheduleStart,
      newSchedule.scheduleEnd,
      newSchedule.id,
      schedulMold,
      type,
    );
    // console.log({shiftsArr});

    for (let i = 0; i < shiftsArr.length; i++) {
      const shift: userShift = await this.shiftSercvice.creatShift(
        scheduleDto.userId,
        shiftsArr[i],
        'user',
      );
      if (shift) {
        const userRef: user = await this.prisma.user.findUnique({
          where: {
            id: shift.userId,
          },
        });
        delete userRef.hash;
        // console.log({shift})
        scheduleShifts.push({
          ...shift,
          userRef: { ...userRef },
          shiftType: 'user',
          shiftRoleId: undefined,
        });
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
          shiftType: 'system',
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

  async getScheduleIdByDateAnduserId(
    id: number,
    startDate: Date,
    scheduleType: string,
  ) {
    const dateIso = new Date(startDate);
    console.log('get schedule ', { startDate }, { id });
    try {
      const schedule: SystemSchedule | userSchedule =
        scheduleType === 'systemSchedule'
          ? await this.prisma.systemSchedule.findFirst({
              where: {
                AND: [{ scheduleStart: startDate }, { facilityId: id }],
              },
            })
          : await this.prisma.userSchedule.findFirst({
              where: {
                AND: [{ scheduleStart: startDate }, { userId: id }],
              },
            });
      console.log(id, { schedule });
      return schedule;
    } catch (error) {
      console.log({ error }, error);
      if (error.code === 'P2025') {
        throw new ForbiddenException('shift not fond ');
      }
      throw new ForbiddenException(error);
    }
  }

  //This will get a ScheduleId and shiftsEditDto array and update the schedule shifts.
  async editeFuterSceduleForUser(
    scheduleId: number,
    shiftsToEdit: EditShiftByDateDto[],
  ) {
    console.log({ shiftsToEdit });
    try {
      const schedule = await this.prisma.userSchedule.findUnique({
        where: {
          id: scheduleId,
        },
      });

      const editedShifts: userShift[] = [];
      const existingShifts: userShift[] =
        await this.shiftSercvice.getAllUserShiftsByScheduleId(scheduleId);
      //contain user changes
      console.log(
        'edit shift',
        { shiftsToEdit },
        { existingShifts },
        scheduleId,
        shiftsToEdit[0],
      );

      existingShifts.forEach((shift: userShift) => {
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
              shiftType: 'user',
            };
            // console.log({ editShiftDto });

            const edited: userShift = await this.shiftSercvice.editUserShift(
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
  async getSubmmitedUsersSchedule(facilityId: number) {
    const dateToGet: Date = this.getNextDayDate(undefined);

    const allUsersShifts = this.getAllUsersForSchedule(
      dateToGet,
      undefined,
      undefined,
      facilityId,
    );
    const users = (await allUsersShifts).map(
      (userShifts) => Object.values(userShifts)[0].userId,
    );
    return users;
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
    selectedUsersIds: number[] | undefined,
    roleId: number | undefined,
    facilityId,
  ) {
    const schedules: Record<
      string,
      {
        userId: number;
        roleId: number;
        userPreference: string;
        userShiftId: number;
      }
    >[] = []; // Initialize as an empty array
    // console.log('get all users of the facility ', { facilityId }, { roleId });
    const allUsers: user[] = await this.userService.getAllUsers(facilityId);
    // console.log({ allUsers });
    let filteredUsers: user[];

    if (selectedUsersIds && selectedUsersIds.length > 0) {
      filteredUsers = allUsers.filter((user) =>
        selectedUsersIds.some((selectedUser) => selectedUser === user.id),
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
        'user',
      );
      if (schedule && schedule.id) {
        //schdule is not null
        // console.log('schedule id ', schedule?.id);
        const shiftsForSchedule =
          await this.shiftSercvice.getAllUserShiftsByScheduleId(schedule.id);
        // console.log({ shiftsForSchedule });
        const sortdShifts: userShift[] = shiftsForSchedule.sort(
          (a, b) => a.shiftStartHour.getTime() - b.shiftStartHour.getTime(),
        );
        const shiftsMap = sortdShifts.reduce((map, shift) => {
          if (shift.userPreference !== '0') {
            map[shift.shiftStartHour.toISOString()] = {
              userId: shift.userId,
              roleId: user.id,
              userPreference: shift.userPreference,
              userShiftId: shift.id,
            };
            return map;
          }
        }, {});

        // console.log('uswer Pref  ', { shiftsMap });
        if (shiftsMap) {
          schedules.push(shiftsMap); // Push each filtered shifts array
          // console.log('one user Shifts ', {filterdShifts});
        }
      }
    }
    // console.log('all users Shifts ', schedules[0]);
    // if(schedules.length < 2){//Not enough users
    //   console.log("error")
    //   throw new ForbiddenException('There is no users ')

    // }
    return schedules;
  }

  async getUsersForSchedule(users: user[], startingDate: Date) {
    //for each user get schedule and save it in schedules arr
    const schedules: userShift[][] = [];
    // console.log({ users }, startingDate);
    for (const user of users) {
      const schedule: userSchedule | any =
        await this.getScheduleIdByDateAnduserId(
          user.id,
          startingDate,
          'systemSchedule',
        );
      console.log(schedule !== null && schedule !== undefined, { schedule });
      if (schedule !== null && schedule !== undefined) {
        const shiftsForSchedule: userShift[] =
          await this.shiftSercvice.getAllUserShiftsByScheduleId(schedule?.id);

        // filter empty shifts
        const filterdShifts: userShift[] = shiftsForSchedule.filter(
          (item: userShift) => item.userPreference !== '0',
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
  async getScheduleById(schedualId: number, scheduleType: string) {
    try {
      return scheduleType === 'systemSchedule'
        ? await this.prisma.systemSchedule.findUnique({
            where: {
              id: schedualId,
            },
            include: {
              shifts: true,
            },
          })
        : await this.prisma.systemSchedule.findUnique({
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
  // async replaceShifts(shift1: shift | number, shift2: shift | number) {
  //   let shift1obj: ShiftDto;
  //   let shift2obj: ShiftDto;

  //   if (typeof shift1 === 'number') {
  //     shift1obj = await this.shiftSercvice.getShiftById(shift1);
  //   } else {
  //     shift1obj = { ...shift1 };
  //   }
  //   if (typeof shift2 === 'number') {
  //     shift2obj = await this.shiftSercvice.getShiftById(shift2);
  //   } else {
  //     shift2obj = { ...shift2 };
  //   }
  //   if (shift1obj.scheduleId === shift2obj.scheduleId) {
  //     // get schedule
  //     const schedule: schedule = await this.getScheduleById(
  //       shift1obj.scheduleId,
  //     );
  //     // const scheduleShifts: shift[] = schedule.shifts;
  //     // if (this.scheduleUtil.isShiftpossible(shift1obj, schedule)) {
  //     //   //update new shift
  //     //   const newShift: shift = await this.shiftSercvice.updateShiftById(
  //     //     shift1obj,
  //     //     shift2obj,
  //     //   );
  //     //   return newShift;
  //     // }
  //   }
  //   return undefined;
  // }

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
        shiftType: 'system',
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
  ) {
    // Initialize an empty object to store shifts by role ID, where each role ID maps to an object
    const scheduleShiftsByRoles: Record<
      number,
      Record<string, { shift: SystemShiftDTO; options: shiftUserPosseblity[] }>
    > = {};
    let tmpId = 0;
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
        scheduleShiftsByRoles[roleId][shiftKey] = {
          shift: { ...shift, tmpId: tmpId },
          options: [],
        };
        tmpId++;
      });
    }

    return scheduleShiftsByRoles;
  }

  async createEmptySystemSchedule(
    startDate: Date,
    endDate: Date,
    facilitId: number,
    moldId: number,
  ) {
    try {
      const newSchedule: SystemSchedule =
        await this.prisma.systemSchedule.create({
          data: {
            scheduleStart: startDate,
            scheduleEnd: endDate,
            facilityId: facilitId,
            isSelected: false,
            moldId: moldId,
          },
        });
      console.log('generate new Schedule , Line::971', { newSchedule });
      return newSchedule;
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }
  getAllShiftKeysForUser(userId, userData) {
    let allShiftKeys = [];
    console.log('userData --', { userData });

    if (!userData) {
      console.log(`No data found for user ID ${userId}`);
      return allShiftKeys;
    }

    // Iterate over each shift type (e.g., 'morning', 'noon', 'night') in the userData
    for (const shiftType in userData) {
      console.log('shiftType---', { shiftType });

      // Ensure we skip the 'total' property and any inherited properties
      if (userData.hasOwnProperty(shiftType) && shiftType !== 'total') {
        // Concatenate the keys for each shift type to the allShiftKeys array
        allShiftKeys = allShiftKeys.concat(userData[shiftType].keys);
      }
    }

    return allShiftKeys;
  }
  getAllUserShiftsInSchedule(userId, scheduleShifts) {
    const userShifts = scheduleShifts.filter(
      (shift) => shift.shift.userId === userId,
    );
    console.log('userShifts in schedule ---', { userShifts });
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
  isShiftPossible(shiftToAssign, userId: number, scheduleShifts) {
    console.log(
      'is shift possible shiftToAssign: ',
      { shiftToAssign },
      { scheduleShifts },
    );
 
    //Check in userShiftMap instad.
    const allUserhifts = this.getAllUserShiftsInSchedule(
      userId,
      scheduleShifts,
    );
    console.log('all user shifts in sechdule ', { userId });

    const eightHoursInMilliseconds = 8 * 60 * 60 * 1000;

    const underShiftLimit = allUserhifts.length < maxAmountOfShifts;
    const sameDayShift = allUserhifts?.filter((shift) => {
      console.log("shift::::::",shift.shift,{shift},{shiftToAssign})
      return (
        (shift.shift.shiftStartHour.toISOString().substring(0, 10) ===
          shiftToAssign.shiftStartHour.toISOString().substring(0, 10) &&
          Math.abs(
            shiftToAssign.shiftStartHour.getTime() -
              shift.shift.shiftEndHour.getTime(),
          ) <= eightHoursInMilliseconds) ||
        Math.abs(
          shiftToAssign.shiftEndHour.getTime() - shift.shift.shiftStartHour.getTime(),
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
    return sameDayShift.length < 1;
  }

  assignScheduleShifts(scheduleAndShifts) {
    const noUserShifts = [];
    const assignedShifts = [];
    const shiftsToAssign = { ...scheduleAndShifts.shifts };

    const userShiftStats = new Map();
    console.log('assign shifts, schedule = ', { scheduleAndShifts });

    Object.entries(shiftsToAssign).map(([key, shifts]) => {
      while (Object.keys(shifts).length > 0) {
        const shiftWithLeast = this.findShiftWithLeastOptions(
          Object.values(shifts),
        );
        console.log(
          'shift to assign ,userShiftStats:',
          userShiftStats,
          { shiftsToAssign },
          { shiftWithLeast },
          Object.keys(shifts).length,
        );

        const assignedShift = this.assignShift(
          shiftWithLeast,
          assignedShifts,
          shiftsToAssign[key],
          userShiftStats,
        );

        console.log('assigned 1238', { assignedShift });

        if (!assignedShift) {
          noUserShifts.push({ ...shiftWithLeast });
          console.log('no possible users ::1170 , shift:', { shiftWithLeast });
          delete shiftsToAssign[key][
            shiftWithLeast.shift.shiftStartHour.toISOString()
          ];
          console.log(
            'removed shifts',
            shiftsToAssign[key][
              shiftWithLeast.shift.shiftStartHour.toISOString()
            ],
          );
        } else {
          assignedShifts.push({ ...assignedShift });
          console.log('possiblwe', assignedShift);
          delete shiftsToAssign[key][
            assignedShift.shift.shiftStartHour.toISOString()
          ];
          console.log({ assignedShift });

          if (!userShiftStats.has(assignedShift.shift.userId)) {
            // Initialize user stats if they don't exist
            userShiftStats.set(assignedShift.shift.userId, {
              morning: { sum: 0, keys: [] },
              noon: { sum: 0, keys: [] },
              night: { sum: 0, keys: [] },
              longmorning: { sum: 0, keys: [] },
              longnight: { sum: 0, keys: [] },
              total: 0,
            });
          }

          const currentUserStats = userShiftStats.get(
            assignedShift.shift.userId,
          );
          //Shift Stats
          this.updateStats(currentUserStats, assignedShift.shift, 1);
        }
        //   }
      }
    });

    // change the day into two shifts
    const longShiftsEnabeld = true;

    if (noUserShifts.length > 0) {
      if (longShiftsEnabeld) {
        console.log({ noUserShifts }, 'no user shifts :');

        for (let i = noUserShifts.length - 1; i >= 0; i--) {
          const noUserShift = noUserShifts[i];
          console.log('shift to change:', { noUserShift }, i);
          const res = this.changeDayIntoTwoShifts(
            noUserShift,
            assignedShifts,
            userShiftStats,
          );
          console.log('res of change:', { res });
          if (res) {
            console.log('remove shift at index:', i, noUserShift);
            noUserShifts.splice(i, 1);
            //update shift map
          }

          if (!res) {
          }
        }
        console.log('no users shifts', { noUserShifts }, { assignedShifts });
      }
    }
    console.log('shifts to assign', { assignedShifts });
    return {
      assigend: assignedShifts,
      unAssigend: noUserShifts,
      userShiftStats: userShiftStats,
    };
  }

  getDayShiftsFromSchedule(shift, assignedSchedule) {
    // console.log(
    //   'get day shifts ',
    //   { shift },
    //   assignedSchedule[assignedSchedule.length - 1],
    // );
    const dayShifts = assignedSchedule.filter((assigedShift) => {
      console.log('get day shifts 1295, assigned shift ', assigedShift.shift.shift);
      return (
        assigedShift.shift.shiftStartHour.toISOString().substring(0, 10) ===
          shift.shift.shiftStartHour.toISOString().substring(0, 10) &&
        shift.shift.shiftRole.roleId === assigedShift?.shift.shiftRole?.roleId
      );
    });
    if (dayShifts.length > 0) {
      console.log('day shifts got:', dayShifts.length);
      return dayShifts;
    }
    return [];
  }
  adjustShiftHours(
    shiftToAdjust,
    newStartHour: Date,
    type: string,
    typeOfShift = 'long',
  ) {
    console.log('adjustt time', { newStartHour }, { shiftToAdjust }, { type });
    const shift = shiftToAdjust?.shift ? shiftToAdjust.shift : shiftToAdjust;
    let adjustedStartHour = new Date(shift.shiftStartHour.getTime());
    if (type === 'shiftStartHour') {
      adjustedStartHour.setUTCHours(
        newStartHour.getHours(),
        newStartHour.getMinutes(),
        0,
        0,
      );
      shiftToAdjust.shiftStartHour = adjustedStartHour;
    } else if (type === 'shiftEndHour') {
      let adjustedEndHour = new Date(shift.shiftEndHour.getTime());
      adjustedEndHour.setUTCHours(
        newStartHour.getHours(),
        newStartHour.getMinutes(),
        0,
        0,
      );
      shiftToAdjust.shiftEndHour = adjustedEndHour;
    }
    shiftToAdjust.typeOfShift = typeOfShift;
    return shiftToAdjust;
  }
  updateStats = (
    userStats: any,
    shiftToUpdate: any,
    amount: number,
  ) => {
    const localShift = shiftToUpdate.shift? shiftToUpdate.shift:shiftToUpdate;
    console.log('shiftToUpdate:',shiftToUpdate,shiftToUpdate.shift);
    const shiftKey = `${localShift.typeOfShift === 'short' ? '' : 'long'}${
      localShift.shiftTimeName
    }`;
    console.log({ shiftKey }, { userStats }, { amount });
    userStats[shiftKey].sum = userStats[shiftKey].sum + amount;

    //keys
    amount > 0
      ? userStats[shiftKey].keys.push(
        localShift.shiftStartHour.toISOString(),
        )
      : userStats[shiftKey].keys.filter((shift) => {
          console.log({ shift });
          return localShift.shiftStartHour.toISOString() !== shift;
        });
    userStats['total'] = userStats['total'] + amount;
    console.log('user stats:', { shiftKey }, { userStats }, { amount });
  };
  updateAssignedSchedule(assignedSchedule, shiftsToUpdate, userShiftStats) {
    //Change the assigned schdule provided. if shiftToUpdate not in Assigned -> add it
    console.log('shifts to update:', { shiftsToUpdate });

    // Check if shiftsToUpdate is truthy and not empty
    if (!shiftsToUpdate || shiftsToUpdate.length === 0) {
      return;
    }
    shiftsToUpdate.forEach((shiftToUpdate) => {
      console.log('update shift', { shiftToUpdate }, { userShiftStats });
      //find shift in the assiged schedule
      const index = assignedSchedule.findIndex(
        (shiftInAssiged) =>
          shiftInAssiged.shift.tmpId === shiftToUpdate.shift.tmpId,
      );
      if (index === -1) {
        assignedSchedule.push({ ...shiftToUpdate });
        //add to user shift stats
        if (shiftToUpdate.shift.userId !== undefined) {
          const userStats = userShiftStats.get(shiftToUpdate.shift.userId);
          this.updateStats(userStats, shiftToUpdate, 1);
        }
      } else {
        if (shiftToUpdate.shift.userId === undefined) {
          const userStats = userShiftStats.get(
            assignedSchedule[index].shift.userId,
          ); //case user changing to undfind
          this.updateStats(userStats, assignedSchedule[index].shift, -1);
        } else {
          const userStats = userShiftStats.get(
            assignedSchedule[index].shift.userId,
          );
          this.updateStats(userStats, shiftToUpdate.shift, 1);
          this.updateStats(userStats, assignedSchedule[index].shift, -1);
        }

        assignedSchedule[index].shift = { ...shiftToUpdate.shift };
      }
    });
    console.log('assigned schedule after change:', { userShiftStats });

    return assignedSchedule;
  }
  createNoonCanceledShift(shift) {
    return {
      ...shift,
      shiftTimeName: shiftTimeClassification.noonCanceled,
      userId: undefined,
    };
  }
  changeDayIntoTwoShifts(shiftToAssign, assignedSchedule, usersShiftStats) {
    console.log('change into two shifts ', { shiftToAssign },);
    const dayShiftDTOs = this.getDayShiftsFromSchedule(
      shiftToAssign,
      assignedSchedule,
    );
    // let morning= {shift:{},shiftOptions:[]}
    // let noon= {shift:{},shiftOptions:[]};
    // let night = {shift:{},shiftOptions:[]};
    let morning, noon, night;

    const mode: 'missing' | 'replace' = !shiftToAssign.shift.userId
      ? 'missing'
      : 'replace';
    if (dayShiftDTOs.length === 0 || dayShiftDTOs.length < 2) return false; // Ensure we have at least two shifts to work with
    const adjustedDate = new Date(shiftToAssign.shift.shiftStartHour);
    adjustedDate.setUTCHours(18, 0, 0, 0);
console.log("mode",{mode})
    switch (shiftToAssign.shift.shiftTimeName) {
      case 'night':
        if (mode === 'missing') {
          //Check night user not assigned to morning after and pass constrains, **TOADD - is shift possible test .
          const nextShiftKey = assignedSchedule.findIndex(
            (assigedShift) =>
              shiftToAssign.shift.shiftStartHour.toISOString() ===
              assigedShift.shift.shiftStartHour.toISOString(),
          );
          if (
            assignedSchedule[nextShiftKey + 1].shift.userId ===
            dayShiftDTOs[1].shift.userId
          )
            return false;
        }
        morning = {
          shift: {
            ...dayShiftDTOs[0].shift,
            shiftEndHour: adjustedDate,
            typeOfShift: 'long',
          },
          shiftOptions: { ...dayShiftDTOs[0].shiftOptions },
        };
        // morning.shiftOptions = [...dayShiftDTOs[0].shiftOptions]
        night = {
          shift: {
            ...shiftToAssign.shift,
            shiftStartHour: adjustedDate,
            userId: dayShiftDTOs[1].shift.userId,
            typeOfShift: 'long',
          },
          shiftOptions: {
            ...shiftToAssign.shiftOptions,
          },
        };
        // night = {...shiftToAssign.shiftOptions}
        noon = {
          shift: { ...this.createNoonCanceledShift(dayShiftDTOs[1].shift) },
          shiftOptions: {...dayShiftDTOs[1].shiftOptions},
        };

        console.log(
          'shift changed night miss: ',
          { morning },
          { noon },
          { night },
        );
        break;

      case 'morning':
        console.log(
          'morning to change origlinal:',
          { shiftToAssign },
          dayShiftDTOs[0],
          dayShiftDTOs[1],
        );
        morning = { shift:{...shiftToAssign.shift},shiftOptions:{...shiftToAssign.shiftOptions} };
        // morning.shiftOptions = {...shiftToAssign.shiftOptions}
        night =
          mode === 'replace'
            ?{shift: {
                ...dayShiftDTOs[2].shift,
                shiftStartHour: adjustedDate,
                typeOfShift: 'long',
              },
              shiftOptions:{...dayShiftDTOs[2].shiftOptions}}
            : {shift:{
                ...dayShiftDTOs[1].shift,
                shiftStartHour: adjustedDate,
                typeOfShift: 'long',},
                shiftOptions: {...dayShiftDTOs[1].shiftOptions}
              };
        // this.updateStats(stats,noon,-1)
        noon =
          mode === 'replace'
            ? {
                shift: {
                  ...this.createNoonCanceledShift(dayShiftDTOs[1].shift),
                },
                shiftOptions:{ },
              }
            : {
                shift: {
                  ...this.createNoonCanceledShift(dayShiftDTOs[0].shift),
                },
                shiftOptions: {  },
              };
        console.log(
          'shift changed morning miss : ',
          { morning },
         'noon after change', { noon },
          { night },
        );
        break;
      case 'noon':
        console.log('noon', dayShiftDTOs[0], dayShiftDTOs[1], {
          shiftToAssign,
        });
        morning = {
          shift: {
            ...dayShiftDTOs[0].shift,
            shiftEndHour: adjustedDate,
            typeOfShift: 'long',
          },
          shiftOptions: { ...dayShiftDTOs[0].shiftOptions },
        };
        night =
          mode === 'missing'
            ? {
                shift: {
                  ...dayShiftDTOs[1].shift,
                  typeOfShift: 'long',
                  shiftStartHour: adjustedDate,
                },
                shiftOptions: { ...dayShiftDTOs[1].shiftOptions },
              }
            : {
                shift: {
                  ...dayShiftDTOs[2].shift,
                  typeOfShift: 'long',
                  shiftStartHour: adjustedDate,
                },
                shiftOptions: { ...dayShiftDTOs[2].shiftOptions },
              };
        noon =
          mode !== 'missing'
            ? {
                shift: {
                  ...this.createNoonCanceledShift(dayShiftDTOs[1].shift)
                },
                shiftOptions: {},
              }
            : 
              {
                shift:{...this.createNoonCanceledShift(shiftToAssign.shift)},shiftOptions:{} }
        console.log('shift changed : ', { morning }, { noon }, { night });
        break;
    }
    //update shift stats ->

    const updatedSched = this.updateAssignedSchedule(
      assignedSchedule,
      [morning, noon, night],
      usersShiftStats,
    );
    console.log(
      'assigned after 2 change ',
      { assignedSchedule },
      'update sched',
      { updatedSched },
    );
    return true;
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
    //return the key of the next shift in the schedule .

    console.log({ shiftsMap });
    const entries = Object.entries(shiftsMap); // Convert to entries array
    console.log({ entries }, currentShiftKey);
    for (let i = 0; i < entries.length; i++) {
      if (entries[i][0] === currentShiftKey && i + 1 < entries.length) {
        // Return the key of the next shift if the current key matches and there is a next shift
        console.log(entries[i][0], { currentShiftKey });
        return entries[i + 1][0]; // Return the key of the next shift
      }
    }
    return null; // Return null if no next shift is found
  }

  assignShift(shiftAndOptions, assignedShifts, shiftsMap, userShiftStats) {
    console.log('assign shift start', { userShiftStats });
    //check all options and pick the best option
    //concidering the other shifts user has on the schedule
    const assignedShift = shiftAndOptions.shift;
    const maxAmountOfShifts = 6;
    const newShift = shiftAndOptions;
    // Filter possible shifts
    const possibleShifts = shiftAndOptions.shiftOptions.filter((shift) => {
      // Check if the shift is possible based on your custom logic
      console.log('shift options :', { shift });
      const isPossible = this.isShiftPossible(
        shiftAndOptions.shift,
        shift.userId,
        assignedShifts,
      );
      console.log({ isPossible }, 'user Shift Stats before assign', {
        userShiftStats,
      });
      // Safely check if the user has reached the max amount of shifts
      let totalShifts = 0;
      if (userShiftStats.get(shift.userId)) {
        totalShifts = userShiftStats.get(shift.userId).total || 0;
      }
      console.log(
        'possible shifts : ',
        { isPossible },
        { totalShifts },
        maxAmountOfShifts,
      );

      // Check if adding this shift would exceed the maximum allowed shifts
      return isPossible && totalShifts < maxAmountOfShifts;
    });
    console.log('possible shifts : ', { possibleShifts });

    if (possibleShifts.length < 1) {
      return false;
    }
    if (possibleShifts.length === 1) {
      //only option
      assignedShift.userId = possibleShifts[0].userId;
    }
    const selectIndex = () => {
      // Assuming userShiftStats and assignedShift are defined elsewhere and accessible
      const sortedShifts = [...possibleShifts].sort((a, b) => {
        // Calculate the sum of shifts for both a and b
        const aSameShiftsCount =userShiftStats[a.userId] && userShiftStats[a.userId][assignedShift.shiftTimeName] ?userShiftStats[a.userId][assignedShift.shiftTimeName].sum : 1
        const bSameShiftsCount = userShiftStats[b.userId] && userShiftStats[b.userId][assignedShift.shiftTimeName] ?userShiftStats[b.userId][assignedShift.shiftTimeName].sum : 1;
    
        const aScore = (a.userPreference * 0.75) + ((1 - aSameShiftsCount) * 0.25); // Inverting shift count as we prefer fewer shifts
        const bScore = (b.userPreference * 0.75) + ((1 - bSameShiftsCount) * 0.25); // Same here
    
        // Return the comparison of aScore and bScore. The higher score comes first
        return bScore - aScore; // Descending order
      });
    
      // After sorting, the best match is the first element
      return sortedShifts.length > 0 ? possibleShifts.indexOf(sortedShifts[0]) : -1;
    };
    const selectedInedx = selectIndex();
    
    //make sure user is not nedeed for next shift, if needed -> try assign other shift else ->remove user from next shift
    const nextShiftKey = this.getNextShiftKeyInMap(
      shiftAndOptions.shift.shiftStartHour.toISOString(),
      shiftsMap,
    );
    console.log(
      'next shift Key = ',
      nextShiftKey,
      { shiftsMap },
      shiftsMap[nextShiftKey],
    );
    if (
      nextShiftKey &&
      shiftsMap[nextShiftKey].options.length === 1 &&
      shiftsMap[nextShiftKey].options[0].userId ===
        possibleShifts[selectedInedx].userId
    ) {
      console.log(':::1265::: user is only option for next shift ');
    }
    assignedShift.userId = possibleShifts[selectedInedx].userId;
    assignedShift.userPreference = possibleShifts[selectedInedx].userPreference;
    //remove user from options of same day and next 8 hours
    console.log(shiftsMap);
  
    nextShiftKey &&
      this.updateShiftOptions(
        shiftsMap[nextShiftKey],
        possibleShifts[selectedInedx],
        'remove',
      );
    console.log({ assignedShift }, shiftsMap[nextShiftKey]);
    newShift.shift = assignedShift;
        newShift.shiftOptions =   [...this.updateShiftOptions(
          shiftsMap[assignedShift.shiftStartHour.toISOString()],
          possibleShifts[selectedInedx],
          'remove',
        )]
    // return assignedShift;
    return newShift;
  }
  updateShiftOptions(shiftToUpdate, option, action: 'remove' | 'add') {
    //update the options of shift.
    const newOptions =
      action === 'remove'
        ? shiftToUpdate.options.filter(
            (optionToCheck) => option.userId !== optionToCheck.userId,
          )
        : shiftToUpdate.shiftOptions.push(option);

    shiftToUpdate.options = [...newOptions];
    console.log('new options ', { shiftToUpdate },{action});
    return shiftToUpdate.options
  }
  /**
   * @description Create the a system schedule for the date provided.
   * @param {generateScheduleForDateDto} dto
   * @memberof ScheduleService
   */
  async createSystemSchedule(dto: generateScheduleForDateDto) {
    console.log('Create sys schedule service 903', dto);
    //create map to contain the userStatistics
    const selectedUsers = dto.selctedUsers;
    console.log(dto.selctedUsers, ' user?List`');
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
    const newSchedule: SystemSchedule = await this.createEmptySystemSchedule(
      normelizedStartDate,
      normelizedendDate,
      dto.facilityId,
      currentMold.id,
    );
    if (!newSchedule) {
      throw new ForbiddenException('907 sched service currentmold ');
    }
    const newScheduleAndShifts = { schedule: newSchedule, shifts: {} };
    //Generate empty shift object from mold, include empty roles
    const emptyShifts: Record<
      number,
      Record<string, { shift: SystemShiftDTO; options: shiftUserPosseblity[] }>
    > = this.genrateEmptySysSchedShifts(
      normelizedStartDate,
      newSchedule.id,
      currentMold.shiftsTemplate,
    );
    console.log('Print empty sched ', { emptyShifts });

    newScheduleAndShifts.shifts = emptyShifts;
    //add options to emptyShifts
    await this.addUserOptionsToEmptySystemShifts(
      newScheduleAndShifts,
      selectedUsers,
    );
    console.log(
      'tmp sched and options ',
      { newScheduleAndShifts },
      newScheduleAndShifts.shifts,
      selectedUsers,
    );
    // this.printSchedule({newScheduleAndShifts},"tmpSched");
    const assigedShifts = this.assignScheduleShifts(newScheduleAndShifts);
    console.log('assigned ', { assigedShifts }, assigedShifts.unAssigend);
    //deal with unassigned shifts.
    const noUserShifts = [...assigedShifts.unAssigend];
    let index = 0;

    for (let i = 0; i < noUserShifts.length; i++) {
      const shiftToAssign = { ...noUserShifts[i] };
      console.log(
        'handel missing shift',
        { shiftToAssign },
        shiftToAssign.shiftOptions,
      );
      shiftToAssign.shiftOptions.forEach((element) => {
        console.log('shift option', { element });
      });
      if (shiftToAssign.shiftOptions && shiftToAssign.shiftOptions.length > 0) {
        const userOptionsShifts = [];
        shiftToAssign.shiftOptions.forEach((option) => {
          //check if user reached max shifts.
          // console.log(assigedShifts.userShiftStats,assigedShifts.userShiftStats.get(option.userId))
          if (assigedShifts.userShiftStats.get(option.userId).total === 6) {
            //if yes, add user and shift to
            const shiftsToUnAssign = this.getAllUserShiftsInSchedule(
              option.userId,
              assigedShifts.assigend,
            ).filter((shift) => shift.typeOfShift === 'short');
            console.log('shifts to assign in two shift:', { shiftsToUnAssign });
            shiftsToUnAssign && userOptionsShifts.push(shiftsToUnAssign);
          }
        });
        console.log(
          { userOptionsShifts },
          'userOptinShifts',
          userOptionsShifts[0],
        );
        //change one othe shift into two shifts a day and then
        if (userOptionsShifts[0] && userOptionsShifts[0][0]) {
          console.log('change htis shift:', userOptionsShifts[0][0]);
          this.changeDayIntoTwoShifts(
            userOptionsShifts[0][0],
            assigedShifts.assigend,
            assigedShifts.userShiftStats,
          );
          const newShift = {
            shift: {
              ...shiftToAssign.shift,
              userId: userOptionsShifts[0][0].userId,
            },
            shiftOptions: { ...shiftToAssign.shiftOptions },
          };
          console.log(
            'newShiftAdter unassign',
            { newShift },
            typeof newShift.shift.shiftStartHour,
            newShift.shift.shiftStartHour.toISOString().substring(1, 10),
          );
          assigedShifts.assigend.push(newShift);
          //remove user from next shift option.
          //get day shifts in no userShifts.

          noUserShifts.map((shift) => {
            // console.log({shift})
            if (
              newShift.shift.shiftStartHour.toISOString().substring(1, 10) ===
                shift.shift.shiftStartHour.toISOString().substring(1, 10) &&
              newShift.shift.shiftRole.roleId ===
                shift.shift.shiftRole.roleId &&
              newShift.shift.tmpId !== shift.shift.tmpId
            ) {
              shift.shiftOptions = shift.shiftOptions.filter(
                (shiftToUpdate) =>
                  shiftToUpdate.userId !== newShift.shift.userId,
              );
              // console.log("new options",shift.shiftOptions);
            }
          });
          console.log('reduxed arr');
          noUserShifts.splice(i, 1);
        }
      }
    }
    //Add no user Shifts into the assigned schedule->
    noUserShifts.forEach((element) => {
      // console.log("element no user to push",{element} )
      assigedShifts.assigend.push(element);
    });
    //Create the shifts  .
    // const createRes = await this.createScheduleShifts(assigedShifts.assigend);

    // this.shiftStats.createUsersStatsForScheduleShift(assigedShifts.userShiftStats,newSchedule.id);
    // console.log({ createRes });
    // const shifts = assigedShifts.assigend.map((shift) => {
    //   console.log("shift to create", {shift});
    //   const tmp = {
    //     ...shift,
    //     shiftRoleId: shift.shiftRole.roleId,
    //     shiftName: shift.shiftTimeName + ' ' + shift.shiftRole.role.name,

    //   };
    //   // delete tmp.shiftRole;
    //   delete tmp.shiftType;
    //   delete tmp.tmpId;
    //   return tmp;
    // });
    return { shifts:[...assigedShifts.assigend],stats:[ ...assigedShifts.userShiftStats]} ;
  }
  async setSystemSchedule(dto: { [key: string]: any }) {
    console.log("dto of set sched", { dto });
  

    const shifts = Object.values(dto).map((item) => {

      if (!item.shift || !item.shift.shiftRole) {
        // Handle cases where 'shift' or 'shift.shiftRole'  undefined
        console.error("Invalid shift data:", item);
        return null;
      }
  
      console.log({ item });
      const tmpShift: SystemShiftDTO = {
        ...item.shift,
     
      };
  

  
      return tmpShift;
    }).filter(shift => shift !== null); // Filter out any nulls from invalid data
  
    console.log({ shifts });
  
    // Assuming createScheduleShifts method exists and can process the shifts array
    const createRes = await this.createScheduleShifts(shifts);
    // this.shiftStats.createUsersStatsForScheduleShift(assigedShifts.userShiftStats,newSchedule.id);
    // console.log({ createRes });
    // const shifts = dto.shifts.assigedShifts.assigend.map((shift) => {
    //   console.log("shift to create", {shift});
    //   const tmp = {
    //     ...shift,
    //     shiftRoleId: shift.shiftRole.roleId,
    //     shiftName: shift.shiftTimeName + ' ' + shift.shiftRole.role.name,

    //   };
    //   // delete tmp.shiftRole;
    //   delete tmp.shiftType;
    //   delete tmp.tmpId;
    //   return tmp;
    // });
    console.log({createRes})
  }
  async createScheduleShifts(scheduleShiftsToCreate: SystemShiftDTO[]) {
    const mapedShifts = scheduleShiftsToCreate.map((shift) => {
      console.log('shift to create', { shift });
      const tmp = {
        ...shift,
        shiftRoleId: shift.shiftRole.roleId,
        shiftName: shift.shiftTimeName + ' ' + shift.shiftRole.role.name,
      };
      delete tmp.shiftRole;
      delete tmp.shiftType;
      delete tmp.tmpId;
      return tmp;
    });
    try {
      const res = await this.prisma.systemShift.createMany({
        data: mapedShifts,
      });
      return res;
    } catch (error) {
      console.log('error msg', error.message);
    }
  }
  async addUserOptionsToEmptySystemShifts(
    scheduleAndShifts,
    selectedUsers: number[],
  ) {
    //Get all users for the schedule , for every shift
    //add options.
    // console.log({scheduleAndShifts})
    for (const [key, roleShifts] of Object.entries(scheduleAndShifts.shifts)) {
      console.log('add users shifts ', { key }, { roleShifts }, selectedUsers);
      const usersShifts = await this.getAllUsersForSchedule(
        scheduleAndShifts.schedule.scheduleStart,
        selectedUsers,
        Number(key),
        scheduleAndShifts.schedule.facilitId,
      );
      console.log('users Shifts|::', Object.values(usersShifts),Object.values(usersShifts[0]).length); //user Shifts for role - key
      if (Object.values(usersShifts[0]).length < 2) {
        console.log('error in adding options to shifts ');
        throw new ForbiddenException('There is no users ');
      }
      Object.entries(roleShifts).forEach(([shiftDate, shiftDetails]) => {
        if (shiftDetails.options.length === 0) {
          const availableUsers = [];
          usersShifts.forEach((userOptions) => {
            //  console.log({userOptions})
            userOptions[shiftDate] !== undefined &&
              userOptions[shiftDate].userPreference !== '3' &&
              availableUsers.push(userOptions[shiftDate]);
            // return user.isAvailableOn(shiftDate);
          });
          console.log('availble users in add options ', { availableUsers });
          // Add these options to the shift
          shiftDetails.options = availableUsers;
        }
      });
    }
    // console.log({scheduleAndShifts},scheduleAndShifts.shifts,scheduleAndShifts.shifts[1]['2024-02-18T06:00:00.000Z'].options)
    return scheduleAndShifts;
  }
  printSchedule(schedule, headline) {
    console.log('print this :  ', headline, { schedule });
    Object.values(schedule).forEach((shifts) => {
      console.log('shifts length:', typeof shifts);
      Object.values(shifts).forEach((shift) => {
        console.log('--------------------');
        console.log('shift: ', { shift });
        console.log('--------------------');
      });
    });
  }

  async deleteSystemSchedule(scheduleId: number) {
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
      const res = await this.prisma.systemSchedule.delete({
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
  async deleteAllSystemSchedules(facilityId) {
    console.log('try delete ');

    try {
      //delete all the reqestes - to fix
      const resultDeleteRequests = await this.prisma.userRequest.deleteMany();

      if (!resultDeleteRequests) {
        console.log('no resultes for req compete delete ');
      }

      const res = await this.prisma.systemSchedule.deleteMany({
        where: {
          facilityId: facilityId,
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
