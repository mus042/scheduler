import { ForbiddenException, Injectable } from '@nestjs/common';
import { Prisma, ScheduleTime, ShiftMoldPayload, shift } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateStatsDto } from './UpdateStats.dto';
import { UsershiftStats } from './userShiftStats.dto';
import { ShiftService } from 'src/shift/shift.services';

const restDayConf: {
  start: { day: number; houre: number };
  end: { day: number; houre: number };
} = { start: { day: 5, houre: 18 }, end: { day: 6, houre: 18 } };

@Injectable()
export class UserStatisticsService {
  constructor(
    private prismaService: PrismaService,
    private shiftService: ShiftService,
  ) {} // <-- Change 'primaService' to 'prismaService'

  async getAllStatisticsForUser(id: number) {
    try {
      const result = await this.prismaService.shiftUserStatistic.findMany({
        where: {
          userId: id,
        },
      });
      console.log('result ', { result });
      //count results
      const stats: UpdateStatsDto = {
        userId: id,
        morningShifts: 0,
        noonShift: 0,
        nightShifts: 0,
        overTimerStep1: 0,
        overTimeStep2: 0,
        restDayHours: 0,
      };
      for (const tmpStat of result) {
        stats.morningShifts += tmpStat.morningShifts;
        stats.noonShift += tmpStat.noonShifts;
        stats.nightShifts += tmpStat.nightShifts;
        stats.overTimeStep2 += stats.overTimeStep2;
        stats.overTimerStep1 += stats.overTimerStep1;
        stats.restDayHours += stats.restDayHours;
      }
      console.log({ stats });
      return stats;
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }
  async getStatisticsForUserSchedule(userId: number, scheduleId: number) {
    if (!userId || !scheduleId) {
      throw new ForbiddenException('No userId or no scheduleId');
    }
    try {
      const result = await this.prismaService.shiftUserStatistic.findUnique({
        where: {
          userId_scheduleId: {
            userId: userId,
            scheduleId: scheduleId,
          },
        },
      });
      console.log('result in user stats for sced', { result });
      return result;
    } catch (error) {
      throw new ForbiddenException(error);
    }
  }
  async updateStatisticsForUser(userId: number, updateStats: UpdateStatsDto) {
    if (!userId || !updateStats) {
      throw new ForbiddenException('Wrong details');
    }
    try {
      const result = await this.prismaService.shiftUserStatistic.update({
        where: {
          userId_scheduleId: {
            userId: userId,
            scheduleId: updateStats.scheduleId,
          },
        },
        data: {
          morningShifts: updateStats.morningShifts,
          nightShifts: updateStats.nightShifts,
        },
      });
    } catch (error) {
      throw new ForbiddenException('error in update', error);
    }
  }
  async getSaisticsForScedule(schedulId: number) {
    if (!schedulId) {
      throw new ForbiddenException('no user id');
    }
    try {
      const scehduleStatistics =
        await this.prismaService.shiftUserStatistic.findMany({
          where: {
            scheduleId: schedulId,
          },
        });
      return scehduleStatistics;
    } catch (error) {
      console.log('no stats to show , @getAllStatisticsForSchedule');
      throw new ForbiddenException(error.message);
    }
  }
  async setNewRecord(record: UpdateStatsDto) {
    try {
      if (record.userId && record.scheduleId) {
        const result = await this.prismaService.shiftUserStatistic.create({
          data: {
            userId: record.userId,
            scheduleId: record.scheduleId,
            morningShifts: record.morningShifts ?? 0,
            noonShifts: record.noonShift ?? 0,
            nightShifts: record.nightShifts ?? 0,
            overTimeStep1: record.overTimerStep1 ?? 0,
            overTimeStep2: record.overTimeStep2 ?? 0,
            restDayHours: record.restDayHours ?? 0,
          },
        });

        return result;
      }
    } catch (error) {
      throw new ForbiddenException('error', error);
    }
  }
  // async createUsersStatsForScheduleShifts(shifts: shift[]) {
  //   //Create new stats for all users in schedule shifts.
  //   //return true if sucssed
  //   //get all users and create map
  //   const userStatisticsMap: Map<
  //     number,
  //     {
  //       morningShifts: number;
  //       noonShifts: number;
  //       nightShifts: number;
  //       overTimeStep1: number;
  //       overTimeStep2: number;
  //       restDayHours: number;
  //       scheduleId: number;
  //     }
  //   > = new Map();
  //   //count shifts
  //   shifts.forEach((shift) => {
  //     const userId = shift.userId; // Replace with the actual property that holds the user ID
  //     const shiftType = shift.shiftType; // Replace with the actual property that holds the shift type
  //     let step1: number = 0;
  //     let step2: number = 0;
  //     let restDay: number = 0;
  //     //check if day is restDay
  //     const isRest = (shift) => {
  //       return (
  //         (shift.shiftStartHour.getDay() === restDayConf.start.day &&
  //           shift.shiftStartHour.getHours > 14 ) ||
  //         (shift.shiftStartHour.getDay() === restDayConf.end.day &&
  //           shift.shiftStartHour.getHours() < restDayConf.end.houre)
  //       );
  //     };
  //     if (shiftType !== 'noonCanceled') {
  //       console.log(
  //         { shift },
  //         'shiftstats 114',
  //         shift.shiftStartHour.getDay(),
  //         restDayConf.start.day,
  //         shift.shiftStartHour.getDay() === restDayConf.start.day &&
  //           shiftType !== 'morning',
  //       );
  //       if (isRest(shift)) {
  //         console.log('rest day');
  //         if (shiftType === 'night' || shiftType === 'morning') {
  //           console.log('night or morning');
  //           if (shift.typeOfShift === 'long') {
  //             restDay = restDay + 12;
  //             console.log('added long rest ', { shift });
  //           } else {
  //             restDay = restDay + 8;
  //             console.log('added 8 rest', { shift });
  //           }
  //         } else if (shiftType.name === 'noon') {
  //           restDay = restDay + 4;
  //           console.log('added 4', { shift }, { restDay });
  //         }
  //       }
  //       if (shift.typeOfShift === 'long' && !isRest(shift)) {
  //         console.log('long shift steps count');
  //         if (shiftType.name === 'morning') {
  //           step1 += 2;
  //           step2 += 2;
  //         }
  //         else if (shiftType.name === 'night') {
  //           step1 += 1;
  //           step2 += 3;
  //         }
  //       }
  //       //Update user statistics map accordingly
  //       if (userStatisticsMap.has(userId)) {
  //         const userStats = userStatisticsMap.get(userId);
  //         console.log(
  //           'userId',
  //           { userStats },
  //           shiftType,
  //           { shift },
  //           { restDay },
  //         );
  //         console.log({ shiftType });
  //         if (shiftType.name === 'morning') {
  //           userStats.morningShifts++;
  //         } else if (shiftType.name === 'noon') {
  //           userStats.noonShifts++;
  //         } else if (shiftType.name === 'night') {
  //           userStats.nightShifts++;
  //         }
  //         userStats.overTimeStep1 +=step1;
  //         userStats.overTimeStep2 += step2;
  //         userStats.restDayHours += restDay;
  //         userStats.scheduleId = shift.scheduleId;
  //         console.log('userId', { userStats });
  //       } else {
  //         console.log(' else in userStatsmap');
  //         const userStats = {
  //           morningShifts: shiftType.name === 'morning' ? 1 : 0,
  //           noonShifts: shiftType.name === 'noon' ? 1 : 0,
  //           nightShifts: shiftType.name === 'night' ? 1 : 0,
  //           overTimeStep1: step1,
  //           overTimeStep2: step2,
  //           restDayHours: restDay,
  //           scheduleId: shift.scheduleId,
  //         };
  //         console.log({ userId, userStats });
  //         userStatisticsMap.set(userId, userStats);
  //       }
  //     }
  //   });

  //   console.log('stats map', { userStatisticsMap });
  //   //create stats for each user
  //   for (const [userId, userStats] of userStatisticsMap) {
  //     const {
  //       morningShifts,
  //       noonShifts,
  //       nightShifts,
  //       scheduleId,
  //       overTimeStep1,
  //       overTimeStep2,
  //       restDayHours,
  //     } = userStats;

  //     // Check if a ShiftUserStatistic record already exists for the user and schedule (you can use Prisma to check)
  //     if (userId !== null) {
  //       // console.log({userId},'userid')
  //       const existingUserStats =
  //         await this.prismaService.shiftUserStatistic.findUnique({
  //           where: {
  //             userId_scheduleId: {
  //               userId: userId,
  //               scheduleId: scheduleId, // Replace with the actual schedule ID
  //             },
  //           },
  //         });

  //       if (existingUserStats) {
  //         // Update existing ShiftUserStatistic record
  //         await this.prismaService.shiftUserStatistic.update({
  //           where: {
  //             userId_scheduleId: {
  //               userId: existingUserStats.userId,
  //               scheduleId: existingUserStats.scheduleId,
  //             },
  //           },
  //           data: {
  //             morningShifts: morningShifts,
  //             noonShifts: noonShifts,
  //             nightShifts: nightShifts,
  //             restDayHours: restDayHours,
  //             overTimeStep1: overTimeStep1,
  //             overTimeStep2: overTimeStep2,
  //           },
  //         });
  //       } else {
  //         // Create new ShiftUserStatistic record
  //         await this.prismaService.shiftUserStatistic.create({
  //           data: {
  //             userId: userId,
  //             scheduleId: scheduleId,
  //             morningShifts: morningShifts,
  //             noonShifts: noonShifts,
  //             nightShifts: nightShifts,
  //             overTimeStep1: overTimeStep1,
  //             overTimeStep2: overTimeStep2,
  //             restDayHours: restDayHours,
  //           },
  //         });
  //       }
  //     }
  //   }

  //   return true; // Return true if succeeded
  // }

  async createUsersStatsForScheduleShift(
    shifts: shift[],
    restDays: ScheduleTime | undefined,
  ) {
    //Create new stats for all users in schedule shifts.
    //return true if sucssed
    //get all users and create map
    const userStatisticsMap: Map<
      number,
      {
        morningShifts: number;
        noonShifts: number;
        nightShifts: number;
        overTimeStep1: number;
        overTimeStep2: number;
        restDayHours: number;
        scheduleId: number;
      }
    > = new Map();
    //count shifts
    shifts.forEach(async (shift) => {
      const userId = shift.userId;
      const shiftType = this.shiftService.classifyShiftTypeForStats(
        shift.shiftStartHour,
        shift.shiftEndHour,
      );
      let step1: number = 0;
      let step2: number = 0;
      let restDay: number = 0;
      //check if day is restDay
      const isRest = await this.shiftService.isShiftInRestDay(shift, restDays);

      if (shift.userId === undefined || shift.userId === null) {
        console.log(
          { shift },
          'shiftstats 114',
          shift.shiftStartHour.getDay(),
          restDayConf.start.day,
          shift.shiftStartHour.getDay() === restDayConf.start.day &&
            shiftType !== 'morning',
        );
        if (isRest) {
          console.log('rest day');
          if (shiftType === 'night' || shiftType === 'morning') {
            console.log('night or morning');
            if (shift.typeOfShift === 'long') {
              restDay = restDay + 12;
              console.log('added long rest ', { shift });
            } else {
              restDay = restDay + 8;
              console.log('added 8 rest', { shift });
            }
          } else if (shiftType === 'noon') {
            restDay = restDay + 4;
            console.log('added 4', { shift }, { restDay });
          }
        }
        if (shift.typeOfShift === 'long' && !isRest) {
          console.log('long shift steps count');
          if (shiftType === 'morning') {
            step1 += 2;
            step2 += 2;
          } else if (shiftType === 'night') {
            step1 += 1;
            step2 += 3;
          }
        }
        //Update user statistics map accordingly
        if (userStatisticsMap.has(userId)) {
          const userStats = userStatisticsMap.get(userId);
          console.log(
            'userId',
            { userStats },
            shiftType,
            { shift },
            { restDay },
          );
          console.log({ shiftType });
          if (shiftType === 'morning') {
            userStats.morningShifts++;
          } else if (shiftType === 'noon') {
            userStats.noonShifts++;
          } else if (shiftType === 'night') {
            userStats.nightShifts++;
          }
          userStats.overTimeStep1 += step1;
          userStats.overTimeStep2 += step2;
          userStats.restDayHours += restDay;
          userStats.scheduleId = shift.scheduleId;
          console.log('userId', { userStats });
        } else {
          console.log(' else in userStatsmap');
          const userStats = {
            morningShifts: shiftType === 'morning' ? 1 : 0,
            noonShifts: shiftType === 'noon' ? 1 : 0,
            nightShifts: shiftType === 'night' ? 1 : 0,
            overTimeStep1: step1,
            overTimeStep2: step2,
            restDayHours: restDay,
            scheduleId: shift.scheduleId,
          };
          console.log({ userId, userStats });
          userStatisticsMap.set(userId, userStats);
        }
      }
    });

    console.log('stats map', { userStatisticsMap });
    //create stats for each user
    for (const [userId, userStats] of userStatisticsMap) {
      const {
        morningShifts,
        noonShifts,
        nightShifts,
        scheduleId,
        overTimeStep1,
        overTimeStep2,
        restDayHours,
      } = userStats;

      // Check if a ShiftUserStatistic record already exists for the user and schedule (you can use Prisma to check)
      if (userId !== null) {
        // console.log({userId},'userid')
        const existingUserStats =
          await this.prismaService.shiftUserStatistic.findUnique({
            where: {
              userId_scheduleId: {
                userId: userId,
                scheduleId: scheduleId, // Replace with the actual schedule ID
              },
            },
          });

        if (existingUserStats) {
          // Update existing ShiftUserStatistic record
          await this.prismaService.shiftUserStatistic.update({
            where: {
              userId_scheduleId: {
                userId: existingUserStats.userId,
                scheduleId: existingUserStats.scheduleId,
              },
            },
            data: {
              morningShifts: morningShifts,
              noonShifts: noonShifts,
              nightShifts: nightShifts,
              restDayHours: restDayHours,
              overTimeStep1: overTimeStep1,
              overTimeStep2: overTimeStep2,
            },
          });
        } else {
          // Create new ShiftUserStatistic record
          await this.prismaService.shiftUserStatistic.create({
            data: {
              userId: userId,
              scheduleId: scheduleId,
              morningShifts: morningShifts,
              noonShifts: noonShifts,
              nightShifts: nightShifts,
              overTimeStep1: overTimeStep1,
              overTimeStep2: overTimeStep2,
              restDayHours: restDayHours,
            },
          });
        }
      }
    }

    return true; // Return true if succeeded
  }
}
