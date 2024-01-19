import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import {
  shift,
  schedule,
  user,
  typeOfShift,
  shiftType,
  ScheduleMold,
  ShiftMold,
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
  organizationId: number;
  start: scedualeDate;
  end: scedualeDate;
  shiftsTemplate: shiftTemp[];
  daysPerSchedule: number | undefined;
  restDay: { start: scedualeDate; end: scedualeDate };
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

  isHourMinuteObject(value: any): value is { hours: number; minutes: number } {
    return (
      value &&
      typeof value === 'object' &&
      'hours' in value &&
      'minutes' in value
    );
  }
  async setScheduleMold(schedSet: schedualSettings) {
    //Save mold to DB . convert types to match.

    const tmpMold = {
      organizationId: schedSet.organizationId,
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
    try {
      const existingSelected = await this.getSelctedScheduleMold(
        schedSet.organizationId,
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
      const createData:any = {
        startDay: Number(schedSet.start.day.value),
        startHour: `${schedSet.start.hours}:${schedSet.start.minutes}`,
        endDay: Number(schedSet.end.day.value),
        endHour: `${schedSet.end.hours}:${schedSet.end.minutes}`,
        name: schedSet.name,
        organizationId: schedSet.organizationId, // Assuming this is a valid ID
        daysPerSchedule: 7,
        description: schedSet.description,
        selected: true,
        restDayStartDay: Number(schedSet.restDay.start.day.value), 
        restDayStartHour: `${schedSet.restDay.start.hours}:${schedSet.restDay.start.minutes}`,
        restDayEndDay: Number(schedSet.restDay.end.day.value),
        restDayEndHour: `${schedSet.restDay.end.hours}:${schedSet.restDay.end.minutes}`,
      };
      
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
            let rank = await this.prisma.rank.findUnique({
              where: { name: role.name },
            });
            console.log({ rank });
            if (!rank) {
              rank = await this.prisma.rank.create({
                data: { name: role.name },
              });
            }

            await this.prisma.userPreference.create({
              data: {
                shiftMoldId: shiftMold.id,
                rankId: rank.id,
                userCount: role.quantity,
                // Add additional fields if necessary
              },
            });
          }
        }

        console.log('Shifts and preferences created');
        return true;
      } else if (existingSelected) {
        // ...existing logic to reset existingSelected...
      }
    } catch (error) {
      console.log({ error });
      throw new HttpException('Error in creating new mold', 400, {
        cause: new Error('Some Error'),
      });
    }
  }
  async getSelctedScheduleMold(orgId: number) {
    console.log('selcted mold', { orgId });
    try {
      // Check if there's already a selected entry
      const res = await this.prisma.scheduleMold.findFirst({
        where: {
          organizationId: orgId,
          selected: true,
        },
      });

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
          scedualStart: {
            gte: adjusted,
          },
          userId: userId,
        },
        orderBy: {
          scedualStart: 'asc',
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
    console.log({ currentDate });

    try {
      console.log('next sys schedule ');
      const scheduleArr: schedule[] = await this.prisma.schedule.findMany({
        where: {
          scedualStart: {
            gt: currentDate,
          },
          sceduleType: 'systemSchedule',
        },
        orderBy: {
          scedualStart: 'asc',
        },
      });
      console.log(scheduleArr);

      if (scheduleArr) {
        const nextSchedule: schedule = scheduleArr[0];
        console.log({ nextSchedule });
        const scheduleShifts: any =
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
  async getCurrentSchedule() {
    const currentDate = new Date();
    try {
      console.log('get current schedule ', currentDate);
      const currentSchedule = await this.prisma.schedule.findFirst({
        where: {
          scedualStart: {
            // Filter for shifts that have a startTime greater than the current date and time
            lte: currentDate,
          },

          sceduleType: 'systemSchedule',
        },
        orderBy: {
          scedualStart: 'asc',
        },
      });
      console.log(currentSchedule?.scedualStart);
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
  getNextDayDate(day: number) {
    //Wil find the next date object until this day.
    const currentDate = new Date();
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
    return adjusted;
  }
  async createSchedualeForUser(scheduleDto: scheduleDto) {
    const scheduleShifts: ShiftDto[] = [];
    const scheduleDue: Date = new Date(scheduleDto.scedualStart.getTime());
    console.log('Schedule start', scheduleDto.scedualStart);
    //Will create new schedule and create new shifts
    const userId = scheduleDto.userId ? scheduleDto.userId : 0;
    //get schedule and shift mold
    const schedulMold: ScheduleMold = await this.prisma.scheduleMold.findFirst({
      where: {
        selected: true,
      },
      include: {
        shiftsTemplate: true,
      },
    });
    console.log('create sched for user , mold:', { schedulMold });
    if (!schedulMold) {
      throw new Error('Schedule Mold not found');
    }
    const schedExist: schedule = await this.prisma.schedule.findFirst({
      where: {
        userId: userId,
        scedualStart: scheduleDto.scedualStart,
      },
    });
    if (userId === 0 || schedExist) {
      console.log(
        'Create sched for user 188 , userId or Sched exist',
        { userId },
        { schedExist },
      );
      //  if(schedExist) return schedExist;
      throw new error();
    }
    const startDate: Date = this.getNextDayDate(schedulMold.startDay);
    startDate.setUTCHours(
      Number(schedulMold.startHour.at(0)),
      Number(schedulMold.startHour.at(2)),
      0,
      0,
    );
    const endDate: Date = new Date(
      this.getNextDayDate(schedulMold.endDay).getTime() +
        schedulMold.daysPerSchedule * 24 * 60 * 60 * 1000,
    );
    endDate.setUTCHours(
      Number(schedulMold.endHour.at(0)),
      Number(schedulMold.endHour.at(2)),
      0,
      0,
    );
    const newSchedule: schedule = await this.prisma.schedule.create({
      data: {
        userId: userId,
        scedualStart: startDate,
        scedualEnd: endDate,
        sceduleType: 'userSchedule',
        scedhuleDue: scheduleDue,
      },
    });
const type= 'userSchedule';
    const shiftsArr: ShiftDto[] = this.scheduleUtil.generateNewScheduleShifts(
      newSchedule.scedualStart,
      newSchedule.scedualEnd,
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
        const sType =
          j === 0
            ? "morning"
            : j === 1
            ? "noon"
            : "night";
        const dto: ShiftDto = {
          userPreference: '0',
          shiftDate: new Date(esStartDate), // Create a new Date object for the shift date
          shiftType: sType,
          typeOfShift: 'short',
          shifttStartHour: esStartDate,
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
          AND: [{ scedualStart: dateIso }, { userId: userId }],
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
    try {
      const schedule = await this.prisma.schedule.findUnique({
        where: {
          id: scheduleId,
        },
      });
      // const today = new Date();
      // if (today.getDay() >= dayToSubmit) {
      //   //user cant edit schedule
      //   throw new ForbiddenException('Schedule due is over');
      // }
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
        const shiftTime = new Date(shift.shiftDate);
        console.log({ shiftTime });
        // shiftTime.setUTCHours(shiftTime.getHours());
        const shiftId = shift.id;

        shiftsToEdit.forEach(async (editInfo: EditShiftByDateDto) => {
          const userPref: string = editInfo.userPreference;
          const dateOfshift = new Date(editInfo.shiftDate);

          console.log(
            shiftTime.getTime() === dateOfshift.getTime(),
            shiftTime,
            dateOfshift,
            { shift },
          );
          if (shiftTime.getTime() === dateOfshift.getTime()) {
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
  //get  all the users schedules
  async getAllUsersForSchedule(startingDate: Date) {
    // Params - users , starting date => scheduled :shift[number of users ][shifts ]

    //for each user get schedule and save it in schedules arr
    const schedules: shift[][] = [];
    const users: user[] = await this.userService.getAllUsers();
    for (const user of users) {
      const schedule: schedule = await this.getScheduleIdByDateAnduserId(
        user.id,
        startingDate,
      );
      console.log({ schedule });
      const shiftsForSchedule: shift[] =
        await this.shiftSercvice.getAllShiftsByScheduleId(schedule?.id);
      // filter empty shifts
      const filterdShifts: shift[] = shiftsForSchedule.filter(
        (item: shift) => item.userPreference !== '0',
      );
      console.log('shift service 226', { filterdShifts });
      if (filterdShifts !== null) {
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
            scheduleToCheck.scedualStart,
          );
          if (scheduleToCheck.sceduleType !== 'systemSchedule') {
            throw new ForbiddenException(
              'Replace alowd only on system schedule',
            );
          }
          const avialbleUsersForShift: ShiftDto[] =
            this.scheduleUtil.searchPossibleUsersForShift(
              shiftToReplace.shifttStartHour,
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
  //Create new object for new  schedule
  async createSchedule(dto: generateScheduleForDateDto) {
    //get schedule and shift mold

    const schedulMold: ScheduleMold = await this.prisma.scheduleMold.findFirst({
      where: {
        selected: true,
      },
      include: {
        shiftsTemplate: {
          include: {
            userPrefs: true, // Include userPrefs from each ShiftMold
          }
        },
      },
    });

    if (!schedulMold) {
      throw new Error('Schedule Mold not found');
    }
    console.log('create schedule ', { dto }, { schedulMold });
    const startingDate: Date = this.getNextDayDate(schedulMold.startDay);
    startingDate.setUTCHours(
      Number(schedulMold.startHour.at(0)),
      Number(schedulMold.startHour.at(2)),
      0,
      0,
    );
    const endindgDate: Date = new Date(
      this.getNextDayDate(schedulMold.endDay) +
        schedulMold.daysPerSchedule * 24 * 60 * 60 * 1000,
    );
    endindgDate.setUTCHours(
      Number(schedulMold.endHour.at(0)),
      Number(schedulMold.endHour.at(2)),
      0,
      0,
    );

    console.log('create schedule ', { startingDate }, { schedulMold });
    const availableUsers: user[] = await this.prisma.user.findMany({
      where: {
        schedual: {
          some: {
            // Use 'some' if a user can have multiple schedules and you want to match any of them
            sceduleType: 'userSchedule',
            scedualStart: startingDate,
          },
        },
      },
    });
    console.log({ availableUsers });
    // const users: user[] = await this.userService.getAllUsers();
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
      console.log('766 user service  forbbiden error ', useresSchedules.length);
      throw new ForbiddenException('insufficenst users for scheudle ');
    }
    const createdSchedule: schedule = await this.prisma.schedule.create({
      data: {
        scedualStart: startingDate,
        scedualEnd: endindgDate,
        sceduleType: 'systemSchedule',
      },
    });
const type="userSchedule"
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
        shiftDate: filled2Sched[i].shiftDate,
        shiftType: filled2Sched[i].shiftType,
        shifttStartHour: filled2Sched[i].shifttStartHour,
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

    const stats = await this.shiftStats.createUsersStatsForScheduleShift(
      ceratedSched,
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
      const resultDeleteRequests =  await this.prisma.userRequest.deleteMany({
        where: {
            shift: {
                scheduleId: scheduleId,
            },
        },
    });
      //delete all the reqestes
      if(!resultDeleteRequests){
        throw new ForbiddenException("cant compete delete ")
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
