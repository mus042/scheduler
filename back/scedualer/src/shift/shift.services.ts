import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ShiftDto, shiftMoldDto } from './dto';
import { AuthDto } from '../auth/dto/';
import {
  ScheduleMoldPayload,
  ScheduleTime,
  ShiftUserStatistic,
  scheduleType,
  shift,
  user,
} from '@prisma/client';
import { EditShiftDto } from './dto/editShift.dto';
import { UsershiftStats } from 'src/user-statistics/userShiftStats.dto';

@Injectable()
export class ShiftService {
  constructor(private prisma: PrismaService) {}

  /**
   * @description Create a new shift on DB
   *
   * @param {number} userId
   * @param {ShiftDto} dto
   * @returns {shift}
   * @memberof ShiftService
   */

  async creatShift(userId: number, dto: ShiftDto) {
    try {
      console.log({ dto });
       const shift = dto.shiftRole
        ? await this.prisma.shift.create({
            data: {
              userId: userId,
              shiftType: dto.shiftType,
              shiftName: dto.shiftName ? dto.shiftName : dto.shiftType,
              userPreference: dto.userPreference,
              shiftTimeName: dto.shiftTimeName,
              shiftStartHour: dto.shiftStartHour,
              shiftEndHour: dto.shiftEndHour,
              typeOfShift: dto.typeOfShift,
              scheduleId: dto.scheduleId,
              // shiftRoles: {
              //   create: dto.shiftRoles.map((role) => ({
              //     roleId: role.roleId,
              //     userId: role.userId,
              //     scheduleId: dto.scheduleId,
              //   })),
              // },
            },
          })
        : await this.prisma.shift.create({
            data: {
              userId: userId,
              shiftType: dto.shiftType,
              shiftName: dto.shiftName ? dto.shiftName : dto.shiftType,
              userPreference: dto.userPreference,
              shiftTimeName: dto.shiftTimeName,
              shiftStartHour: dto.shiftStartHour,
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
          shiftTimeName: dto.shiftTimeName,
          shiftName: dto.shiftName || dto.shiftType + '_' + dto.typeOfShift,
          userPreference: dto.userPreference,
          shiftType: dto.shiftType,
          shiftStartHour: dto.shiftStartHour,
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
  async replaceUser(shiftInfo) {
    //update shift - Replace the user for existing shift, return new shift
    try {
      console.log({ shiftInfo }, shiftInfo.shift.id);
      const formershfit = await this.prisma.shift.findUnique({
        where: { id: shiftInfo.shift.id },
        select: {
          userId: true,
        },
      });
      console.log({ formershfit });
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
      const originalUserShiftStats =
        await this.prisma.shiftUserStatistic.findUnique({
          where: {
            userId_scheduleId: {
              userId: originalUserId,
              scheduleId: shiftInfo.schedualId,
            },
          },
        });
      //change count
      if (shiftInfo.shiftType === 'morning') {
        originalUserShiftStats.morningShifts =
          originalUserShiftStats.morningShifts - 1;
      } else if (shiftInfo.shiftType === 'noon') {
        originalUserShiftStats.noonShifts =
          originalUserShiftStats.noonShifts - 1;
      } else if (shiftInfo.shiftType === 'night') {
        originalUserShiftStats.nightShifts =
          originalUserShiftStats.nightShifts - 1;
      }
      const updateOriginalUserStat: UsershiftStats = {
        ...originalUserShiftStats,
      };
      const newUserShiftStats = await this.prisma.shiftUserStatistic.findUnique(
        {
          where: {
            userId_scheduleId: {
              userId: shiftInfo.newUser,
              scheduleId: shiftInfo.schedualId,
            },
          },
        },
      );
      //change count
      if (shiftInfo.shiftType === 'morning') {
        originalUserShiftStats.morningShifts =
          originalUserShiftStats.morningShifts - 1;
      } else if (shiftInfo.shiftType === 'noon') {
        originalUserShiftStats.noonShifts =
          originalUserShiftStats.noonShifts - 1;
      } else if (shiftInfo.shiftType === 'night') {
        originalUserShiftStats.nightShifts =
          originalUserShiftStats.nightShifts - 1;
      }
      const updateNewUserStat: UsershiftStats = {
        ...originalUserShiftStats,
      };

      return updatedShift;
    } catch (error) {
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
    console.log({scheduleId},"scheudule id")
    console.log("scheudule id")
    console.log("scheudule id")
    try {
      const shifts = await this.prisma.shift.findMany({
        where: {
          scheduleId: {
            equals: id,
          },
        },
        include: {
          userRef:true,
       
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
        include: {
          userRef: true,
        },
      });
      if (!shift) {
        throw new ForbiddenException('shift not fond ');
      }

      const userRef: user | any = shift.userId
        ? await this.prisma.user.findUnique({
            where: {
              id: shift.userId,
            },
          })
        : {};
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

  //This function is replacved by the next one
  // async getShiftByDateScheduleId(dateofShift: Date, scheduleId: number) {
  //   //return a shift of scedualId and Date
  //   //To cheack if work
  //   // console.log({editShiftByDateDto});
  //   try {
  //     const shiftDate = new Date(dateofShift);
  //     // console.log({dateofShift,scheduleId})
  //     const shift = await this.prisma.shift.findFirst({
  //       //change to find uniqe
  //       where: {
  //         scheduleId: {
  //           equals: scheduleId,
  //         },
  //         shiftDate: {
  //           equals: shiftDate,
  //         },
  //       },
  //     });
  //     const userRef: user = await this.prisma.user.findUnique({
  //       where: {
  //         id: shift.userId,
  //       },
  //     });
  //     delete userRef.hash;
  //     const shiftDto: ShiftDto = { ...shift, userRef };
  //     return shiftDto;
  //   } catch (eror) {
  //     console.log({ eror });
  //     if (eror.code === 'P2025') {
  //       throw new ForbiddenException('shift not fond ');
  //     }
  //     throw new ForbiddenException(eror);
  //   }
  // }

  /**
   * @description return first shift for param and date.
   * param can be id, userId, scheduleId...
   *
   * @param {Date} dateOfShift
   * @param {{ value: any, name: string }} otherParam
   * @returns {*}
   * @memberof ShiftService
   */
  async getUserShiftByParam(
    dateOfShift: Date,
    otherParam: { value: any; name: string },
  ) {
    try {
      // Set the start and end bounds of the day
      const startOfDay = new Date(dateOfShift);
      startOfDay.setHours(0, 0, 0, 0); // Beginning of the day

      const endOfDay = new Date(startOfDay);
      endOfDay.setDate(endOfDay.getDate() + 1); // Start of the next day

      // Constructing the where clause dynamically
      const whereClause = {
        [otherParam.name]: otherParam.value,
        shiftStartHour: {
          gte: startOfDay, // Greater than or equal to the start of the day
          lt: endOfDay, // Less than the start of the next day
        },
      };

      const shift = await this.prisma.shift.findFirst({
        where: whereClause,
        include: {
          userRef: true, // Include the user reference if needed
        },
      });

      if (shift && shift.userRef) {
        delete shift.userRef.hash; // Removing hash for security if userRef exists
      }

      return shift;
    } catch (error) {
      // Handle or throw error
      throw new ForbiddenException('No shifts been found');
    }
  }

  async getShiftByDateSchedType(shiftDate: Date, schedtype: scheduleType) {
    try {
      const shift: shift = await this.prisma.shift.findFirst({
        where: {
          shiftStartHour: shiftDate,
          shiftType: schedtype,
        },
      });
      return shift;
    } catch (eror) {
      console.log(eror);
      return undefined;
    }
  }
  async updateShiftById(
    oldShift: shift | ShiftDto,
    newShift: shift | ShiftDto,
  ) {
    let updatedShift: shift = undefined;
    try {
      updatedShift = await this.prisma.shift.update({
        where: {
          id: oldShift.id,
        },
        data: {
          shiftStartHour: newShift.shiftStartHour,
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

  /**
   * @description Get the next shift (Date after today) from system schdule.
   * @param {number} userId
   * @returns {*}
   * @memberof ShiftService
   */
  async getNextShift(userId: number) {
    const currentDate = new Date();
    console.log({ currentDate });
    try {
      console.log('nextShift');
      const currentDate = new Date(); // Make sure currentDate is defined and holds the current date-time
      const nextShift = await this.prisma.shift.findFirst({
        where: {
          shiftStartHour: {
            gt: currentDate, // Filter for shifts that have a startTime greater than the current date and time
          },
          userId: userId, // Filter for shifts that belong to the given userId
          shiftType: 'systemSchedule',
        },
        include: {
          userRef: true,
        },
        orderBy: {
          shiftStartHour: 'asc',
        },
      });

      nextShift?.userRef && delete nextShift.userRef.hash;
      const shiftDto: ShiftDto = { ...nextShift };
      return shiftDto;
    } catch (error) {
      console.error(error);
    }
  }
  async updateUserForShift(shiftId: number, newUserId: number) {}

  classifyShiftTypeForStats(shiftStart: Date, shiftEnd: Date) {
    if (!shiftStart) {
      throw new ForbiddenException('Date unexpcted');
    } else {
      if (shiftStart.getHours() >= 5 && shiftStart.getHours() < 13) {
        return 'morning';
      } else if (
        shiftStart.getHours() >= 13 &&
        shiftStart.getHours() <= 21 &&
        shiftEnd.getHours() <= 24
      ) {
        return 'noon';
      } else {
        return 'night';
      }
    }
  }
  getShiftTypeName(shift) {
    //Return the shift type by shiftTypeId;
  }

  /**
   * @description Check if shift is in the res day hours.
   * @param {*} shift
   * @returns {*}  {boolean}
   * @memberof ShiftService
   */
  async isShiftInRestDay(shift, restDays: ScheduleTime | undefined) {
    //This will accept a shift and call the schedule mold to chack if shift hours are within restDay
    console.log({ restDays });
    try {
      const restDayTime = await this.prisma.scheduleMold.findFirst({
        where: { selected: true },
        include: {
          restDays: true,
        },
      });

      console.log({ restDayTime });
      if (!restDayTime) {
        throw new Error('Rest day information not found');
      }

      const res =
        (shift.shiftStartHour.getDay() === restDayTime.restDays.startDay &&
          shift.shiftStartHour.getHours >
            Number(restDayTime.restDays.startHour)) ||
        (shift.shiftStartHour.getDay() === restDayTime.restDays.endDay &&
          shift.shiftStartHour.getHours() >
            Number(restDayTime.restDays.endHour));
      console.log({ res });
      return res;
    } catch (error) {
      console.error('Error in isShiftInRestDay:', error);
      throw error;
    }
  }
}
