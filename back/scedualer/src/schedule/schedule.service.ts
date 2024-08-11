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
const dayToSubmit: number = 6; // the day number in which userSched is not editable

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

type ScheduleMoldWithTime = ScheduleMold & {
  scheduleTime: ScheduleTime;
  shiftsTemplate: ShiftMold[];
};
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

    // console.log({ adjusted }, 'adjusted Date');
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
      throw new ForbiddenException('Error in creating schedule time', {
        cause: error,
      });
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
      throw new ForbiddenException('Error in deleting schedule time', {
        cause: error,
      });
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
        throw new HttpException('Error in creating new mold', 400, {
          cause: new Error('Failed to create shifts and preferences'),
        });
      }
    } catch (error) {
      // console.log({ error });
      if (createRestDays?.id) {
        await this.deleteScheduleTime(createRestDays.id);
      }
      if (createScheduleTime?.id) {
        await this.deleteSystemSchedule(createScheduleTime.id);
      }

      throw new HttpException('Error in creating new mold', 400, {
        cause: new Error('Error in creating new mold '),
      });
    }
  }
  async getSelctedScheduleMold(facilityId: number) {
    console.log('selcted mold for facilityId', { facilityId });
    try {
      // Check if there's already a selected entry
      const res: ScheduleMoldWithTime =
        await this.prisma.scheduleMold.findFirst({
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
      return res;
    } catch (error) {
      throw new ForbiddenException('Error in getting selected schedule mold', {
        cause: error,
      });
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
      throw new ForbiddenException('Error in getting next schedule for user', {
        cause: error,
      });
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
      throw new ForbiddenException('Error in creating schedule for user', {
        cause: error,
      });
    }
  }
  async getCurrentSchedule(facilityId) {
    const selctedSettings = await this.getSelctedScheduleMold(facilityId);
    const currentDate = new Date();
    console.log({ selctedSettings }, 'startDate from settings');
    if (selctedSettings) {
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
        console.log('error ');
        throw new HttpException('Error in retrieving current schedule', 500, {
          cause: new Error(error.message),
        });
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
      throw new HttpException('Error in creating schedule', 400, {
        cause: new Error('error'),
      });
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
      throw new HttpException(
        'Error in retrieving schedule by date and user ID',
        500,
        {
          cause: new Error(error.message),
        },
      );
    }
  }

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

      const existingShifts: userShift[] =
        await this.shiftSercvice.getAllUserShiftsByScheduleId(scheduleId);
      const shiftMap = new Map<string, userShift>();

      existingShifts.forEach((shift: userShift) => {
        const shiftTimeKey = `${shift.shiftStartHour.getDate()}-${shift.shiftStartHour.getHours()}`;
        shiftMap.set(shiftTimeKey, shift);
      });

      const editedShifts: userShift[] = await Promise.all(
        shiftsToEdit.map(async (editInfo: EditShiftByDateDto) => {
          const editTime = new Date(editInfo.shiftStartHour);
          const editTimeKey = `${editTime.getDate()}-${editTime.getHours()}`;
          const existingShift = shiftMap.get(editTimeKey);

          if (existingShift) {
            const editShiftDto: EditShiftDto = {
              shiftId: existingShift.id,
              userPreference: editInfo.userPreference,
              shiftType: 'user',
            };
            console.log({ editShiftDto });

            const edited = await this.shiftSercvice.editUserShift(editShiftDto);
            return edited;
          }
          return null;
        }),
      );

      return editedShifts.filter((shift): shift is userShift => shift !== null);
    } catch (error) {
      console.log({ error });
      throw new ForbiddenException(error.message);
    }
  }

  async getSubmmitedUsersSchedule(
    facilityId: number,
    startDate: string | undefined,
  ) {
    const userSelctedDate = new Date(startDate);
    userSelctedDate.setUTCHours(6, 0, 0, 0);
    console.log({ startDate }, { userSelctedDate });
    const dateToGet: Date = userSelctedDate
      ? userSelctedDate
      : this.getNextDayDate(undefined);

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
    console.log(
      'getAllUsersForSchedule',
      { startingDate },
      typeof startingDate,
    );
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
        // console.log('shiftsForsched' , { shiftsForSchedule });
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

        console.log('uswer Pref  ', { shiftsMap });
        if (shiftsMap) {
          schedules.push(shiftsMap); // Push each filtered shifts array
          // console.log('one user Shifts ', {filterdShifts});
        }
      }
    }
    console.log('all users Shifts ', schedules[0]);
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

  async findReplaceForShift(shiftId: number, scheduleIdToCheck: number) {
    console.log({ shiftId });
  }

  /**
   * @description Return map of  roleId:shift , each role ->shift
   * @param {*} shiftMold
   * @param {(number | undefined)} schedualId
   * @param {*} [role]
   * @returns {*}  Record<roleId:shift>
   * @memberof ScheduleService
   */
  convertShiftMoldToShift(
    shiftMold: any,
    scheduleId: number | undefined,
    baseDate: Date,
  ): Record<number, SystemShiftDTO> {
    // Use the baseDate (scheduleStart) as the base date for generating shifts
    const startDate: Date = new Date(baseDate);
    startDate.setUTCDate(baseDate.getDate() + Number(shiftMold.day));
    startDate.setUTCHours(Number(shiftMold.startHour), 0, 0, 0); // Set the start hour and reset minutes, seconds, milliseconds

    const endDate: Date = new Date(baseDate);
    endDate.setUTCDate(baseDate.getDate() + Number(shiftMold.day));
    endDate.setUTCHours(Number(shiftMold.endHour), 0, 0, 0); // Set the end hour and reset minutes, seconds, milliseconds

    // Initialize an empty object to store shifts by role ID
    const shiftsMap: Record<number, SystemShiftDTO> = {};

    shiftMold.userPrefs.forEach((role) => {
      const tmpShift: SystemShiftDTO = {
        shiftType: 'system',
        shiftTimeName: shiftMold.name.toLowerCase(),
        typeOfShift:
          shiftMold.endHour - shiftMold.startHour > 10 ? 'long' : 'short',
        shiftStartHour: startDate,
        shiftEndHour: endDate,
        shiftName: shiftMold.shiftName,
        shiftRole: role,
        scheduleId: scheduleId,
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
      Record<
        string,
        { shift: SystemShiftDTO; optinalUsers: shiftUserPosseblity[] }
      >
    > = {};
    let tmpId = 0;
    for (const shiftMold of shiftsMold) {
      // Use convertShiftMoldToShift to create a shift for each role in the mold
      const tmpShiftsByRole: Record<number, SystemShiftDTO> =
        this.convertShiftMoldToShift(shiftMold, scheduleId, startDate);

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
          optinalUsers: [],
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
    console.log({ startDate });
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
      console.error('Error in createEmptySystemSchedule:', error);
      throw new HttpException(
        'An error occurred while processing your request',
        403,
        {
          cause: new Error(error.message || error.toString()),
        },
      );
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
      (shift) => shift.userId === userId,
    );
    console.log('userShifts in schedule ---', { userShifts });
    return userShifts;
  }
  private getShiftsBeforeAndAfter(
    assignedShift: any,
    assignedShifts: any[],
  ): any[] {
    const shiftStart = new Date(assignedShift.shiftStartHour).getTime();
    const shiftEnd = new Date(assignedShift.shiftEndHour).getTime();

    const eightHoursBeforeStart = shiftStart - 8 * 60 * 60 * 1000; // 8 hours before the shift starts
    const eightHoursAfterEnd = shiftEnd + 8 * 60 * 60 * 1000; // 8 hours after the shift ends

    const relevantShifts = assignedShifts.filter((shift) => {
      const otherShiftEnd = new Date(shift.shiftEndHour).getTime();
      const otherShiftStart = new Date(shift.shiftStartHour).getTime();

      // Check if the shift ends 8 hours before the current shift starts
      const endsBeforeStart =
        otherShiftEnd >= eightHoursBeforeStart && otherShiftEnd < shiftStart;

      // Check if the shift starts less than or equal to 8 hours after the current shift ends
      const startsAfterEnd =
        otherShiftStart <= eightHoursAfterEnd && otherShiftStart > shiftEnd;

      return endsBeforeStart || startsAfterEnd;
    });

    return relevantShifts;
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
    console.log('is shift possible shiftToAssign: ', { shiftToAssign });

    //TOADD Check in userShiftMap instad.
    const allUserhifts = this.getAllUserShiftsInSchedule(
      userId,
      scheduleShifts,
    );
    console.log('all user shifts:', { allUserhifts });
    const eightHoursInMilliseconds = 8 * 60 * 60 * 1000;

    const underShiftLimit = allUserhifts.length < maxAmountOfShifts;
    const sameDayShift = allUserhifts?.filter((shift) => {
      console.log(
        'shift in the user options::::::',
        { shift },
        'shift to assign:',
        { shiftToAssign },
      );
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
    return underShiftLimit && sameDayShift.length < 1;
  }

  assignScheduleShifts(scheduleAndShifts) {
    const shiftsToAssign = structuredClone(scheduleAndShifts.shifts); // Clone to work with
    const userShiftStats = new Map();
    const assignedShifts = [];
    const noUserShifts = [];

    console.log(
      'Assigning shifts, schedule:',
      { shiftsToAssign },
      shiftsToAssign[1][1],
    );

    // Iterate over each role's shifts
    Object.entries(shiftsToAssign).forEach(([roleId, shiftsOfRole]) => {
      while (
        Object.keys(shiftsOfRole).some(
          (timeKey) => !shiftsOfRole[timeKey].processed,
        )
      ) {
        const shiftWithLeast = this.findShiftWithLeastOptions(
          Object.values(shiftsOfRole).filter((shift) => !shift.processed),
        );
        console.log('Shift to assign:', { shiftWithLeast });

        if (!shiftWithLeast) break;

        const assignedShift = this.assignShift(
          shiftWithLeast,
          assignedShifts,
          shiftsOfRole,
          userShiftStats,
        );

        console.log('After assigning shift:', { assignedShift });

        if (!assignedShift) {
          noUserShifts.push({ ...shiftWithLeast });
          shiftsOfRole[shiftWithLeast.shiftStartHour.toISOString()].processed =
            true;
          console.log('No possible users for shift:', { shiftWithLeast });
        } else {
          const shiftKey = assignedShift.shiftStartHour.toISOString();
          shiftsOfRole[shiftKey].processed = true;
          shiftsOfRole[shiftKey].assigned = true;
          shiftsOfRole[shiftKey].userId = assignedShift.userId;
          assignedShifts.push({ ...assignedShift });

          console.log(
            'Assigned shift:',
            assignedShift.userId,
            'Shifts to assign -->',
            assignedShifts,
          );

          // Retrieve or initialize the stats for the user
          let currentUserStats = userShiftStats.get(assignedShift.userId);
          if (!currentUserStats) {
            currentUserStats = {
              morning: { sum: 0, keys: [] },
              noon: { sum: 0, keys: [] },
              night: { sum: 0, keys: [] },
              longmorning: { sum: 0, keys: [] },
              longnight: { sum: 0, keys: [] },
              total: 0,
            };
            userShiftStats.set(assignedShift.userId, currentUserStats); // Store the initialized stats in the map
          }

          // Now update the stats
          this.updateStats(currentUserStats, assignedShift, 1);

          // Get the time keys as an array
          const timeKeys = Object.keys(shiftsOfRole).sort();
          const shiftIndex = timeKeys.indexOf(shiftKey);

          // Update options for the previous shift
          if (shiftIndex > 0) {
            const prevShiftKey = timeKeys[shiftIndex - 1];
            this.updateShiftOptions(
              shiftsOfRole[prevShiftKey],
              { userId: assignedShift.userId },
              'remove',
            );
          }

          // Update options for the next shift
          if (shiftIndex < timeKeys.length - 1) {
            const nextShiftKey = timeKeys[shiftIndex + 1];
            this.updateShiftOptions(
              shiftsOfRole[nextShiftKey],
              { userId: assignedShift.userId },
              'remove',
            );
          }
          console.log('get same day from this shyifts ', { assignedShifts });
          // Same day shift handling
          const dayShifts = this.getDayShiftsFromSchedule(
            assignedShift,
            assignedShifts,
          );
          console.log('Same day shifts:', { dayShifts });

          if (dayShifts && dayShifts.length > 0) {
            dayShifts.forEach((shiftToUpdate) => {
              console.log('Updating shift options for shift:', shiftToUpdate);

              if (!shiftToUpdate) {
                console.error(
                  'shiftToUpdate or its properties are undefined:',
                  { shiftToUpdate },
                );
                return;
              }

              const newShiftOptions = this.updateShiftOptions(
                shiftToUpdate,
                { userId: assignedShift.userId },
                'remove',
              );
              if (Array.isArray(newShiftOptions)) {
                shiftToUpdate.optinalUsers = [...newShiftOptions];
                console.log('Updated options for shift:', { shiftToUpdate });
              } else {
                console.error('newShiftOptions is not an array:', {
                  newShiftOptions,
                });
              }
            });
          }
        }
      }
    });
    console.log('after going over all shifts, state of vars : ');
    console.log('shiftsToAssign', { shiftsToAssign });
    console.dir(shiftsToAssign, { depth: null, colors: true });
    console.log('assigned shifts ', { assignedShifts });

    const longShiftsEnabled = true;
    if (noUserShifts.length > 0 && longShiftsEnabled) {
      console.log('Handling unassigned shifts:', { noUserShifts });

      noUserShifts.forEach((noUserShift, index) => {
        console.log('Shift to change:', { noUserShift });

        // Ensure shiftStartHour exists before accessing it
        if (!noUserShift.shiftStartHour) {
          console.error('Shift is missing shiftStartHour:', noUserShift);
          return;
        }

        const shiftKey = noUserShift.shiftStartHour.toISOString();
        console.log('Shift to change (key):', { shiftKey });

        const res = this.changeDayIntoTwoShifts(
          noUserShift,
          shiftsToAssign,
          userShiftStats,
        );
        console.log('Result of change:', { res });

        if (res) {
          // Remove from unassigned shifts if handled
          noUserShifts.splice(index, 1);
        }
      });
    }

    console.log(
      'Final  shifts after assignent:',
      { scheduleAndShifts },
      { userShiftStats },
    );
    return {
      scheduleAndShifts: {
        ...scheduleAndShifts,
        shifts: shiftsToAssign,
      },
      userShiftStats: userShiftStats,
    };
  }

  getDayShiftsFromSchedule(shift, scheduleShifts) {
    console.log(
      'find day shifts -',
      { shift },
      shift.shiftStartHour,
      'schedule shifrs ',
      {
        scheduleShifts,
      },
    );
    if (!shift || !shift.shiftStartHour || !shift.shiftRole) {
      console.error('Invalid shift data in getDayShiftsFromSchedule:', {
        shift,
      });
      return [];
    }

    const shiftDate = shift.shiftStartHour.toISOString().substring(0, 10);
    const role = shift.shiftRole;
    if (!role || !role.roleId) {
      console.error('Invalid role data in shift:', { shift });
      return [];
    }

    const dayShifts = scheduleShifts.filter((s) => {
      if (!s || !s.shiftStartHour || !s.shiftRole) {
        console.error('Invalid shift data in scheduleShifts:', { s });
        return false;
      }
      return (
        s.shiftStartHour.toISOString().substring(0, 10) === shiftDate &&
        s.shiftRole.roleId === role.roleId
      );
    });

    console.log('Filtered day shifts:', { dayShifts });
    return dayShifts;
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
  updateStats(userStats, shift, amount) {
    console.log("update stats : ", {userStats},{shift})
    if (!shift || !shift.typeOfShift || !shift.shiftStartHour) {
      console.error('Invalid shift data:', { shift });
      return;
    }

    const shiftKey = `${
      shift.typeOfShift
    }${shift.shiftStartHour.toISOString()}`;
    console.log('Updating stats:', { shiftKey }, { userStats }, { amount });

    // if (!userStats[shift.typeOfShift]) {
    //   console.error('Invalid userStats or typeOfShift:', shift.typeOfShift,{ userStats }, { shift },'------***---');
    //   return;
    // }

    userStats[shift.shiftTimeName].sum += amount;
    if (amount > 0) {
      userStats[shift.shiftTimeName].keys.push(shiftKey);
    } else {
      const index = userStats[shift.shiftTimeName].keys.indexOf(shiftKey);
      if (index > -1) {
        userStats[shift.shiftTimeName].keys.splice(index, 1);
      }
    }
    userStats.total += amount;
    console.log('Updated userStats:', { userStats });
  }

  updateAssignedSchedule(
    scheduleAndShifts: any,
    shiftsToUpdate: any[],
    userShiftStats: Map<any, any>,
  ) {
    // Log the shifts to update and initial states
    console.log('shifts to update:', { shiftsToUpdate });
    console.dir(scheduleAndShifts, { depth: null, colors: true });
    // Check if shiftsToUpdate is truthy and not empty
    if (!shiftsToUpdate || shiftsToUpdate.length === 0) {
      console.log('No shifts to update');
      return scheduleAndShifts;
    }
  
    shiftsToUpdate.forEach((shiftToUpdate) => {
      console.log('Update shift', { shiftToUpdate });
  
      // Extract the roleId and timeKey from the shiftToUpdate
      const roleId = shiftToUpdate.shiftRole?.roleId;
      const timeKey = shiftToUpdate.shiftStartHour.toISOString();
  
      // Check if roleId and timeKey are defined and exist in scheduleAndShifts
      if (!roleId || !scheduleAndShifts[timeKey]) {
        console.error(`Shift not found for roleId: ${roleId} and timeKey: ${timeKey}`);
        return;
      }
  
      // Find the shift in the scheduleAndShifts using roleId and timeKey
      const existingShift = scheduleAndShifts[timeKey];
  
      // If userId is undefined, handle unassigning the shift
      if (shiftToUpdate.userId === undefined) {
        const userStats = userShiftStats.get(existingShift.userId);
        if (userStats) {
          this.updateStats(userStats, existingShift.shift, -1);
        }
      } else {
        // Handle reassigning the shift
        if (existingShift.userId !== undefined) {
          const userStats = userShiftStats.get(existingShift.shift.userId);
          if (userStats) {
            this.updateStats(userStats, existingShift.shift, -1);
          }
        }
        const userStats = userShiftStats.get(shiftToUpdate.userId);
        if (userStats) {
          this.updateStats(userStats, shiftToUpdate, 1);
        }
      }
   
      const updatedShift = {
        ...existingShift, // Start with existingShift properties
        shift: {
          ...(shiftToUpdate.shift || {}), // Overwrite with properties from shiftToUpdate.shift
        },
        optinalUsers: shiftToUpdate.optinalUsers || existingShift.optinalUsers, // Ensure optinalUsers are merged correctly
        processed: shiftToUpdate.processed ?? existingShift.processed, // Preserve the processed status
        assigned: shiftToUpdate.assigned ?? existingShift.assigned, // Preserve the assigned status
        userId: shiftToUpdate.userId !== undefined ? shiftToUpdate.userId : existingShift.userId, 
      };
      
      // Update the shift in scheduleAndShifts
      scheduleAndShifts[timeKey] = updatedShift;
      
      // Log the result for verification
      console.log("log of schedule and shifts:", scheduleAndShifts[timeKey]);
    });
  
    console.log('Assigned schedule after change:', { userShiftStats });
  
    return scheduleAndShifts;
  }
  

  createNoonCanceledShift(shift) {
    console.log('create noon shift : ', { shift });
    const tmpShift = {
      ...shift,
      shiftTimeName: shiftTimeClassification.noonCanceled,
      userId: undefined,
    };
    console.log(tmpShift);
    return tmpShift;
  }
  getShiftByKey(shiftKey: string, scheduleAndShifts: any) {
    console.log('Looking for shift with key:', shiftKey);

    for (const [roleId, shiftsOfRole] of Object.entries(
      scheduleAndShifts.shifts,
    )) {
      for (const [key, shift] of Object.entries(shiftsOfRole)) {
        console.log(`Checking role ${roleId}, shift ${key}`);
        if (key === shiftKey) {
          console.log('Shift found:', shift);
          return shift;
        }
      }
    }
    console.error('Shift not found for key:', shiftKey);
    return null;
  }

  changeDayIntoTwoShifts(
    shiftToChange: string | any,
    scheduleAndShifts: any,
    userShiftStats,
  ) {
    console.log('Change shift into two a day for shift:', { shiftToChange });
    console.dir(scheduleAndShifts, { depth: null, colors: true });
    let shiftToAssign;
    if (typeof shiftToChange === 'string') {
      console.log('shift to change is string ');
      shiftToAssign = this.getShiftByKey(shiftToChange, scheduleAndShifts);
      if (!shiftToAssign) {
        console.error('Shift not found for key:', shiftToChange);
        console.dir(scheduleAndShifts, { depth: null, colors: true });
        return scheduleAndShifts;
      }
    } else {
      shiftToAssign = shiftToChange;
    }
    // Flattening the shiftToAssign object if it is nested
    const flatShiftToAssign = shiftToAssign.shift
      ? shiftToAssign.shift
      : shiftToAssign;
    console.log('role shifts in change ');

    let roleShifts = scheduleAndShifts[flatShiftToAssign.shiftRole.roleId];

    // Transform roleShifts to include the shift details along with optinalUsers
    roleShifts = Object.fromEntries(
      Object.entries(roleShifts).map(([key, shift]) => [
        key,
        {
          ...(shift as any).shift, // Include the shift details
          optinalUsers: (shift as any).optinalUsers, // Retain optinalUsers
        },
      ]),
    );

    console.dir(roleShifts, { depth: null, colors: true });

    const shiftsArray = roleShifts ? Object.values(roleShifts) : [];

    // Pass the flattened shiftToAssign object to getDayShiftsFromSchedule
    const dayShiftDTOs = this.getDayShiftsFromSchedule(
      flatShiftToAssign,
      shiftsArray,
    );

    console.log('Day shifts found:', { dayShiftDTOs });

    let morning, noon, night;
    const mode: 'missing' | 'replace' = !flatShiftToAssign.userId
      ? 'missing'
      : 'replace';
    const adjustedDate = new Date(flatShiftToAssign.shiftStartHour);
    adjustedDate.setUTCHours(18, 0, 0, 0); // Adjust the time to 18:00 (6:00 PM)

    // Ensure there are at least two shifts in the day to work with
    if (dayShiftDTOs.length < 2) return scheduleAndShifts;

    switch (flatShiftToAssign.shiftTimeName) {
      case 'night':
        morning = {
          ...dayShiftDTOs[0],
          shiftEndHour: adjustedDate,
          typeOfShift: 'long',
          optinalUsers: [...dayShiftDTOs[0].optinalUsers],
        };
        night = {
          ...flatShiftToAssign,
          shiftStartHour: adjustedDate,
          userId: dayShiftDTOs[1].userId,
          typeOfShift: 'long',
          optinalUsers: [...flatShiftToAssign.optinalUsers],
        };
        noon = {
          ...this.createNoonCanceledShift(dayShiftDTOs[1]),
          optinalUsers: [...dayShiftDTOs[1].optinalUsers],
        };
        break;

      case 'morning':
        morning = {
          ...flatShiftToAssign,
          optinalUsers: [...flatShiftToAssign.optinalUsers],
        };
        night = {
          ...dayShiftDTOs[1],
          shiftStartHour: adjustedDate,
          typeOfShift: 'long',
          optinalUsers: [...dayShiftDTOs[1].optinalUsers],
        };
        noon = {
          ...this.createNoonCanceledShift(dayShiftDTOs[0]),
          optinalUsers: [],
        };
        break;

      case 'noon':
        morning = {
          ...dayShiftDTOs[0],
          shiftEndHour: adjustedDate,
          typeOfShift: 'long',
          optinalUsers: [...dayShiftDTOs[0].optinalUsers],
        };
        night = {
          ...dayShiftDTOs[1],
          shiftStartHour: adjustedDate,
          typeOfShift: 'long',
          optinalUsers: [...dayShiftDTOs[1].optinalUsers],
        };
        noon = {
          ...this.createNoonCanceledShift(flatShiftToAssign),
          optinalUsers: [],
        };
        break;

      default:
        console.error(
          'Unhandled shiftTimeName:',
          flatShiftToAssign.shiftTimeName,
        );
        return scheduleAndShifts;
    }

    console.log('Updated schedule before changing into two shifts:', {
      scheduleAndShifts,
    });
    console.dir(scheduleAndShifts, { depth: null, colors: true });
    // Update the scheduleAndShifts object
    const updatedShifts = this.updateAssignedSchedule(
      scheduleAndShifts[flatShiftToAssign.shiftRole.roleId],
      [morning, noon, night],
      userShiftStats,
    );

    console.log('Updated schedule after changing into two shifts:', {
      updatedShifts,
    });

    return scheduleAndShifts;
  }

  findShiftWithLeastOptions(shiftOptionsMap) {
    console.log('shift with least - options map ', { shiftOptionsMap });
    let shiftWithLeastOptions = null;
    let leastOptionsCount = Infinity;

    // Correct the destructuring within the loop
    for (let [index, shiftData] of shiftOptionsMap.entries()) {
      const { shift, optinalUsers } = shiftData;

      const optionsLength = optinalUsers.length;

      if (optionsLength < leastOptionsCount) {
        leastOptionsCount = optionsLength;

        shiftWithLeastOptions = { ...shift, optinalUsers: optinalUsers };
        console.log('shift with least picked', { shiftWithLeastOptions });
      }
    }
    return shiftWithLeastOptions;
  }

  getNextShiftKeyInMap(currentShiftKey, shiftsMap) {
    //return the key of the next shift in the schedule .

    // console.log({ shiftsMap });
    const entries = Object.entries(shiftsMap); // Convert to entries array
    // console.log({ entries }, currentShiftKey);
    for (let i = 0; i < entries.length; i++) {
      if (entries[i][0] === currentShiftKey && i + 1 < entries.length) {
        // Return the key of the next shift if the current key matches and there is a next shift
        console.log(entries[i][0], { currentShiftKey });
        return entries[i + 1][0]; // Return the key of the next shift
      }
    }
    return null; // Return null if no next shift is found
  }
  getAvailableWeeks(dayOfWeek: number): string[] {
    const today = new Date();
    const sixMonthsAgo = new Date(today);
    const sixMonthsLater = new Date(today);
    sixMonthsAgo.setMonth(today.getMonth() - 1);
    sixMonthsLater.setMonth(today.getMonth() + 6);

    const availableWeeks = [];
    let currentDate = new Date(sixMonthsAgo);

    while (currentDate <= sixMonthsLater) {
      if (currentDate.getDay() === dayOfWeek) {
        availableWeeks.push(currentDate.toISOString().split('T')[0]);
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableWeeks;
  }
  assignShift(shiftAndOptions, assignedShifts, shiftsMap, userShiftStats) {
    console.log('Assigning shift, initial shift and options:', {
      shiftAndOptions,
    });

    if (!shiftAndOptions) {
      console.error('shiftAndOptions or shiftAndOptions.shift is undefined:', {
        shiftAndOptions,
      });
      return false;
    }

    const assignedShift = shiftAndOptions;

    // Filter the options to get only possible shifts
    const possibleShifts = shiftAndOptions.optinalUsers.filter((shift) => {
      const isPossible = this.isShiftPossible(
        shiftAndOptions,
        shift.userId,
        assignedShifts,
      );
      let totalShifts = 0;

      // Check the total amount of shifts a user has already
      if (userShiftStats.get(shift.userId)) {
        console.log(
          'Total in shiftStatsMap. userId:',
          shift.userId,
          'Total shifts: ',
          userShiftStats.get(shift.userId).total,
        );
        totalShifts = userShiftStats.get(shift.userId).total;
      }

      console.log('Same day and consecutive shifts:');

      console.log(
        'Is possible?: ',
        isPossible && totalShifts < maxAmountOfShifts,
        'Total shifts ',
        totalShifts,
      );
      return isPossible && totalShifts < maxAmountOfShifts;
    });

    console.log('Possible shifts:', { possibleShifts });

    if (possibleShifts.length < 1) {
      return false;
    }

    const selectedShift =
      possibleShifts.length === 1
        ? possibleShifts[0]
        : possibleShifts.sort((a, b) => {
            const aShiftTypeSum =
              userShiftStats.get(a.userId)?.[assignedShift.shiftTimeName]
                ?.sum || 0;
            const bShiftTypeSum =
              userShiftStats.get(b.userId)?.[assignedShift.shiftTimeName]
                ?.sum || 0;

            const aTotalShifts = userShiftStats.get(a.userId)?.total || 0;
            const bTotalShifts = userShiftStats.get(b.userId)?.total || 0;

            const aScore =
              a.userPreference * 0.5 + // Consider user preference
              (1 - aShiftTypeSum / (aTotalShifts + 1)) * 0.3 + // Prioritize users with fewer shifts of this type
              (1 - aTotalShifts / (aTotalShifts + bTotalShifts + 1)) * 0.2; // Balance total shifts

            const bScore =
              b.userPreference * 0.5 +
              (1 - bShiftTypeSum / (bTotalShifts + 1)) * 0.3 +
              (1 - bTotalShifts / (aTotalShifts + bTotalShifts + 1)) * 0.2;

            return bScore - aScore;
          })[0];

    console.log({ selectedShift });
    assignedShift.userId = selectedShift.userId;
    assignedShift.userPreference = selectedShift.userPreference;
    console.log('----assigned shift', { assignedShift });

    const nextShiftKey = this.getNextShiftKeyInMap(
      assignedShift.shiftStartHour.toISOString(),
      shiftsMap,
    );
    console.log(
      { nextShiftKey },
      'Next shift key after assign ',
      shiftsMap[nextShiftKey],
    );
    if (
      nextShiftKey &&
      shiftsMap[nextShiftKey]?.optinalUsers.length === 1 &&
      shiftsMap[nextShiftKey]?.optinalUsers[0]?.userId === selectedShift.userId
    ) {
      console.log('User is the only option for the next shift');
    }

    const newShiftOptions = this.updateShiftOptions(
      shiftsMap[assignedShift.shiftStartHour.toISOString()],
      selectedShift,
      'remove',
    );
    assignedShift.optinalUsers = [...newShiftOptions];
    console.log('Updated options for shift:', { assignedShift });

    return assignedShift;
  }

  updateShiftOptions(shiftToUpdate, option, action: 'remove' | 'add') {
    if (!shiftToUpdate || !shiftToUpdate.optinalUsers) {
      console.error(
        'shiftToUpdate or shiftToUpdate.optinalUsers is undefined:',
        { shiftToUpdate },
      );
      return [];
    }

    console.log('Option to', { action }, ':', { option }, shiftToUpdate);
    const newOptions =
      action === 'remove'
        ? shiftToUpdate.optinalUsers.filter(
            (optionToCheck) => option.userId !== optionToCheck.userId,
          )
        : [...shiftToUpdate.optinalUsers, option];

    if (newOptions) {
      shiftToUpdate.optinalUsers = [...newOptions];
      console.log('New options:', shiftToUpdate.optinalUsers, { action });
      return shiftToUpdate.optinalUsers;
    } else {
      return [];
    }
  }

  async getMoldById(settingsId) {
    try {
      const mold: ScheduleMoldWithTime =
        await this.prisma.scheduleMold.findUnique({
          where: {
            id: settingsId,
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
      return mold;
    } catch {
      throw new error('settings not found');
    }
  }
  /**
   * @description Create the a system schedule for the date provided.
   * @param {generateScheduleForDateDto} dto
   * @memberof ScheduleService
   */
  async createSystemSchedule(scheduleDto: generateScheduleForDateDto) {
    console.log('Create sys schedule service, DTO:', { scheduleDto });

    // Destructure the properties from the instance
    const {
      selectedUsers = [], // Default to an empty array if not provided
      scheduleStart,
      settingsId,
      facilityId,
    } = scheduleDto;

    // Ensure the required properties are available
    if (!scheduleStart) {
      throw new Error('scheduleStart is required');
    }

    if (!facilityId) {
      throw new Error('facilityId is required');
    }

    const currentMold: ScheduleMoldWithTime = !settingsId
      ? await this.getSelctedScheduleMold(facilityId)
      : await this.getMoldById(settingsId);
    console.log(
      'current mold name- ',
      currentMold.name,
      'is it from selcted mold? ',
      !settingsId,
    );

    if (!currentMold) {
      throw new ForbiddenException(
        'No schedule mold found for the given facility',
      );
    }

    const normelizedStartDate = new Date(scheduleStart);
    normelizedStartDate.setUTCHours(currentMold.scheduleTime.startHour);
    normelizedStartDate.setUTCMinutes(currentMold.scheduleTime.startMinutes);

    const normelizedendDate = this.getNextDayDate({
      D: currentMold.scheduleTime.endDay,
      H: currentMold.scheduleTime.endHour,
      M: currentMold.scheduleTime.endMinutes,
    });
    //Create new Empty schedule
    const newSchedule: SystemSchedule = await this.createEmptySystemSchedule(
      normelizedStartDate,
      normelizedendDate,
      facilityId,
      currentMold.id,
    );

    if (!newSchedule) {
      throw new ForbiddenException('1086 , Couldnt create schedule');
    }

    const newScheduleAndShifts = { schedule: newSchedule, shifts: {} };
    //Emptyshifts will be divded to roles, for each role a map of days
    const emptyShifts: Record<
      number,
      Record<
        string,
        { shift: SystemShiftDTO; optinalUsers: shiftUserPosseblity[] }
      >
    > = this.genrateEmptySysSchedShifts(
      normelizedStartDate,
      newSchedule.id,
      currentMold.shiftsTemplate,
    );
    console.log(
      'generated wmnpty shifts: ',
      { emptyShifts },
      normelizedStartDate,
    );
    newScheduleAndShifts.shifts = emptyShifts;

    await this.addUserOptionsToEmptySystemShifts(
      newScheduleAndShifts,
      selectedUsers,
    );

    const assignedShiftsResult: {
      scheduleAndShifts: any;
      userShiftStats: Map<any, any>;
    } = this.assignScheduleShifts(newScheduleAndShifts);
    console.log(' resultes of assign shift', { assignedShiftsResult });
    // const noUserShifts = [...assignedShiftsResult.unAssigned];

    // const resultAfterNoUserShiftHandeling = this.handleUnassignedShifts(assignedShiftsResult)

    // for (let i = 0; i < noUserShifts.length; i++) {
    //   const shiftToAssign = { ...noUserShifts[i] };
    //   console.log('Handle missing shift:', { shiftToAssign });

    //   if (shiftToAssign.optinalUsers && shiftToAssign.optinalUsers.length > 0) {
    //     const userOptionsShifts = [];
    //     shiftToAssign.optinalUsers.forEach((option) => {
    //       console.log(
    //         'User shift stats:',
    //         assignedShiftsResult.userShiftStats,
    //         assignedShiftsResult.userShiftStats.get(option.userId),
    //       );
    //       if (assignedShiftsResult.userShiftStats.get(option.userId).total === 6) {
    //         const shiftsToUnAssign = this.getAllUserShiftsInSchedule(
    //           option.userId,
    //           assignedShiftsResult.assigned,
    //         ).filter((shift) => shift.typeOfShift === 'short');
    //         console.log('Shifts to assign in two shifts:', { shiftsToUnAssign });
    //         if (shiftsToUnAssign) userOptionsShifts.push(shiftsToUnAssign);
    //       }
    //     });

    //     if (userOptionsShifts[0] && userOptionsShifts[0][0]) {
    //       console.log('Change this shift:', userOptionsShifts[0][0]);
    //       this.changeDayIntoTwoShifts(
    //         userOptionsShifts[0][0],
    //         assignedShiftsResult.assigned,
    //         assignedShiftsResult.userShiftStats,
    //       );

    //       const { optinalUsers, ...shiftWithoutOptinalUsers } = shiftToAssign;

    //       const newShift = {
    //         shift: {
    //           ...shiftWithoutOptinalUsers,
    //           userId: userOptionsShifts[0][0].userId,
    //         },
    //         optinalUsers: [...optinalUsers],
    //       };

    //       console.log('New shift after unassign:', { newShift });
    //       assignedShiftsResult.assigned.push(newShift);

    //       noUserShifts.forEach((shift) => {
    //         if (
    //           newShift.shift.shiftStartHour.toISOString().substring(0, 10) ===
    //             shift.shiftStartHour.toISOString().substring(0, 10) &&
    //           newShift.shift.shiftRole.roleId === shift.shiftRole.roleId &&
    //           newShift.shift.tmpId !== shift.tmpId
    //         ) {
    //           shift.optinalUsers = shift.optinalUsers.filter(
    //             (shiftToUpdate) => shiftToUpdate.userId !== newShift.shift.userId,
    //           );
    //         }
    //       });

    //       noUserShifts.splice(i, 1);
    //     }
    //   }
    // }

    // noUserShifts.forEach((element) => {
    //   assignedShiftsResult.assigned.push({
    //     shift: { ...element, optinalUsers: undefined },
    //     optinalUsers: [...element.optinalUsers],
    //   });
    // });

    const sortedShifts = [];
    Object.entries(assignedShiftsResult.scheduleAndShifts.shifts).forEach(
      ([roleId, shiftsOfRole]) => {
        Object.values(shiftsOfRole).forEach((shift) => {
          if (shift.assigned) {
            sortedShifts.push(shift.shift);
          }
        });
      },
    );

    sortedShifts.sort((a, b) => {
      const dateA = new Date(a.shiftStartHour).getTime();
      const dateB = new Date(b.shiftStartHour).getTime();
      return dateA - dateB;
    });

    console.log(
      'print schedule',
      assignedShiftsResult.scheduleAndShifts.shifts,
    );
    this.printSchedule(
      Object.entries(assignedShiftsResult.scheduleAndShifts.shifts),
      'Created schedule',
    );
    return assignedShiftsResult;
  }

  // private async handleUnassignedShifts(
  //   assignedShiftsResult: {
  //     assigned: any[];
  //     unAssigned: any[];
  //     userShiftStats: Map<any, any>;
  //   }
  // ): Promise<any> {
  //   const { assigned, unAssigned, userShiftStats } = assignedShiftsResult;

  //   for (let i = 0; i < noUserShifts.length; i++) {
  //     const shiftToAssign = { ...noUserShifts[i] };
  //     console.log(
  //       'handle missing shift',
  //       { shiftToAssign },
  //       shiftToAssign.optinalUsers,
  //     );

  //     if (shiftToAssign.optinalUsers && shiftToAssign.optinalUsers.length > 0) {
  //       const userOptionsShifts = [];
  //       shiftToAssign.optinalUsers.forEach((option) => {
  //         // Check if user reached max shifts.
  //         if (userShiftStats.get(option.userId).total === 6) {
  //           // If yes, add user and shift to
  //           console.log('max shifts for user ');
  //           const shiftsToUnAssign = this.getAllUserShiftsInSchedule(
  //             option.userId,
  //             assignedShifts,
  //           ).filter((shift) => {
  //             console.log('Checking shift:', shift);
  //             return shift.typeOfShift === 'short';
  //           });
  //           console.log('shifts to unassign', { shiftsToUnAssign });
  //           userOptionsShifts.push(shiftsToUnAssign);
  //         }
  //       });

  //       // Change one of the shifts into two shifts a day and then
  //       if (userOptionsShifts[0] && userOptionsShifts[0][0]) {
  //         this.changeDayIntoTwoShifts(
  //           userOptionsShifts[0][0],
  //           assignedShifts,
  //           userShiftStats,
  //         );
  //         const newShift = {
  //           shift: {
  //             ...shiftToAssign.shift,
  //             userId: userOptionsShifts[0][0].userId,
  //           },
  //           optinalUsers: { ...shiftToAssign.optinalUsers },
  //         };
  //         assignedShifts.push(newShift);

  //         // Remove user from next shift option.
  //         noUserShifts = noUserShifts.filter((shift) => {
  //           return !(
  //             newShift.shift.shiftStartHour.toISOString().substring(1, 10) ===
  //               shift.shift.shiftStartHour.toISOString().substring(1, 10) &&
  //             newShift.shift.shiftRole.roleId ===
  //               shift.shift.shiftRole.roleId &&
  //             newShift.shift.tmpId !== shift.shift.tmpId
  //           );
  //         });

  //         noUserShifts.splice(i, 1);
  //       }
  //     }
  //   }

  //   // Add no user Shifts into the assigned schedule
  //   noUserShifts.forEach((element) => {
  //     assignedShifts.push(element);
  //   });

  //   return assignedShifts;
  // }

  async setSystemSchedule(dto: { [key: string]: any }) {
    console.log('dto of set sched', { dto });

    const shifts = Object.values(dto)
      .map((item) => {
        if (!item.shift || !item.shift.shiftRole) {
          // Handle cases where 'shift' or 'shift.shiftRole'  undefined
          console.error('Invalid shift data:', item);
          return null;
        }

        // console.log({ item });
        const tmpShift: SystemShiftDTO = {
          ...item.shift,
        };

        return tmpShift;
      })
      .filter((shift) => shift !== null); // Filter out any nulls from invalid data

    // console.log({ shifts });

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
    console.log({ createRes });
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
  async addUserOptionsToEmptySystemShifts(scheduleAndShifts, selectedUsers) {
    for (const [key, roleShifts] of Object.entries(scheduleAndShifts.shifts)) {
      console.log(
        'Adding user options to shifts for role:',
        { key },
        'schedfule start-',
        scheduleAndShifts.schedule.scheduleStart,
      );

      const usersShifts = await this.getAllUsersForSchedule(
        scheduleAndShifts.schedule.scheduleStart,
        selectedUsers,
        Number(key),
        scheduleAndShifts.schedule.facilityId,
      );
      console.log('usersShifts - ', { usersShifts });
      Object.entries(roleShifts).forEach(([shiftDate, shiftDetails]) => {
        console.log(`Processing shift for date ${shiftDate}`, { shiftDetails });

        if (shiftDetails.optinalUsers.length === 0) {
          const availableUsers = [];
          usersShifts.forEach((userOptions) => {
            console.log(
              `User options for shift date ${shiftDate}:`,
              userOptions[shiftDate],
            );

            if (
              userOptions[shiftDate] !== undefined &&
              userOptions[shiftDate].userPreference !== '3'
            ) {
              availableUsers.push(userOptions[shiftDate]);
              console.log(
                `Added user ${userOptions[shiftDate].userId} to available users.`,
              );
            } else {
              console.log(`Skipped user for shift date ${shiftDate}.`);
            }
          });

          shiftDetails.optinalUsers = availableUsers;
          console.log(
            `Shift ${shiftDate} updated with available users:`,
            availableUsers,
          );
        }
      });

      console.log('Shifts with added options:', { roleShifts });
    }
    return scheduleAndShifts;
  }

  printSchedule(scheduleEntries: [string, any][], headline: string) {
    if (!scheduleEntries || !Array.isArray(scheduleEntries)) {
      console.error('Invalid schedule object:', scheduleEntries);
      return;
    }

    console.log('--- ' + headline + ' ---');

    scheduleEntries.forEach(([roleId, shiftsOfRole]) => {
      console.log(`Role: ${roleId}`);

      Object.values(shiftsOfRole).forEach((shiftInfo: any) => {
        const { shift, userId } = shiftInfo;
        const shiftStart = new Date(shift.shiftStartHour);
        const shiftEnd = new Date(shift.shiftEndHour);

        const date =
          shiftStart.toISOString().substring(8, 10) +
          '/' +
          shiftStart.toISOString().substring(5, 7); // Format as dd/mm
        const startTime = shiftStart.toISOString().substring(11, 16); // Extract hh:mm
        const endTime = shiftEnd.toISOString().substring(11, 16); // Extract hh:mm
        const typeOfShift = shift.typeOfShift || 'undefined'; // Ensure typeOfShift is accessed correctly

        console.log(
          `  Date: ${date}, Shift: ${startTime} - ${endTime}, Type: ${typeOfShift}, User: ${
            userId || 'undefined'
          }`,
        );
      });
      console.log(''); // Extra line between roles for readability
    });

    console.log('-------------------------');
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
