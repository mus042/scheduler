import {
  PrismaClient,
  schedule,
  shift,
  typeOfShift,
  ScheduleMold,
  ScheduleMoldPayload,
  scheduleType,
  shiftTimeClassification,
} from '@prisma/client';
import { ShiftDto } from '../shift/dto';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { ShiftService } from '../shift/shift.services';
import { UserService } from '../user/user.service';
import { scheduleDto } from './dto';

@Injectable()
export class ScheduleUtil {
  private userShiftCount = {};
  private shiftsStats = {};
  constructor(
    private userService: UserService,
    private ShiftService: ShiftService,
  ) {}

  getLeastOptionsForShift(
    emptySchedule: ShiftDto[],
    usersSchedules: shift[][],
  ) {
    const option3users = { shiftTime: undefined, numOfOptions: undefined };
    const option2Users = { shiftTime: undefined, numOfOptions: undefined };
    const option1Users = { shiftTime: undefined, numOfOptions: undefined };

    const minUsers = { shiftTime: 0, min: 0 };

    emptySchedule.forEach((emptyshift: ShiftDto) => {
      option3users[emptyshift.shiftStartHour.getTime()] = 0;
      option2Users[emptyshift.shiftStartHour.getTime()] = 0;
      option1Users[emptyshift.shiftStartHour.getTime()] = 0;
      // options[emptyshift.shiftStartHour.getTime()] = emptyshift.shiftStartHour.getTime() ;
      usersSchedules.forEach((userShifts: shift[]) => {
        const filterd = userShifts.filter(
          (userShift: shift) =>
            userShift.shiftStartHour.getTime() ===
            emptyshift.shiftStartHour.getTime(),
        );
        if (filterd.length > 0) {
          if (filterd[0].userPreference === '1') {
            option1Users[emptyshift.shiftStartHour.getTime()] += 1;
          } else if (filterd[0].userPreference === '2') {
            option2Users[emptyshift.shiftStartHour.getTime()] += 1;
          } else if (filterd[0].userPreference === '3') {
            option3users[emptyshift.shiftStartHour.getTime()] += 1;
          }
        }
      });
      // console.log({option3users})
      // option3users[emptyshift.shiftStartHour.getTime()]  = count;
      if (minUsers.min < option3users[emptyshift.shiftStartHour.getTime()]) {
        // console.log({option3users})
        minUsers.shiftTime = emptyshift.shiftStartHour.getTime();
        minUsers.min = option3users[emptyshift.shiftStartHour.getTime()];
      }
    });

    const shift: ShiftDto = emptySchedule.find(
      (emptyShift: ShiftDto) =>
        emptyShift.shiftStartHour.getTime() === minUsers.shiftTime,
    );
    // console.log({ minUsers }, { shift });
    return shift;
  }

  getScheduleBeforForUser() {}
  fillMinUserShifts(emptySchedule: ShiftDto[], usersSchedules: shift[][]) {
    //get the shift with min user options. fill it with selcted shift
    let localArr: ShiftDto[] = emptySchedule;

    for (let i = 0; i < 3; i++) {
      const shiftTo = this.getLeastOptionsForShift(localArr, usersSchedules);
      if (shiftTo) {
        const index: number = emptySchedule.findIndex(
          (shiftToSerach: ShiftDto) =>
            shiftToSerach.shiftStartHour.getTime() ===
            shiftTo.shiftStartHour.getTime(),
        );
        const possieShifts: ShiftDto[] = this.searchPossibleUsersForShift(
          shiftTo.shiftStartHour,
          usersSchedules,
        );
        if (possieShifts.length < 1) {
          // console.log({ index }, { possieShifts });
          //no possible shifts.
          //consider handel no options for shift
          // throw new ForbiddenException("there is no user to fill least users shift ")
          localArr = localArr.filter(
            (shift: ShiftDto) =>
              shift.shiftStartHour.getTime() !==
              shiftTo.shiftStartHour.getTime(),
          );
        } else {
          const shift: ShiftDto = this.selcetShiftFromList(
            possieShifts,
            localArr[index],
          );
          // console.log({ shift });
          emptySchedule[index] = {
            userId: shift.userId,
            // shiftDate: shift.shiftDate,
            shiftEndHour: shift.shiftEndHour,
            shiftStartHour: shift.shiftStartHour,
            shiftType: shift.shiftType,
            userPreference: shift.userPreference,
            scheduleId: emptySchedule[0].scheduleId,
            // typeOfUser: shift.userRef.typeOfUser,
          };
          localArr = localArr.filter(
            (shift: shift) =>
              shift.shiftStartHour.getTime() !==
              shiftTo.shiftStartHour.getTime(),
          );
        }

        // console.log(localArr)
      }
    }
    return emptySchedule;
  }
  setToNextDayOfWeek(targetDayOfWeek) {
    //Wil find the next date object until this day.
    const currentDate = new Date();
    currentDate.setUTCHours(0, 0, 0, 0);
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
    console.log({ adjusted });
    adjusted.setTime(
      adjusted.getTime() + targetDayOfWeek * 24 * 60 * 60 * 1000,
    );
    return adjusted;
  }

  generateNewScheduleShifts(
    startingDate: Date,
    endDate: Date,
    scheduleId: number,
    schedulMold: any | undefined,
    type: scheduleType,
  ) {
    const shifts: ShiftDto[] = schedulMold.shiftsTemplate.map(
      (shift, index) => {
        console.log('shift Roles', shift.roles, { shift });
        // const tmpShiftType: shiftTimeClassification
        //   = shift.name.toLowerCase();
        const startDate = this.setToNextDayOfWeek(shift.day);
        startDate.setUTCHours(shift.startHour, 0, 0, 0);
        const endDate = this.setToNextDayOfWeek(shift.day);
        endDate.setUTCHours(shift.endHour, 0, 0, 0);
        console.log({ startDate }, { endDate }, shift.startHour, shift.day);
        if (type === 'systemSchedule') {
          const shiftsByRoles = shift.userPrefs.map((role) => {
            //create shift for each mold role
            console.log('Role in generate shhifts ', { role });
            // roles
            return {
              userPreference: '0',
              shiftDate: new Date(startDate),
              shiftType: type,
              typeOfShift: 'short',
              shiftStartHour: new Date(startDate),
              shiftEndHour: new Date(endDate),
              scheduleId: scheduleId,
              userNeededType: role.id,
            };
          });
          console.log({ shiftsByRoles });
          return shiftsByRoles;
        }
        const dto: ShiftDto = {
          userPreference: '0',
          // shiftDate: new Date(startDate),
          shiftType: type,
          typeOfShift: 'short',
          shiftStartHour: new Date(startDate),
          shiftEndHour: new Date(endDate),
          scheduleId: scheduleId,
        };
        console.log({ dto });
        return dto;
      },
    );

    console.log('shifts :', { shifts });
    return shifts;
  }

  searchPossibleUsersForShift(shiftDate: Date, usersShifts: shift[][]) {
    const possibleUsersForShift: ShiftDto[] = [];
    //get all dates of shiftDate && scheduleid?
    const date: Date = new Date(shiftDate);
    //cheack all users Schedules for shifts with same date
    usersShifts.map((userSched: shift[]) => {
      userSched.map((userShift: shift) => {
        if (this.userShiftCount[userShift.userId] === undefined) {
          this.userShiftCount[userShift.userId] = 0;
        }
        if (
          date.getTime() === userShift.shiftStartHour.getTime() &&
          userShift.userPreference !== '3'
        ) {
          const possibleShift = { ...userShift };
          possibleUsersForShift.push({ ...possibleShift });
        }
      });
    });
    if (possibleUsersForShift.length < 1) {
    }
    //consider seperating userPref 1\2 search .
    // return possible users
    return possibleUsersForShift;
  }
  async getShiftBeforAndAfter(shift: shift) {
    const shiftBeforDate: Date = new Date(shift.shiftStartHour);
    const shiftAfterDate: Date = new Date(shift.shiftStartHour);
    shiftAfterDate.setHours(shiftAfterDate.getHours() + 8);
    if (shiftAfterDate.getHours() >= 24) {
      shiftAfterDate.setDate(shift.shiftStartHour.getDate() + 1);
    }
    shiftBeforDate.setHours(shiftBeforDate.getHours() - 8);
    if (shiftBeforDate.getHours() < 0) {
      shiftBeforDate.setDate(shift.shiftStartHour.getDate() - 1);
    }
    //get shift start with date and schedule type = systemSchecule
    const shiftBefore: shift = await this.ShiftService.getShiftByDateSchedType(
      shiftBeforDate,
      scheduleType.systemSchedule,
    );
    const shiftAfter: shift = await this.ShiftService.getShiftByDateSchedType(
      shiftAfterDate,
      scheduleType.systemSchedule,
    );
    return { shiftBefore, shiftAfter };
  }
  isShiftpossible(shift: shift | ShiftDto, schedule: ShiftDto[] | schedule) {
    //Check if possible to place a shift in schedule
    //check if user has no shift on the same day
    //check if user dont have shift befor and after
    //case first or second shift of the week , should fetch the week befor last shift if exsit
    const morningTime = 6;
    console.log(shift);
    //To Add - get shifts from the db insted of geting them from object
    const scheduleShifts: ShiftDto[] = Array.isArray(schedule)
      ? schedule
      : schedule.shifts;

    // Sort the array by shiftStartHour in ascending order
    // console.log(schedule.shift ,{scheduleShifts} );
    scheduleShifts.sort(
      (a, b) => a.shiftStartHour.getTime() - b.shiftStartHour.getTime(),
    );

    const shiftIndexInSched: number = scheduleShifts.findIndex(
      (schedShift: shift) =>
        schedShift.shiftStartHour.getTime() === shift.shiftStartHour.getTime(),
    );
    console.log({ shiftIndexInSched }, 'shift index in the schedule ');
    if (shiftIndexInSched >= 0) {
      //found index
      console.log(
        'check days befor  after is shift possible ,  ',
        { shift },
        { shiftIndexInSched },
      );
      //check the shifts befor and after
      if (
        shiftIndexInSched < 1 ||
        shiftIndexInSched === scheduleShifts.length - 1
      ) {
        //case the index is 0 \ last one in arr
        if (shiftIndexInSched < 1) {
          console.log(
            'user 0',
            shift.userId !== scheduleShifts[shiftIndexInSched + 1]?.userId &&
              shift.userId !== scheduleShifts[shiftIndexInSched + 2]?.userId,
          );
          return (
            shift.userId !== scheduleShifts[shiftIndexInSched + 1]?.userId &&
            shift.userId !== scheduleShifts[shiftIndexInSched + 2]?.userId
          );
        } else {
          console.log(
            ' Last index ',
            scheduleShifts[shiftIndexInSched],
            scheduleShifts[shiftIndexInSched - 1]?.userId,
            shift.userId !== scheduleShifts[shiftIndexInSched - 2]?.userId,
          );
          return (
            shift.userId !== scheduleShifts[shiftIndexInSched - 1]?.userId &&
            shift.userId !== scheduleShifts[shiftIndexInSched - 2]?.userId
          );
        }
      }
      //

      //case index in the middile
      const shiftBefore =
        shift.userId !== scheduleShifts[shiftIndexInSched - 1]?.userId;
      const shiftAfter =
        shift.userId !== scheduleShifts[shiftIndexInSched + 1]?.userId;

      console.log(
        { shift },
        scheduleShifts[shiftIndexInSched + 1]?.userId,
        scheduleShifts[shiftIndexInSched - 1]?.userId,
        { shiftBefore },
        { shiftAfter },
      );
      if (shiftBefore === false || shiftAfter === false) {
        console.log('not allowd ');
        return false;
      }
      console.log(
        'if shift possible ',
        { shift },
        'shift time ',
        shift.shiftStartHour,
      );
      //in case morning shift - check if night is not assigned to same user
      console.log(
        shift.shiftStartHour.getHours() === morningTime,
        shift.shiftStartHour.getHours(),
      );
      if (shift.shiftTimeName === 'morning') {
        const sameDayShift =
          shift.userId === scheduleShifts[shiftIndexInSched + 2].userId;
        if (sameDayShift) {
          console.log('same day shift  < 11 ');
          return false;
        }
      } else if (shift.shiftTimeName === 'night') {
        //in case night shift
        console.log('samw day shift > 15');
        const sameDayShift =
          shift.userId === scheduleShifts[shiftIndexInSched - 2]?.userId;
        if (sameDayShift) {
          console.log('not allowed');
          return false;
        }
      }
      return true;
    }
    return false;
  }

  checkIfBreakBetweenShifts = (firstShift: Date, secondShift: Date) => {
    //Will subtract the ti,e btween and check if Bigger then 8

    const result: boolean =
      firstShift > secondShift
        ? (secondShift.getTime() - firstShift.getTime()) / 36e5 > 8
        : (firstShift.getTime() - secondShift.getTime()) / 36e5 > 8;
    console.log({ result }, { firstShift, secondShift });
    return result;
  };
  async fillSchedule(emptySchedule: ShiftDto[], usersShifts: shift[][]) {
    //search for each shift possible user and sign user to shift ;
    //apply rules :
    // user must have 8 hours between shifts
    // user must have at least 3 shifts a week
    //only one shift between friday  14 - suterday 2
    const scheduleToFill: ShiftDto[] = emptySchedule;
    const noUsersToAssigndShift: ShiftDto[] = [];
    let backTracking: number = 0;
    for (let i = 0; i < scheduleToFill.length; i++) {
      const emptyShift: ShiftDto = scheduleToFill[i];
      let canceledShift: ShiftDto;
      if (
        (emptyShift.userId === undefined ||
          emptyShift.userPreference === '4') &&
        emptyShift.shiftTimeName !== 'noonCanceled' &&
        emptyShift.typeOfShift !== 'long'
      ) {
        //Search For Possible users for a empty shift
        const possibleUsersToAssign: ShiftDto[] =
          this.searchPossibleUsersForShift(
            emptyShift.shiftStartHour,
            usersShifts,
          );

        // let shiftindex:number = -1;
        const possibleForShift: shift[] = [];
        possibleUsersToAssign.map((shift: shift, index: number) => {
          const ispos = this.isShiftpossible(shift, scheduleToFill);
          if (ispos === true) {
            // console.log('shift selcted', { shift });
            if (this.userShiftCount[shift.userId] === undefined) {
              this.userShiftCount[shift.userId] = 0;
            }
            possibleForShift.push({ ...shift });
          }
        });
        // console.log({possibleForShift});
        if (possibleForShift.length !== 0) {
          const selctedShift: ShiftDto = this.selcetShiftFromList(
            possibleForShift,
            emptyShift,
          );
          // console.log({ selctedShift });
          if (selctedShift) {
            const assessNextShift = () => {
              if (i < scheduleToFill.length - 1) {
                const possibleUsersToAssignNext: ShiftDto[] =
                  this.searchPossibleUsersForShift(
                    scheduleToFill[i + 1].shiftStartHour,
                    usersShifts,
                  );
                //get next shift options, check if it has other options then selcted
                const filterdArr: ShiftDto[] = possibleUsersToAssignNext.filter(
                  (shift) => shift.userId !== selctedShift.userId,
                );

                if (filterdArr.length <= 1) {
                  //backtrack to shift assigned
                  const index = this.getShiftIndex(
                    selctedShift,
                    possibleForShift,
                  );
                  possibleForShift.splice(index, 1);
                  // console.log({ possibleForShift });
                  backTracking += 1;
                  return false;
                }
              }
              return true;
            };
            console.log(
              selctedShift.userId,
              this.userShiftCount[selctedShift.userId],
            );
            if (
              selctedShift.userId > 0 &&
              this.userShiftCount[selctedShift.userId] < 6
            ) {
              if (assessNextShift()) {
                this.userShiftCount[selctedShift.userId] += 1;
                scheduleToFill[i] = {
                  userId: selctedShift.userId,
                  // shiftDate: selctedShift.shiftDate,
                  shiftEndHour: selctedShift.shiftEndHour,
                  shiftStartHour: selctedShift.shiftStartHour,
                  shiftType: selctedShift.shiftType,
                  typeOfShift: selctedShift.typeOfShift,
                  userPreference: selctedShift.userPreference,
                  scheduleId: scheduleToFill[0].scheduleId,
                  // typeOfUser: selctedShift.userRef.typeOfUser,
                };
              } else {
                console.log({ assessNextShift });
                const otherPossible = possibleForShift.filter(
                  (shift: shift) => shift.id !== selctedShift.id,
                );

                if (otherPossible.length > 1) {
                  const newSelcetShift: ShiftDto = this.selcetShiftFromList(
                    otherPossible,
                    emptyShift,
                  );
                  console.log({ newSelcetShift });
                  if (newSelcetShift && newSelcetShift.userId !== undefined) {
                    scheduleToFill[i] = {
                      userId: newSelcetShift.userId,
                      // shiftDate: newSelcetShift.shiftDate,
                      shiftEndHour: newSelcetShift.shiftEndHour,
                      shiftStartHour: newSelcetShift.shiftStartHour,
                      shiftType: newSelcetShift.shiftType,
                      userPreference: newSelcetShift.userPreference,
                      scheduleId: scheduleToFill[0].scheduleId,
                      // typeOfUser: newSelcetShift.userRef.typeOfUser,
                    };
                  } else {
                  }
                  this.userShiftCount[selctedShift.userId] += 1;
                  scheduleToFill[i] = {
                    userId: selctedShift.userId,
                    // shiftDate: selctedShift.shiftDate,
                    shiftEndHour: selctedShift.shiftEndHour,
                    shiftStartHour: selctedShift.shiftStartHour,
                    shiftType: selctedShift.shiftType,
                    userPreference: selctedShift.userPreference,
                    scheduleId: scheduleToFill[0].scheduleId,
                    // typeOfUser: selctedShift.userRef.typeOfUser,
                  };
                }
              }
            } else if (
              selctedShift.userId > 0 &&
              possibleUsersToAssign.length === 1
            ) {
              console.log(' try replace shift ', { selctedShift });
              //search all user shifts in schedule
              const userOtherShifts: ShiftDto[] = scheduleToFill.filter(
                (otherShift: shift) =>
                  otherShift.userId === selctedShift.userId,
              );
              const posibleShiftsReplace: ShiftDto[] = [];
              //check if other user can replace
              userOtherShifts.forEach((shift: shift, index: number) => {
                const possibleUser: ShiftDto[] =
                  this.searchPossibleUsersForShift(
                    shift.shiftStartHour,
                    usersShifts,
                  );
                possibleUser.forEach((shiftOption: shift) => {
                  if (
                    shift.userId !== shiftOption.userId &&
                    this.userShiftCount[shiftOption.userId] < 6
                  ) {
                    const shiftBefore: boolean =
                      i >= 1
                        ? shiftOption.userId !== scheduleToFill[i - 1].userId
                        : true;
                    const shiftAfter: boolean =
                      i < scheduleToFill.length - 1
                        ? shiftOption.userId !== scheduleToFill[i + 1].userId
                        : true;
                    if (shiftBefore && shiftAfter) {
                      posibleShiftsReplace.push({ ...shiftOption });
                    }
                  }
                });
              });
              console.log({ posibleShiftsReplace });
              //if other user replace other shift and push current shift to user
              if (posibleShiftsReplace.length > 0) {
                const selctedReplaceShift: ShiftDto = this.selcetShiftFromList(
                  posibleShiftsReplace,
                  emptyShift,
                );
                //replace shift and update count
                const shiftToReaplceIndex: number = this.getShiftIndex(
                  selctedReplaceShift,
                  scheduleToFill,
                );
                scheduleToFill[shiftToReaplceIndex] = {
                  userId: selctedReplaceShift.userId,
                  // shiftDate: selctedReplaceShift.shiftDate,
                  shiftEndHour: selctedReplaceShift.shiftEndHour,
                  shiftStartHour: selctedReplaceShift.shiftStartHour,
                  shiftType: selctedReplaceShift.shiftType,
                  userPreference: selctedReplaceShift.userPreference,
                  scheduleId: scheduleToFill[0].scheduleId,
                  // typeOfUser: selctedReplaceShift.userRef.typeOfUser,
                };
                this.userShiftCount[selctedReplaceShift.userId] += 1;
                this.userShiftCount[selctedShift.userId] -= 1;
                possibleForShift.push({
                  id: selctedShift.id,
                  userId: selctedShift.userId,
                  shiftName: selctedShift.shiftName,
                  shiftTimeName: selctedShift.shiftTimeName,
                  createdAt: selctedShift.createdAt,
                  updatedAt: selctedShift.updatedAt,
                  typeOfShift: selctedShift.typeOfShift,
                  shiftEndHour: selctedShift.shiftEndHour,
                  shiftStartHour: selctedShift.shiftStartHour,
                  shiftType: selctedShift.shiftType,
                  userPreference: selctedShift.userPreference,
                  scheduleId: scheduleToFill[0].scheduleId,
                  userRef: selctedShift.userRef,
                });
                backTracking += 1;
                console.log(
                  'backtrack',
                  { backTracking },
                  { selctedReplaceShift },
                );
              }
              //if no reaplce user for other shift try to cancelle user shift with 2 shifts a day
            } else if (
              selctedShift.userId > 0 &&
              this.userShiftCount[selctedShift.userId] === 6
            ) {
              // try to cancele one other shift
              //find other shifts by user , check if possible to make two a day
              //make two a day if possible. notice - if morning shift is missing - chack night shift as well samr for morning
              console.log('too many shifts try to cancelle one ');
              const userOtherShifts: ShiftDto[] = scheduleToFill.filter(
                (shift: ShiftDto) => shift.userId === selctedShift.userId,
              );

              userOtherShifts.forEach(async (shift: ShiftDto) => {
                let flag = false;
                if (!flag) {
                  const newSchedule = await this.twoShiftsADay(
                    shift.shiftStartHour,
                    scheduleToFill,
                    usersShifts,
                  );
                  flag = newSchedule?.length > 0;
                  this.userShiftCount[shift.userId] = flag
                    ? this.userShiftCount[shift.userId] - 1
                    : this.userShiftCount[shift.userId];

                  newSchedule?.forEach((shifToUpdate: ShiftDto) => {
                    const shiftIndex: number = scheduleToFill.findIndex(
                      (shift: ShiftDto) =>
                        shift.shiftStartHour.getTime() ===
                        shifToUpdate.shiftStartHour.getTime(),
                    );
                    console.log({ shiftIndex });
                    if (shiftIndex >= 0) {
                      scheduleToFill[shiftIndex] = { ...shifToUpdate };
                    }

                    console.log('shifts alterd', { newSchedule });
                  });
                }
              });
              console.log('no shift selected');
            }
          }
        }
      }
      if (
        scheduleToFill[i].userId === undefined &&
        scheduleToFill[i].shiftTimeName !== 'noonCanceled'
      ) {
        noUsersToAssigndShift.push({ ...emptyShift });
      }
    }

    noUsersToAssigndShift.forEach(async (shift) => {
      console.log('no users to assign 2 shifts a day try ');
      const shifts = await this.twoShiftsADay(
        shift.shiftStartHour,
        scheduleToFill,
        usersShifts,
      );

      if (shifts?.length > 0) {
        shifts.forEach((shiftToUpdate: ShiftDto) => {
          const index: number = scheduleToFill.findIndex(
            (update) =>
              (update.shiftStartHour.getTime() ===
                shiftToUpdate.shiftStartHour.getTime() &&
                shiftToUpdate.typeOfShift === 'long') ||
              (update.shiftEndHour.getTime() ===
                shiftToUpdate.shiftEndHour.getTime() &&
                shiftToUpdate.typeOfShift === 'long'),
          );

          if (index >= 0) {
            scheduleToFill[index] = { ...shiftToUpdate };
          }
        });

        // console.log({shifts})
      }
    });
    // console.log({ scheduleToFill });
    const emptyShifts = scheduleToFill.filter(
      (shift: ShiftDto) => shift.userPreference === '0',
    );
    console.log(this.userShiftCount);
    // console.log({emptyShifts})
    return { scheduleToFill, emptyShifts };
  }
  getShiftIndex(shift: ShiftDto, shiftArr) {
    shiftArr.forEach((shiftToCheck: shift, index: number) => {
      if (
        shift.shiftStartHour.getTime() ===
          shiftToCheck.shiftStartHour.getTime() &&
        shift.userId === shiftToCheck.userId
      ) {
        return index;
      }
    });
    return -1;
  }
  selcetShiftFromList(shiftOptions: ShiftDto[], emptyShift: ShiftDto) {
    //This should pick a shift from a list.
    //picking by number of shifts for user.

    //if list is empty
    if (shiftOptions.length < 1) {
      return;
    }
    if (shiftOptions.length === 1) {
      return shiftOptions[0];
    }

    let maxShiftScore = { id: 0, rate: 0 };
    const shiftsRating = { id: 0, rate: 0 };
    // Variable to store the maximum rating

    // itterate throw the options
    // console.log({ shiftOptions });
    shiftOptions.forEach((shift: ShiftDto) => {
      // const userTypeNeeded = emptyShift.userNeeded;
      //  console.log({shift});
      const userNumOfShifts: number = this.userShiftCount[shift.userId];
      //init shift match rating
      const userPref = parseInt(shift.userPreference);
      // const userType = shift.userType;
      // const userType = shift.userRef.typeOfUser;

      const userLevel = shift.userRef.userLevel;

      let shiftRating =
        userPref === 1 ? 10 * userLevel : userPref === 2 ? 5 * userLevel : 0;
      shiftRating =
        userNumOfShifts > 0 ? shiftRating / userNumOfShifts : shiftRating;
      shiftsRating[shift.id] = shiftRating;
      console.log({ shiftRating });
      // Update the maxRating if the current shift's rating is higher
      if (shiftsRating[shift.id] > maxShiftScore.rate) {
        maxShiftScore.rate = shiftRating;
        maxShiftScore.id = shift.id;
      }
    });
    // console.log(maxShiftScore.id);

    // console.log(shiftsRating[maxShiftScore.id]);
    const selctedShift: ShiftDto[] = shiftOptions.filter(
      (shift: shift) => shift.id === maxShiftScore.id,
    );
    // console.log({ selctedShift }, selctedShift[0]);
    return selctedShift[0];
  }
  async getUserprefForDate(
    shiftDate: Date,

    userid: number,
  ) {
    let shiftPref: string;

    const userShift: shift = await this.ShiftService.getUserShiftByParam(
      shiftDate,
      { name: 'userid', value: userid },
    );

    if (userShift?.userId !== undefined && userShift?.userPreference !== null) {
      // console.log({shiftDate},{userShift})
      shiftPref = userShift.userPreference;
      return shiftPref;
    }

    return '-1';
  }

  /**
   * @description Accepet date of day, and schedule , try to change day shifts to 12h shift insted of 8 by cancelling noon
   * @param {Date} dayToCheack
   * @param {ShiftDto[]} schedule
   * @param {ShiftDto[][]} usersShifts
   * @returns {shift[]}
   * @memberof ScheduleUtil
   */
  async twoShiftsADay(
    dayToCheack: Date,
    schedule: ShiftDto[],
    usersShifts: ShiftDto[][],
  ) {
    if (schedule[0].typeOfShift !== 'long') {
      const scheduleToFill: ShiftDto[] = [];
      const time = new Date(dayToCheack);
      const morningDate: Date = new Date(time);
      morningDate.setHours(9, 0, 0, 0);
      const noonDate: Date = new Date(morningDate);
      noonDate.setHours(morningDate.getHours() + 8);
      const nightDate: Date = new Date(noonDate);
      nightDate.setHours(nightDate.getHours() + 8);
      console.log('change to 2 shifts ', { morningDate }, schedule[0]);
      const morningShift: ShiftDto = schedule.find(
        (shift) => shift.shiftStartHour.getTime() === morningDate.getTime(),
      );
      const nightShift: ShiftDto = schedule.find(
        (shift) => shift.shiftStartHour.getTime() === nightDate.getTime(),
      );
      const noonIndex: number = schedule.findIndex(
        (shift: shift) => shift.shiftStartHour.getTime() === noonDate.getTime(),
      );
      const noonShift: ShiftDto = schedule.find(
        (shift) => shift.shiftStartHour.getTime() === noonDate.getTime(),
      );

      console.log(
        'change to 2 shifts ',
        { time },
        time.getHours(),
        { morningShift },
        { morningDate },
        morningDate.getHours(),
        schedule[2],
      );
      const morningAndNight: boolean =
        morningShift &&
        nightShift &&
        noonShift &&
        morningShift.typeOfShift !== 'long' &&
        noonShift.typeOfShift !== 'long' &&
        nightShift.typeOfShift !== 'long';
      console.log(
        { morningShift },
        { noonShift },
        { nightShift },
        { morningAndNight },
      );
      if (morningAndNight) {
        console.log({ time }, time.getHours());
        if (time.getHours() === noonDate.getHours()) {
          //noon shift missing

          //check if mornign and night are assigned
          const assignedOtherShifts: boolean =
            morningShift.userId && nightShift.userId ? true : false;
          //if there is possible for both assign new Hours of tje shifts /
          console.log({ assignedOtherShifts });
          if (assignedOtherShifts) {
            const morninguserPref = await this.getUserprefForDate(
              morningShift.shiftStartHour,
              morningShift.userId,
            );
            const nightuserPref = await this.getUserprefForDate(
              nightShift.shiftStartHour,
              nightShift.userId,
            );
            console.log('uer prf', { nightuserPref }, { morninguserPref });
            if (morninguserPref === '3' || nightuserPref === '3') {
              return;
            } else {
              const newEndTime: Date = new Date(morningShift.shiftEndHour);
              newEndTime.setHours(morningShift.shiftEndHour.getHours() + 4);
              const morningShiftUserId: number = morningShift.userId;
              scheduleToFill.push({
                userPreference: morningShift.userPreference,
                // shiftDate: new Date(morningShift.shiftDate.getTime()), // Create a new Date object for the shift date
                userId: morningShiftUserId,
                shiftTimeName: 'morning',
                shiftType: 'systemSchedule',
                typeOfShift: 'long',
                shiftStartHour: new Date(morningShift.shiftStartHour.getTime()),
                shiftEndHour: new Date(newEndTime),
                scheduleId: morningShift.scheduleId,
              });
              scheduleToFill.push({
                userPreference: '4',
                // shiftDate: new Date(noonShift.shiftDate.getTime()), // Create a new Date object
                shiftTimeName: 'noonCanceled',
                shiftType: 'systemSchedule',
                typeOfShift: 'long',
                shiftStartHour: new Date(noonShift.shiftStartHour),
                shiftEndHour: new Date(noonShift.shiftEndHour),
                scheduleId: noonShift.scheduleId,
              });
              scheduleToFill.push({
                userPreference: nightShift.userPreference,
                // shiftDate: new Date(nightShift.shiftDate.getTime()), // Create a new Date object for the shift date
                userId: nightShift.userId,
                shiftTimeName: 'night',
                shiftType: 'systemSchedule',
                shiftStartHour: new Date(newEndTime.getTime()),
                typeOfShift: 'long',
                shiftEndHour: new Date(nightShift.shiftEndHour.getTime()),
                scheduleId: nightShift.scheduleId,
              });
            }
            // console.log('changes shifts time');
          }
        } // if(morninguserPref !== '3' && nightuserPref !== '3'){
        else if (time.getHours() === morningDate.getHours()) {
          console.log({ time });
          console.log('morning shift');

          if (
            noonShift.userId !== undefined &&
            nightShift.userId !== undefined
          ) {
            //check if noon user have night befor
            if (
              schedule[noonIndex].userId === schedule[noonIndex - 2]?.userId ||
              nightShift.userId === schedule[noonIndex]?.userId
            ) {
              return;
            }
            morningShift.shiftEndHour.setHours(
              morningShift.shiftEndHour.getHours() + 4,
            );
            morningShift.userId = noonShift.userId;
            morningShift.userPreference = noonShift.userPreference;

            noonShift.userId = undefined;

            nightShift.shiftStartHour.setTime(
              morningShift.shiftEndHour.getTime(),
            );

            scheduleToFill.push({
              userPreference: morningShift.userPreference,
              // shiftDate: new Date(morningShift.shiftDate.getTime()), // Create a new Date object for the shift date
              userId: morningShift.userId,
              typeOfShift: 'long',
              shiftTimeName: 'morning',
              shiftType: 'systemSchedule',
              shiftStartHour: new Date(morningShift.shiftStartHour.getTime()),
              shiftEndHour: new Date(morningShift.shiftEndHour),
              scheduleId: morningShift.scheduleId,
            });
            scheduleToFill.push({
              userPreference: '4',
              // shiftDate: new Date(noonShift.shiftDate.getTime()), // Create a new Date object
              shiftTimeName: 'noonCanceled',
              typeOfShift: 'long',
              userId: undefined,
              shiftType: 'systemSchedule',
              shiftStartHour: new Date(noonShift.shiftStartHour),
              shiftEndHour: new Date(noonShift.shiftEndHour),
              scheduleId: noonShift.scheduleId,
            });
            scheduleToFill.push({
              userPreference: nightShift.userPreference,
              // shiftDate: new Date(nightShift.shiftDate.getTime()), // Create a new Date object for the shift date
              userId: nightShift.userId,
              shiftTimeName: 'night',
              shiftType: 'systemSchedule',
              typeOfShift: 'long',
              shiftStartHour: new Date(morningShift.shiftEndHour.getTime()),
              shiftEndHour: new Date(nightShift.shiftEndHour.getTime()),
              scheduleId: nightShift.scheduleId,
            });
            console.log({ scheduleToFill });
          } else {
            console.log('cant change to 2 shifts a day ');
            return;
          }
        } else if (time.getHours() === nightDate.getHours()) {
          console.log('nightshifttomove');
          //check if mornign and night are assigned
          const assignedOtherShifts: boolean =
            morningShift.userId && noonShift.userId ? true : false;
          //if there is possible for both assign new Hours of tje shifts /
          console.log({ assignedOtherShifts });
          if (assignedOtherShifts) {
            const morninguserPref = await this.getUserprefForDate(
              noonShift.shiftStartHour,

              morningShift.userId,
            );
            const noonuserPref = await this.getUserprefForDate(
              nightShift.shiftStartHour,

              noonShift.userId,
            );

            console.log({ noonuserPref }, { morninguserPref });
            if (morninguserPref !== '3' && noonuserPref !== '3') {
              if (noonShift.userId === schedule[noonIndex + 2]?.userId) {
                console.log(
                  noonShift.userId === schedule[noonIndex + 2]?.userId,
                );
                return;
              }
              const newEndTime: Date = new Date(morningShift.shiftEndHour);
              console.log('fill 2 shifts a day insted of empty njight');
              newEndTime.setHours(morningShift.shiftEndHour.getHours() + 4);

              scheduleToFill.push({
                userPreference: morningShift.userPreference,
                shiftTimeName: 'morning',
                shiftType: 'systemSchedule',
                userId: morningShift.userId,
                typeOfShift: 'long',
                shiftStartHour: new Date(morningShift.shiftStartHour.getTime()),
                shiftEndHour: new Date(newEndTime),
                scheduleId: morningShift.scheduleId,
              });
              scheduleToFill.push({
                userPreference: '4',
                // shiftDate: new Date(noonShift.shiftDate.getTime()), // Create a new Date object
                shiftTimeName: 'noonCanceled',
                shiftType: 'systemSchedule',
                userId: undefined,
                shiftStartHour: new Date(noonShift.shiftStartHour),
                shiftEndHour: new Date(noonShift.shiftEndHour),
                scheduleId: noonShift.scheduleId,
              });
              scheduleToFill.push({
                userPreference: noonuserPref,
                // shiftDate: new Date(nightShift.shiftDate.getTime()), // Create a new Date object for the shift date
                userId: noonShift.userId,
                shiftType: 'systemSchedule',
                shiftTimeName: 'night',
                typeOfShift: 'long',
                shiftStartHour: new Date(newEndTime.getTime()),
                shiftEndHour: new Date(nightShift.shiftEndHour.getTime()),
                scheduleId: nightShift.scheduleId,
              });
              console.log('changes shifts time', { scheduleToFill });
            } else {
              console.log(
                'cant move user pref',
                { noonuserPref },
                { morninguserPref },
              );
            }
          }
        }
      }

      // console.log({ emptyShifts });
      console.log({ scheduleToFill });
      // console.log(this.userShiftCount);
      return scheduleToFill;
    }
  }
}
