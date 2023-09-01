import { ForbiddenException, Injectable } from '@nestjs/common';
import { shift, schedule, user, typeOfShift, shiftType } from '@prisma/client';
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

  async getNextScheduleForUser(userId: number) {
    const currentDate = new Date();
    console.log({ currentDate }, { userId });

    try {
      console.log('nextScheudle');
      const scheduleArr: schedule[] = await this.prisma.schedule.findMany({
        where: {
          scedualStart: {
            gt: currentDate ,
          },
          userId: userId,
        },
        orderBy: {
          scedualStart: 'asc',
        },
      });
      console.log(scheduleArr[0]);
      const nextSchedule: schedule = scheduleArr[0];
      console.log({ nextSchedule });
      if (nextSchedule === null || !nextSchedule) {
        const startDate = new Date(
          currentDate.getTime() +
            (7 - currentDate.getDay()) * 24 * 60 * 60 * 1000,
        );
        startDate.setHours(9, 0, 0, 0);
        const endDate = new Date(startDate.getTime() + (7 * 24 * 60 * 60 * 1000));
        endDate.setHours(9, 0, 0, 0);
        // console.log({ userId });
        const scedualDue:Date = new Date(startDate.getTime() - 4 );
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
        console.log(
          'next schedule 67 sched servic ',
          { nextSchedule },
        );
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
        console.log({nextSchedule},nextSchedule.id)
        const scheduleShifts:any =
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
      console.log('get current schedule ' , currentDate );
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
  async createSchedualeForUser(scheduleDto: scheduleDto) {
    const scheduleShifts: ShiftDto[] = [];
    const scheduleDue: Date = new Date(scheduleDto.scedualStart.getTime()-4);
    //Will create new schedule and create new shifts with it's id.
    const userId = scheduleDto.userId ? scheduleDto.userId : 0;
    const newSchedule: schedule = await this.prisma.schedule.create({
      data: {
        userId: userId,
        scedualStart: scheduleDto.scedualStart,
        scedualEnd: scheduleDto.scedualEnd,
        sceduleType: 'userSchedule',
        scedhuleDue: scheduleDue,
      },
    });

    const shiftsArr: ShiftDto[] = this.scheduleUtil.generateNewScheduleShifts(
      newSchedule.scedualStart,
      newSchedule.scedualEnd,
      newSchedule.id,
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
    const scedualLength: number = 7; // Number of days per schedule
    const emptyScheduleShifts: ShiftDto[] = [];
    const esId = schedualId;
    const esStartDate = new Date(startingDate);
    const timeZoneCorrection = esStartDate.getHours();
    esStartDate.setHours(timeZoneCorrection);

    for (let i = 0; i < scedualLength; i++) {
      for (let j = 0; j < 3; j++) {
        const esEndTime = new Date(esStartDate); // Create a new Date object for the end time
        esEndTime.setHours(esStartDate.getHours() + 8);
        const sType = j=== 0 ? shiftType.morning : j===1? shiftType.noon: shiftType.night
        const dto: ShiftDto = {
          userPreference: '0',
          shiftDate: new Date(esStartDate), // Create a new Date object for the shift date
          shiftType: sType,
          typeOfShift:'short',
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
      console.log('edit shift',{shiftsToEdit},{existingShifts}, scheduleId, shiftsToEdit[0]);

      existingShifts.forEach((shift: shift) => {
        const shiftTime = new Date(shift.shiftDate);

        shiftTime.setHours(shiftTime.getHours());
        const shiftId = shift.id;

        shiftsToEdit.forEach(async (editInfo: EditShiftByDateDto) => {
          const userPref: string = editInfo.userPreference;
          const dateOfshift = new Date(editInfo.shiftDate);

          console.log(shiftTime.getTime() === dateOfshift.getTime() ,shiftTime, dateOfshift , {shift});
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
      console.log(schedule !== null && schedule !== undefined , {schedule})
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
  async replaceShifts(shift1: shift |number, shift2: shift|number) {
    let shift1obj:ShiftDto ;
    let shift2obj:ShiftDto;

    if(typeof shift1 ==='number' ){
       shift1obj = await this.shiftSercvice.getShiftById(shift1);
    }else{
      shift1obj = {...shift1};
    }
    if(typeof shift2 === 'number'){
      shift2obj = await this.shiftSercvice.getShiftById(shift2);
    }
    else{
      shift2obj = {...shift2};
    }
    if (shift1obj.scheduleId === shift2obj.scheduleId) {
      // get schedule
      const schedule: schedule = await this.getScheduleById(shift1obj.scheduleId);
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
            if(scheduleToCheck.sceduleType !== 'systemSchedule'){
              throw new ForbiddenException("Replace alowd only on system schedule")
            }
          const avialbleUsersForShift: ShiftDto[] =
            this.scheduleUtil.searchPossibleUsersForShift(
              shiftToReplace.shifttStartHour,
              schedShifts,
            );
          console.log('419:', avialbleUsersForShift);
          const filtered = avialbleUsersForShift.filter((shiftToFilter, index, shiftsArray) => {
            const isUnique = shiftsArray.findIndex((shift) => shift.userId === shiftToFilter.userId) === index;
            
            // Check if the shift is not repeated and satisfies the isShiftpossible condition
            return isUnique && (this.scheduleUtil.isShiftpossible(shiftToFilter, scheduleToCheck)) && shiftToFilter.userId !== shiftToReplace.userId;
          });
          
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
    console.log('create schedule ' , { dto });
    const users: user[] = await this.userService.getAllUsers();
    // console.log({ users });
    const startingDate: Date = new Date(dto.scedualStart);
    console.log('create schedule ' , { startingDate });
    const start: Date = new Date(startingDate);
    start.setHours(start.getHours());
    const end: Date = new Date(start.getDate() + 7);
    const useresSchedules: shift[][] = await this.getUsersForSchedule(
      users,
      startingDate,
    );
    console.log('451 schedule service - useres schedules with prefernces ', 
    );
    const minimunUsersForSchedule = 3;
    if (useresSchedules.length < minimunUsersForSchedule) {
      //minimun users for schedule
      console.log("461 user service  forbbiden error " ,  useresSchedules.length)
      throw new ForbiddenException('insufficenst users for scheudle ');
    }
    const createdSchedule: schedule = await this.prisma.schedule.create({
      data: {
        scedualStart: start,
        scedualEnd: end,

        sceduleType: 'systemSchedule',
      },
    });
    
    const scheduleId: number = createdSchedule.id;
    const newSchedule: ShiftDto[] = this.scheduleUtil.generateNewScheduleShifts(
      start,
      end,
      scheduleId,
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
     console.log(firstFill['scheduleToFill'])
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
        const userid: number = filled2Sched[i].userId ?filled2Sched[i].userId :undefined ;
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

    const stats = await this.shiftStats.createUsersStatsForScheduleShifts(ceratedSched);
    console.log(stats )

    // return shifts;
    return { filled2Sched, emptyShifts };
    // after filling check if any shifts left without user
  }

}
