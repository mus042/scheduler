"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const shift_services_1 = require("../shift/shift.services");
const user_service_1 = require("../user/user.service");
const schedule_utilsClass_1 = require("./schedule.utilsClass");
const user_statistics_service_1 = require("../user-statistics/user-statistics.service");
const maxAmountOfShifts = 6;
const dayToSubmit = 6;
var shcheduleType;
(function (shcheduleType) {
    shcheduleType[shcheduleType["userSchedule"] = 0] = "userSchedule";
    shcheduleType[shcheduleType["systemSchedule"] = 1] = "systemSchedule";
})(shcheduleType || (shcheduleType = {}));
let ScheduleService = class ScheduleService {
    constructor(prisma, shiftSercvice, userService, scheduleUtil, shiftStats) {
        this.prisma = prisma;
        this.shiftSercvice = shiftSercvice;
        this.userService = userService;
        this.scheduleUtil = scheduleUtil;
        this.shiftStats = shiftStats;
        this.scheduleDue = 2;
        this.updateStats = (userStats, shiftToUpdate, amount) => {
            const localShift = shiftToUpdate.shift
                ? shiftToUpdate.shift
                : shiftToUpdate;
            console.log('shiftToUpdate:', shiftToUpdate, shiftToUpdate.shift);
            const shiftKey = `${localShift.typeOfShift === 'short' ? '' : 'long'}${localShift.shiftTimeName}`;
            console.log({ shiftKey }, { userStats }, { amount });
            if (localShift.shiftTimeName !== 'noonCanceled') {
                userStats[shiftKey].sum = userStats[shiftKey].sum + amount;
                amount > 0
                    ? userStats[shiftKey].keys.push(localShift.shiftStartHour.toISOString())
                    : userStats[shiftKey].keys.filter((shift) => {
                        console.log({ shift });
                        return localShift.shiftStartHour.toISOString() !== shift;
                    });
                userStats['total'] = userStats['total'] + amount;
            }
            console.log('user stats:', { shiftKey }, { userStats }, { amount });
        };
    }
    getNextDayDate(day) {
        let dayToAdd;
        let currentDate = new Date();
        let hoursCorrection;
        if (day === undefined) {
            dayToAdd = 0;
            hoursCorrection = '6,0,0,0';
        }
        else if (typeof day === 'string') {
            dayToAdd = Number(day);
            hoursCorrection = '0,0,0,0';
        }
        else if (typeof day === 'object' && 'D' in day) {
            dayToAdd = day.D;
            hoursCorrection = `${day.H},${day.M},0,0`;
        }
        else if (day instanceof Date) {
            dayToAdd = day.getDay();
            hoursCorrection = `${day.getUTCHours()},${day.getUTCMinutes()},0,0`;
        }
        else {
            dayToAdd = day;
            hoursCorrection = `3,0,0,0`;
        }
        let adjusted;
        currentDate.setUTCHours(1, 0, 0, 0);
        const daysAddition = 7 - currentDate.getDay() + dayToAdd;
        adjusted = new Date(currentDate.getTime() + daysAddition * 24 * 60 * 60 * 1000);
        const correction = hoursCorrection
            .split(',')
            .map((num) => parseInt(num, 10));
        adjusted.setUTCHours(...correction);
        console.log({ adjusted }, 'adjusted Date');
        return adjusted;
    }
    isHourMinuteObject(value) {
        return (value &&
            typeof value === 'object' &&
            'hours' in value &&
            'minutes' in value);
    }
    async createScheduleTime(start, end) {
        try {
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
                data: Object.assign({}, data),
            });
            return res;
        }
        catch (error) {
            throw new common_1.ForbiddenException(error);
        }
    }
    async deleteScheduleTime(schedTimeId) {
        try {
            const res = this.prisma.scheduleTime.delete({
                where: {
                    id: schedTimeId,
                },
            });
        }
        catch (error) {
            throw new common_1.ForbiddenException(error);
        }
    }
    async setScheduleMold(schedSet, facilityId) {
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
            if (existingSelected && existingSelected.id) {
                console.log(existingSelected.id, 'id of existing');
                await this.prisma.scheduleMold.update({
                    where: { id: existingSelected.id },
                    data: { selected: false },
                });
            }
            console.log({ tmpMold });
            createRestDays = await this.createScheduleTime({
                day: schedSet.restDay.start.day.value,
                hours: schedSet.restDay.start.hours,
                minutes: schedSet.restDay.start.minutes,
            }, {
                day: schedSet.restDay.end.day.value,
                hours: schedSet.restDay.end.hours,
                minutes: schedSet.restDay.end.minutes,
            });
            createScheduleTime = await this.createScheduleTime({
                day: schedSet.start.day.value,
                hours: schedSet.start.hours,
                minutes: schedSet.start.minutes,
            }, {
                day: schedSet.end.day.value,
                hours: schedSet.end.hours,
                minutes: schedSet.end.minutes,
            });
            const createData = {
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
                for (const shift of schedSet.shiftsTemplate) {
                    const startHourStr = this.isHourMinuteObject(shift.startHour)
                        ? shift.startHour.hours.toString()
                        : String(shift.startHour);
                    const endHourStr = this.isHourMinuteObject(shift.endHour)
                        ? String(shift.endHour.hours)
                        : String(shift.startHour);
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
            }
            else {
            }
        }
        catch (error) {
            console.log({ error });
            if (createRestDays.id) {
                await this.deleteScheduleTime(createRestDays.Id);
            }
            if (createScheduleTime.id) {
                await this.deleteSystemSchedule(createScheduleTime.id);
            }
            throw new common_1.HttpException('Error in creating new mold', 400, {
                cause: new Error('Some Error'),
            });
        }
    }
    async getSelctedScheduleMold(facilityId) {
        console.log('selcted mold', { facilityId });
        try {
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
            if (res)
                return res;
            else
                return false;
        }
        catch (error) {
            throw new common_1.ForbiddenException(error);
        }
    }
    async getNextScheduleForUser(userId, facilityId) {
        const timeBeforeDue = 4;
        const currentDate = new Date();
        currentDate.setHours(1, 0, 0, 0);
        let adjusted;
        adjusted = this.getNextDayDate(0);
        console.log({ adjusted }, 'Day: ' + currentDate.getDay());
        try {
            console.log('find nextScheudle', { adjusted });
            const scheduleArr = await this.prisma.userSchedule.findMany({
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
            console.log('--getnext schedule for user ---  found schedule in db', scheduleArr[0]);
            const nextSchedule = scheduleArr[0];
            console.log('next schedule for user', { nextSchedule });
            if (nextSchedule === null || !nextSchedule) {
                const startDate = new Date(adjusted.getTime());
                const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
                const scedualDue = new Date(startDate.getTime() - timeBeforeDue);
                const dto = {
                    scedualStart: startDate,
                    scedualEnd: endDate,
                    scedualDue: scedualDue,
                    userId: userId,
                    facilityId: facilityId,
                };
                console.log({ dto });
                const newSchedule = await this.createSchedualeForUser(dto);
                const nextSchedule = Object.assign({}, newSchedule === null || newSchedule === void 0 ? void 0 : newSchedule.newSchedule);
                const scheduleShifts = [...newSchedule === null || newSchedule === void 0 ? void 0 : newSchedule.scheduleShifts];
                console.log('next schedule 82 sched servic ', { nextSchedule });
                const tmpSchedule = {
                    data: Object.assign({}, nextSchedule),
                    shifts: [...scheduleShifts],
                };
                return tmpSchedule;
            }
            else {
                const scheduleShifts = await this.shiftSercvice.getAllUserShiftsByScheduleId(nextSchedule.id);
                const tmpSchedule = {
                    data: Object.assign({}, nextSchedule),
                    shifts: [...scheduleShifts],
                };
                return tmpSchedule;
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async getNextSystemSchedule(facilityId) {
        const currentDate = new Date();
        console.log('next sys schedule ', { currentDate });
        try {
            console.log('next sys schedule ');
            const scheduleArr = await this.prisma.systemSchedule.findMany({
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
                const nextSchedule = scheduleArr[0];
                if (nextSchedule) {
                    const scheduleShifts = await this.shiftSercvice.getAllSystemShiftsByScheduleId(nextSchedule.id);
                    const tmpSchedule = {
                        data: Object.assign({}, nextSchedule),
                        shifts: [...scheduleShifts],
                    };
                    return tmpSchedule;
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    async getCurrentSchedule(facilityId) {
        const selctedSettings = await this.getSelctedScheduleMold(facilityId);
        const currentDate = new Date();
        console.log({ selctedSettings }, 'startDate from settings');
        if (selctedSettings !== false) {
            let diff = currentDate.getDay() - selctedSettings.scheduleTime.startDay;
            const startDate = new Date(currentDate.getTime() - diff * 24 * 60 * 60 * 1000);
            startDate.setUTCHours(selctedSettings.scheduleTime.startHour, selctedSettings.scheduleTime.startMinutes, 0, 0);
            try {
                console.log('get current schedule ', { startDate }, selctedSettings.scheduleTime.startDay, diff);
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
                const currentScheduleShifts = currentSchedule
                    ? await this.shiftSercvice.getAllSystemShiftsByScheduleId(currentSchedule.id)
                    : null;
                if (currentSchedule !== null) {
                    console.log('cuurent schedule , 151 schd service ', { currentSchedule }, currentScheduleShifts[0].userRef);
                    const currentScheduleData = {
                        data: Object.assign({}, currentSchedule),
                        shifts: [...currentScheduleShifts],
                    };
                    return currentScheduleData;
                }
            }
            catch (error) {
                console.log({ error });
            }
        }
    }
    async createSchedualeForUser(scheduleDto) {
        const scheduleShifts = [];
        const scheduleDue = new Date(scheduleDto.scedualStart.getTime());
        console.log('Schedule start', scheduleDto.scedualStart);
        const userId = scheduleDto.userId ? scheduleDto.userId : 0;
        const schedulMold = await this.prisma.scheduleMold.findFirst({
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
        const schedExist = await this.prisma.userSchedule.findFirst({
            where: {
                userId: userId,
                scheduleStart: scheduleDto.scedualStart,
            },
        });
        if (userId === 0 || schedExist) {
            console.log('Create sched for user 188 , userId or Sched exist', { userId }, { schedExist });
            throw new common_1.ForbiddenException('error');
        }
        console.log('Create schedule startDate', { schedulMold }, schedulMold.scheduleTime);
        const startDate = this.getNextDayDate(schedulMold.scheduleTime.startDay);
        console.log('Create schedule startDate', { startDate });
        startDate.setUTCHours(Number(schedulMold.scheduleTime.startHour), Number(schedulMold.scheduleTime.startMinutes), 0, 0);
        const endDate = new Date(this.getNextDayDate(schedulMold.scheduleTime.endDay).getTime() +
            schedulMold.daysPerSchedule * 24 * 60 * 60 * 1000);
        endDate.setUTCHours(Number(schedulMold.scheduleTime.endHour), Number(schedulMold.scheduleTime.endMinutes), 0, 0);
        console.log('Create schedule startDate', { startDate }, { userId }, scheduleDto.facilityId);
        const newSchedule = await this.prisma.userSchedule.create({
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
        const shiftsArr = this.scheduleUtil.generateNewScheduleShifts(newSchedule.scheduleStart, newSchedule.scheduleEnd, newSchedule.id, schedulMold, type);
        for (let i = 0; i < shiftsArr.length; i++) {
            const shift = await this.shiftSercvice.creatShift(scheduleDto.userId, shiftsArr[i], 'user');
            if (shift) {
                const userRef = await this.prisma.user.findUnique({
                    where: {
                        id: shift.userId,
                    },
                });
                delete userRef.hash;
                scheduleShifts.push(Object.assign(Object.assign({}, shift), { userRef: Object.assign({}, userRef), shiftType: 'user', shiftRoleId: undefined }));
            }
        }
        return { newSchedule, scheduleShifts };
    }
    generateEmptySchedulObject(startingDate, schedualId) {
        const scedualLength = 7;
        const emptyScheduleShifts = [];
        const esId = schedualId;
        const esStartDate = new Date(startingDate);
        const timeZoneCorrection = esStartDate.getHours();
        esStartDate.setHours(timeZoneCorrection);
        for (let i = 0; i < scedualLength; i++) {
            for (let j = 0; j < 3; j++) {
                const esEndTime = new Date(esStartDate);
                esEndTime.setHours(esStartDate.getHours() + 8);
                const sType = j === 0 ? 'morning' : j === 1 ? 'noon' : 'night';
                const dto = {
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
        return emptyScheduleShifts;
    }
    async getScheduleIdByDateAnduserId(id, startDate, scheduleType) {
        const dateIso = new Date(startDate);
        console.log('get schedule ', { startDate }, { id });
        try {
            const schedule = scheduleType === 'systemSchedule'
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
        }
        catch (error) {
            console.log({ error }, error);
            if (error.code === 'P2025') {
                throw new common_1.ForbiddenException('shift not fond ');
            }
            throw new common_1.ForbiddenException(error);
        }
    }
    async editeFuterSceduleForUser(scheduleId, shiftsToEdit) {
        console.log({ shiftsToEdit });
        try {
            const schedule = await this.prisma.userSchedule.findUnique({
                where: {
                    id: scheduleId,
                },
            });
            const editedShifts = [];
            const existingShifts = await this.shiftSercvice.getAllUserShiftsByScheduleId(scheduleId);
            console.log('edit shift', { shiftsToEdit }, { existingShifts }, scheduleId, shiftsToEdit[0]);
            existingShifts.forEach((shift) => {
                const shiftTime = new Date(shift.shiftStartHour);
                console.log({ shiftTime });
                const shiftId = shift.id;
                shiftsToEdit.forEach(async (editInfo) => {
                    const userPref = editInfo.userPreference;
                    console.log({ editInfo }, shiftTime.getTime(), shift.shiftStartHour.getTime(), shiftTime.getDate(), shift.shiftStartHour.getDate(), shiftTime.getHours(), shift.shiftStartHour.getHours());
                    if (shiftTime.getDate() === shift.shiftStartHour.getDate() &&
                        shiftTime.getHours() === shift.shiftStartHour.getHours()) {
                        console.log({ shift });
                        const editShiftDto = {
                            shiftId: shiftId,
                            userPreference: userPref,
                            shiftType: 'user',
                        };
                        const edited = await this.shiftSercvice.editUserShift(editShiftDto);
                        editedShifts.push(Object.assign({}, edited));
                    }
                });
            });
            return [...editedShifts];
        }
        catch (error) {
            console.log({ error });
            throw new common_1.ForbiddenException(error.message);
        }
    }
    async getSubmmitedUsersSchedule(facilityId) {
        const dateToGet = this.getNextDayDate(undefined);
        const allUsersShifts = this.getAllUsersForSchedule(dateToGet, undefined, undefined, facilityId);
        const users = (await allUsersShifts).map((userShifts) => Object.values(userShifts)[0].userId);
        return users;
    }
    async getAllUsersForSchedule(startingDate, selectedUsersIds, roleId, facilityId) {
        const schedules = [];
        const allUsers = await this.userService.getAllUsers(facilityId);
        let filteredUsers;
        if (selectedUsersIds && selectedUsersIds.length > 0) {
            filteredUsers = allUsers.filter((user) => selectedUsersIds.some((selectedUser) => selectedUser === user.id));
        }
        else {
            filteredUsers = allUsers;
        }
        if (roleId) {
            filteredUsers = filteredUsers.filter((user) => user.roleId === roleId);
            console.log({ filteredUsers });
        }
        console.log('get filteredUsers users ', { filteredUsers });
        for (const user of filteredUsers) {
            console.log('user::', user.id);
            const schedule = await this.getScheduleIdByDateAnduserId(user.id, startingDate, 'user');
            if (schedule && schedule.id) {
                const shiftsForSchedule = await this.shiftSercvice.getAllUserShiftsByScheduleId(schedule.id);
                const sortdShifts = shiftsForSchedule.sort((a, b) => a.shiftStartHour.getTime() - b.shiftStartHour.getTime());
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
                if (shiftsMap) {
                    schedules.push(shiftsMap);
                }
            }
        }
        return schedules;
    }
    async getUsersForSchedule(users, startingDate) {
        const schedules = [];
        for (const user of users) {
            const schedule = await this.getScheduleIdByDateAnduserId(user.id, startingDate, 'systemSchedule');
            console.log(schedule !== null && schedule !== undefined, { schedule });
            if (schedule !== null && schedule !== undefined) {
                const shiftsForSchedule = await this.shiftSercvice.getAllUserShiftsByScheduleId(schedule === null || schedule === void 0 ? void 0 : schedule.id);
                const filterdShifts = shiftsForSchedule.filter((item) => item.userPreference !== '0');
                if (filterdShifts !== null) {
                    schedules.push(filterdShifts);
                }
            }
        }
        return schedules;
    }
    async getScheduleById(schedualId, scheduleType) {
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
        }
        catch (eror) {
            throw new common_1.ForbiddenException(' there is no record to return ', eror);
        }
    }
    async findReplaceForShift(shiftId, scheduleIdToCheck) {
        console.log({ shiftId });
    }
    convertShiftMoldToShift(shiftMold, schedualId, role) {
        const startDate = this.getNextDayDate({
            D: Number(shiftMold.day),
            H: Number(shiftMold.startHour),
            M: 0,
        });
        const endDate = this.getNextDayDate({
            D: Number(shiftMold.day),
            H: Number(shiftMold.endHour),
            M: 0,
        });
        const shiftsMap = {};
        shiftMold.userPrefs.map((role) => {
            const tmpShift = {
                shiftType: 'system',
                shiftTimeName: shiftMold.name.toLowerCase(),
                typeOfShift: shiftMold.endHour - shiftMold.startHour > 10 ? 'long' : 'short',
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
    genrateEmptySysSchedShifts(startDate, scheduleId, shiftsMold) {
        const scheduleShiftsByRoles = {};
        let tmpId = 0;
        for (const shiftMold of shiftsMold) {
            const tmpShiftsByRole = this.convertShiftMoldToShift(shiftMold, scheduleId);
            Object.entries(tmpShiftsByRole).forEach(([roleIdStr, shift]) => {
                const roleId = parseInt(roleIdStr, 10);
                if (!scheduleShiftsByRoles[roleId]) {
                    scheduleShiftsByRoles[roleId] = {};
                }
                const shiftKey = shift.shiftStartHour.toISOString();
                scheduleShiftsByRoles[roleId][shiftKey] = {
                    shift: Object.assign(Object.assign({}, shift), { tmpId: tmpId }),
                    optinalUsers: [],
                };
                tmpId++;
            });
        }
        return scheduleShiftsByRoles;
    }
    async createEmptySystemSchedule(startDate, endDate, facilitId, moldId) {
        try {
            const newSchedule = await this.prisma.systemSchedule.create({
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
        }
        catch (error) {
            throw new common_1.ForbiddenException(error);
        }
    }
    getAllShiftKeysForUser(userId, userData) {
        let allShiftKeys = [];
        console.log('userData --', { userData });
        if (!userData) {
            console.log(`No data found for user ID ${userId}`);
            return allShiftKeys;
        }
        for (const shiftType in userData) {
            console.log('shiftType---', { shiftType });
            if (userData.hasOwnProperty(shiftType) && shiftType !== 'total') {
                allShiftKeys = allShiftKeys.concat(userData[shiftType].keys);
            }
        }
        return allShiftKeys;
    }
    getAllUserShiftsInSchedule(userId, scheduleShifts) {
        const userShifts = scheduleShifts.filter((shift) => shift.shift.userId === userId);
        console.log('userShifts in schedule ---', { userShifts });
        return userShifts;
    }
    isShiftPossible(shiftToAssign, userId, scheduleShifts) {
        console.log('is shift possible shiftToAssign: ', { shiftToAssign }, { scheduleShifts });
        const allUserhifts = this.getAllUserShiftsInSchedule(userId, scheduleShifts);
        console.log('all user shifts in sechdule ', { userId });
        const eightHoursInMilliseconds = 8 * 60 * 60 * 1000;
        const underShiftLimit = allUserhifts.length < maxAmountOfShifts;
        const sameDayShift = allUserhifts === null || allUserhifts === void 0 ? void 0 : allUserhifts.filter((shift) => {
            console.log('shift::::::', shift.shift, { shift }, { shiftToAssign });
            return ((shift.shift.shiftStartHour.toISOString().substring(0, 10) ===
                shiftToAssign.shiftStartHour.toISOString().substring(0, 10) &&
                Math.abs(shiftToAssign.shiftStartHour.getTime() -
                    shift.shift.shiftEndHour.getTime()) <= eightHoursInMilliseconds) ||
                Math.abs(shiftToAssign.shiftEndHour.getTime() -
                    shift.shift.shiftStartHour.getTime()) <= eightHoursInMilliseconds);
        });
        console.log('is shift Possible ? 1029', { underShiftLimit }, allUserhifts.length, 'same day', sameDayShift.length, 'return:', underShiftLimit && sameDayShift.length < 1);
        return sameDayShift.length < 1;
    }
    assignScheduleShifts(scheduleAndShifts) {
        const noUserShifts = [];
        const assignedShifts = [];
        const shiftsToAssign = Object.assign({}, scheduleAndShifts.shifts);
        const userShiftStats = new Map();
        console.log('assign shifts, schedule = ', { scheduleAndShifts });
        Object.entries(shiftsToAssign).map(([key, shifts]) => {
            while (Object.keys(shifts).length > 0) {
                const shiftWithLeast = this.findShiftWithLeastOptions(Object.values(shifts));
                console.log('shift to assign ,userShiftStats:', userShiftStats, { shiftsToAssign }, { shiftWithLeast }, Object.keys(shifts).length);
                const assignedShift = this.assignShift(shiftWithLeast, assignedShifts, shiftsToAssign[key], userShiftStats);
                console.log('assigned 1238', { assignedShift });
                if (!assignedShift) {
                    noUserShifts.push(Object.assign({}, shiftWithLeast));
                    console.log('no possible users ::1136˚ , shift:', { shiftWithLeast });
                    delete shiftsToAssign[key][shiftWithLeast.shift.shiftStartHour.toISOString()];
                    console.log('removed shifts', shiftsToAssign[key][shiftWithLeast.shift.shiftStartHour.toISOString()]);
                }
                else {
                    assignedShifts.push(Object.assign({}, assignedShift));
                    console.log('possiblwe', assignedShift);
                    delete shiftsToAssign[key][assignedShift.shift.shiftStartHour.toISOString()];
                    console.log({ assignedShifts });
                    if (!userShiftStats.has(assignedShift.shift.userId)) {
                        userShiftStats.set(assignedShift.shift.userId, {
                            morning: { sum: 0, keys: [] },
                            noon: { sum: 0, keys: [] },
                            night: { sum: 0, keys: [] },
                            longmorning: { sum: 0, keys: [] },
                            longnight: { sum: 0, keys: [] },
                            total: 0,
                        });
                    }
                    const currentUserStats = userShiftStats.get(assignedShift.shift.userId);
                    this.updateStats(currentUserStats, assignedShift.shift, 1);
                }
                console.log("get day shifts to update ", assignedShift, assignedShifts);
                if (assignedShift) {
                    const role = assignedShift.shift.shiftRole || assignedShift.shiftRole;
                    const schedShfitsValues = Object.values(assignedShifts);
                    console.log("sched values ", { schedShfitsValues });
                    const dayShifts = this.getDayShiftsFromSchedule(assignedShift.shift, assignedShifts);
                    console.log('day shifts for assigned sched  shift ', { dayShifts });
                    dayShifts &&
                        dayShifts.forEach((shiftToUpdate) => {
                            console.log('upsate map for shift', shiftsToAssign[role.roleId][shiftToUpdate.shift.shiftStartHour.toISOString()] ===
                                undefined, assignedShift);
                            const options = { userId: assignedShift.shift.userId };
                            const newShiftOptions = this.updateShiftOptions(assignedShifts, options, 'remove');
                            if (newShiftOptions && shiftToUpdate) {
                                console.log("after changhe options ", assignedShifts, shiftToUpdate.shift.shiftStartHour.toISOString());
                                shiftToUpdate.optinalUsers = [...newShiftOptions];
                            }
                        });
                }
            }
        });
        const longShiftsEnabeld = true;
        if (noUserShifts.length > 0) {
            if (longShiftsEnabeld) {
                console.log({ noUserShifts }, 'no user shifts :');
                for (let i = noUserShifts.length - 1; i >= 0; i--) {
                    const noUserShift = noUserShifts[i];
                    console.log('shift to change:', { noUserShift }, i);
                    const res = this.changeDayIntoTwoShifts(noUserShift, assignedShifts, userShiftStats);
                    console.log('res of change:', { res });
                    if (res) {
                        console.log('remove shift at index:', i, noUserShift);
                        noUserShifts.splice(i, 1);
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
        console.log('get day shifts ', { assignedSchedule });
        const dayShifts = assignedSchedule.filter((assigedShift) => {
            var _a;
            const localShift = assigedShift.shift ? assigedShift.shift : assigedShift;
            const tmpShift = shift.shift ? shift.shift : shift;
            console.log('get day shifts 1295, assigned shift ', localShift, shift, localShift.shiftStartHour.toISOString().substring(0, 10) ===
                tmpShift.shiftStartHour.toISOString().substring(0, 10));
            return (localShift.shiftStartHour.toISOString().substring(0, 10) ===
                tmpShift.shiftStartHour.toISOString().substring(0, 10)
                && localShift.shiftRole.roleId === ((_a = tmpShift.shiftRole) === null || _a === void 0 ? void 0 : _a.roleId));
        });
        if (dayShifts.length > 0) {
            console.log('day shifts got:', dayShifts.length);
            return dayShifts;
        }
        return [];
    }
    adjustShiftHours(shiftToAdjust, newStartHour, type, typeOfShift = 'long') {
        console.log('adjustt time', { newStartHour }, { shiftToAdjust }, { type });
        const shift = (shiftToAdjust === null || shiftToAdjust === void 0 ? void 0 : shiftToAdjust.shift) ? shiftToAdjust.shift : shiftToAdjust;
        let adjustedStartHour = new Date(shift.shiftStartHour.getTime());
        if (type === 'shiftStartHour') {
            adjustedStartHour.setUTCHours(newStartHour.getHours(), newStartHour.getMinutes(), 0, 0);
            shiftToAdjust.shiftStartHour = adjustedStartHour;
        }
        else if (type === 'shiftEndHour') {
            let adjustedEndHour = new Date(shift.shiftEndHour.getTime());
            adjustedEndHour.setUTCHours(newStartHour.getHours(), newStartHour.getMinutes(), 0, 0);
            shiftToAdjust.shiftEndHour = adjustedEndHour;
        }
        shiftToAdjust.typeOfShift = typeOfShift;
        return shiftToAdjust;
    }
    updateAssignedSchedule(assignedSchedule, shiftsToUpdate, userShiftStats) {
        console.log('shifts to update:', { shiftsToUpdate });
        if (!shiftsToUpdate || shiftsToUpdate.length === 0) {
            return;
        }
        shiftsToUpdate.forEach((shiftToUpdate) => {
            console.log('update shift', { shiftToUpdate }, { userShiftStats });
            const index = assignedSchedule.findIndex((shiftInAssiged) => shiftInAssiged.shift.tmpId === shiftToUpdate.shift.tmpId);
            if (index === -1) {
                assignedSchedule.push(Object.assign({}, shiftToUpdate));
                if (shiftToUpdate.shift.userId !== undefined) {
                    const userStats = userShiftStats.get(shiftToUpdate.shift.userId);
                    this.updateStats(userStats, shiftToUpdate, 1);
                }
            }
            else {
                if (shiftToUpdate.shift.userId === undefined) {
                    const userStats = userShiftStats.get(assignedSchedule[index].shift.userId);
                    this.updateStats(userStats, assignedSchedule[index].shift, -1);
                }
                else {
                    const userStats = userShiftStats.get(assignedSchedule[index].shift.userId);
                    this.updateStats(userStats, shiftToUpdate.shift, 1);
                    this.updateStats(userStats, assignedSchedule[index].shift, -1);
                }
                assignedSchedule[index].shift = Object.assign({}, shiftToUpdate.shift);
            }
        });
        console.log('assigned schedule after change:', { userShiftStats });
        return assignedSchedule;
    }
    createNoonCanceledShift(shift) {
        return Object.assign(Object.assign({}, shift), { shiftTimeName: client_1.shiftTimeClassification.noonCanceled, userId: undefined });
    }
    changeDayIntoTwoShifts(shiftToAssign, assignedSchedule, usersShiftStats) {
        var _a, _b, _c, _d;
        console.log('change into two shifts ', { shiftToAssign });
        const dayShiftDTOs = this.getDayShiftsFromSchedule(shiftToAssign, assignedSchedule);
        let morning, noon, night;
        const mode = !shiftToAssign.shift.userId
            ? 'missing'
            : 'replace';
        if (dayShiftDTOs.length === 0 || dayShiftDTOs.length < 2)
            return false;
        const adjustedDate = new Date(shiftToAssign.shift.shiftStartHour);
        adjustedDate.setUTCHours(18, 0, 0, 0);
        console.log('mode', { mode });
        switch (shiftToAssign.shift.shiftTimeName) {
            case 'night':
                if (mode === 'missing') {
                    const nextShiftKey = assignedSchedule.findIndex((assigedShift) => {
                        console.log({ assigedShift });
                        return (shiftToAssign.shift.shiftStartHour.toISOString() ===
                            assigedShift.shift.shiftStartHour.toISOString());
                    });
                    if (((_b = (_a = assignedSchedule[nextShiftKey + 1]) === null || _a === void 0 ? void 0 : _a.shift) === null || _b === void 0 ? void 0 : _b.userId) ===
                        ((_d = (_c = dayShiftDTOs[1]) === null || _c === void 0 ? void 0 : _c.shift) === null || _d === void 0 ? void 0 : _d.userId))
                        return false;
                }
                morning = {
                    shift: Object.assign(Object.assign({}, dayShiftDTOs[0].shift), { shiftEndHour: adjustedDate, typeOfShift: 'long' }),
                    optinalUsers: Object.assign({}, dayShiftDTOs[0].optinalUsers),
                };
                night = {
                    shift: Object.assign(Object.assign({}, shiftToAssign.shift), { shiftStartHour: adjustedDate, userId: dayShiftDTOs[1].shift.userId, typeOfShift: 'long' }),
                    optinalUsers: Object.assign({}, shiftToAssign.optinalUsers),
                };
                noon = {
                    shift: Object.assign({}, this.createNoonCanceledShift(dayShiftDTOs[1].shift)),
                    optinalUsers: Object.assign({}, dayShiftDTOs[1].optinalUsers),
                };
                console.log('shift changed night miss: ', { morning }, { noon }, { night });
                break;
            case 'morning':
                console.log('morning to change origlinal:', { shiftToAssign }, dayShiftDTOs[0], dayShiftDTOs[1]);
                morning = {
                    shift: Object.assign({}, shiftToAssign.shift),
                    optinalUsers: Object.assign({}, shiftToAssign.optinalUsers),
                };
                night =
                    mode === 'replace'
                        ? {
                            shift: Object.assign(Object.assign({}, dayShiftDTOs[2].shift), { shiftStartHour: adjustedDate, typeOfShift: 'long' }),
                            optinalUsers: Object.assign({}, dayShiftDTOs[2].optinalUsers),
                        }
                        : {
                            shift: Object.assign(Object.assign({}, dayShiftDTOs[1].shift), { shiftStartHour: adjustedDate, typeOfShift: 'long' }),
                            optinalUsers: Object.assign({}, dayShiftDTOs[1].optinalUsers),
                        };
                noon =
                    mode === 'replace'
                        ? {
                            shift: Object.assign({}, this.createNoonCanceledShift(dayShiftDTOs[1].shift)),
                            optinalUsers: [],
                        }
                        : {
                            shift: Object.assign({}, this.createNoonCanceledShift(dayShiftDTOs[0].shift)),
                            optinalUsers: [],
                        };
                console.log(mode, 'shift changed morning miss : ', { morning }, 'noon after change', { noon }, { night });
                break;
            case 'noon':
                console.log('noon', dayShiftDTOs[0], dayShiftDTOs[1], {
                    shiftToAssign,
                });
                morning = {
                    shift: Object.assign(Object.assign({}, dayShiftDTOs[0].shift), { shiftEndHour: adjustedDate, typeOfShift: 'long' }),
                    optinalUsers: Object.assign({}, dayShiftDTOs[0].optinalUsers),
                };
                night =
                    mode === 'missing'
                        ? {
                            shift: Object.assign(Object.assign({}, dayShiftDTOs[1].shift), { typeOfShift: 'long', shiftStartHour: adjustedDate }),
                            optinalUsers: Object.assign({}, dayShiftDTOs[1].optinalUsers),
                        }
                        : {
                            shift: Object.assign(Object.assign({}, dayShiftDTOs[2].shift), { typeOfShift: 'long', shiftStartHour: adjustedDate }),
                            optinalUsers: Object.assign({}, dayShiftDTOs[2].optinalUsers),
                        };
                noon =
                    mode !== 'missing'
                        ? {
                            shift: Object.assign({}, this.createNoonCanceledShift(dayShiftDTOs[1].shift)),
                            optinalUsers: [],
                        }
                        : {
                            shift: Object.assign({}, this.createNoonCanceledShift(shiftToAssign.shift)),
                            optinalUsers: [],
                        };
                console.log('shift changed : ', { morning }, { noon }, { night });
                break;
        }
        const updatedSched = this.updateAssignedSchedule(assignedSchedule, [morning, noon, night], usersShiftStats);
        console.log('assigned after 2 change ', { assignedSchedule }, 'update sched', { updatedSched });
        return true;
    }
    findShiftWithLeastOptions(shiftOptionsMap) {
        let shiftWithLeastOptions = null;
        let leastOptionsCount = Infinity;
        console.log({ shiftOptionsMap });
        for (let [utcDate, { shift, optinalUsers }] of shiftOptionsMap.entries()) {
            console.log('length ', optinalUsers.length);
            const optionsLength = optinalUsers.length;
            console.log({ shiftWithLeastOptions }, { optionsLength }, { optinalUsers });
            if (optionsLength < leastOptionsCount) {
                leastOptionsCount = optionsLength;
                shiftWithLeastOptions = { shift: shift, optinalUsers: optinalUsers };
            }
        }
        return shiftWithLeastOptions;
    }
    getNextShiftKeyInMap(currentShiftKey, shiftsMap) {
        console.log({ shiftsMap });
        const entries = Object.entries(shiftsMap);
        console.log({ entries }, currentShiftKey);
        for (let i = 0; i < entries.length; i++) {
            if (entries[i][0] === currentShiftKey && i + 1 < entries.length) {
                console.log(entries[i][0], { currentShiftKey });
                return entries[i + 1][0];
            }
        }
        return null;
    }
    assignShift(shiftAndOptions, assignedShifts, shiftsMap, userShiftStats) {
        console.log('assign shift start', { userShiftStats });
        const assignedShift = shiftAndOptions.shift;
        const maxAmountOfShifts = 6;
        const newShift = shiftAndOptions;
        const possibleShifts = shiftAndOptions.optinalUsers.filter((shift) => {
            console.log('shift options :', { shift });
            const isPossible = this.isShiftPossible(shiftAndOptions.shift, shift.userId, assignedShifts);
            console.log({ isPossible }, 'user Shift Stats before assign', {
                userShiftStats,
            });
            let totalShifts = 0;
            if (userShiftStats.get(shift.userId)) {
                totalShifts = userShiftStats.get(shift.userId).total || 0;
            }
            console.log('possible shifts : ', { isPossible }, { totalShifts }, maxAmountOfShifts);
            return isPossible && totalShifts < maxAmountOfShifts;
        });
        console.log('possible shifts : ', { possibleShifts });
        if (possibleShifts.length < 1) {
            return false;
        }
        if (possibleShifts.length === 1) {
            assignedShift.userId = possibleShifts[0].userId;
        }
        const selectIndex = () => {
            const sortedShifts = [...possibleShifts].sort((a, b) => {
                const aSameShiftsCount = userShiftStats[a.userId] &&
                    userShiftStats[a.userId][assignedShift.shiftTimeName]
                    ? userShiftStats[a.userId][assignedShift.shiftTimeName].sum
                    : 1;
                const bSameShiftsCount = userShiftStats[b.userId] &&
                    userShiftStats[b.userId][assignedShift.shiftTimeName]
                    ? userShiftStats[b.userId][assignedShift.shiftTimeName].sum
                    : 1;
                const aScore = a.userPreference * 0.75 + (1 - aSameShiftsCount) * 0.25;
                const bScore = b.userPreference * 0.75 + (1 - bSameShiftsCount) * 0.25;
                return bScore - aScore;
            });
            return sortedShifts.length > 0
                ? possibleShifts.indexOf(sortedShifts[0])
                : -1;
        };
        const selectedInedx = selectIndex();
        const nextShiftKey = this.getNextShiftKeyInMap(shiftAndOptions.shift.shiftStartHour.toISOString(), shiftsMap);
        console.log('next shift Key = ', nextShiftKey, { shiftsMap }, shiftsMap[nextShiftKey]);
        if (nextShiftKey &&
            shiftsMap[nextShiftKey].optinalUsers.length === 1 &&
            shiftsMap[nextShiftKey].optinalUsers[0].userId ===
                possibleShifts[selectedInedx].userId) {
            console.log(':::1265::: user is only option for next shift ');
        }
        assignedShift.userId = possibleShifts[selectedInedx].userId;
        assignedShift.userPreference = possibleShifts[selectedInedx].userPreference;
        console.log(shiftsMap, { assignedShift });
        nextShiftKey &&
            this.updateShiftOptions(shiftsMap[nextShiftKey], possibleShifts[selectedInedx], 'remove');
        console.log({ assignedShift }, shiftsMap[nextShiftKey]);
        newShift.shift = assignedShift;
        newShift.optinalUsers = [
            ...this.updateShiftOptions(shiftsMap[assignedShift.shiftStartHour.toISOString()], possibleShifts[selectedInedx], 'remove'),
        ];
        return newShift;
    }
    updateShiftOptions(shiftToUpdate, option, action) {
        console.log('option to ', { action }, ' ', { option }, shiftToUpdate);
        const newOptions = action === 'remove'
            ? shiftToUpdate.optinalUsers && shiftToUpdate.optinalUsers.filter((optionToCheck) => {
                console.log(optionToCheck.userId, option.userId);
                return option.userId !== optionToCheck.userId;
            })
            : shiftToUpdate.optinalUsers.push(option);
        if (newOptions) {
            shiftToUpdate.optinalUsers = [...newOptions];
            console.log('new options ', { shiftToUpdate }, { action });
            return shiftToUpdate.optinalUsers;
        }
        else {
            return [];
        }
    }
    async createSystemSchedule(dto) {
        const selectedUsers = dto.selctedUsers;
        const currentMold = await this.getSelctedScheduleMold(dto.facilityId);
        if (currentMold === false) {
            throw new common_1.ForbiddenException('907 sched service currentmold ');
        }
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
        const newSchedule = await this.createEmptySystemSchedule(normelizedStartDate, normelizedendDate, dto.facilityId, currentMold.id);
        if (!newSchedule) {
            throw new common_1.ForbiddenException('1086 , Couldnt create schedule ');
        }
        const newScheduleAndShifts = { schedule: newSchedule, shifts: {} };
        const emptyShifts = this.genrateEmptySysSchedShifts(normelizedStartDate, newSchedule.id, currentMold.shiftsTemplate);
        newScheduleAndShifts.shifts = emptyShifts;
        await this.addUserOptionsToEmptySystemShifts(newScheduleAndShifts, selectedUsers);
        const assigedShifts = this.assignScheduleShifts(newScheduleAndShifts);
        const noUserShifts = [...assigedShifts.unAssigend];
        let index = 0;
        for (let i = 0; i < noUserShifts.length; i++) {
            const shiftToAssign = Object.assign({}, noUserShifts[i]);
            console.log('handel missing shift', { shiftToAssign }, shiftToAssign.optinalUsers);
            shiftToAssign.optinalUsers.forEach((element) => {
                console.log('shift option', { element });
            });
            if (shiftToAssign.optinalUsers && shiftToAssign.optinalUsers.length > 0) {
                const userOptionsShifts = [];
                shiftToAssign.optinalUsers.forEach((option) => {
                    if (assigedShifts.userShiftStats.get(option.userId).total === 6) {
                        const shiftsToUnAssign = this.getAllUserShiftsInSchedule(option.userId, assigedShifts.assigend).filter((shift) => shift.typeOfShift === 'short');
                        console.log('shifts to assign in two shift:', { shiftsToUnAssign });
                        shiftsToUnAssign && userOptionsShifts.push(shiftsToUnAssign);
                    }
                });
                console.log({ userOptionsShifts }, 'userOptinShifts', userOptionsShifts[0]);
                if (userOptionsShifts[0] && userOptionsShifts[0][0]) {
                    console.log('change htis shift:', userOptionsShifts[0][0]);
                    this.changeDayIntoTwoShifts(userOptionsShifts[0][0], assigedShifts.assigend, assigedShifts.userShiftStats);
                    const newShift = {
                        shift: Object.assign(Object.assign({}, shiftToAssign.shift), { userId: userOptionsShifts[0][0].userId }),
                        optinalUsers: Object.assign({}, shiftToAssign.optinalUsers),
                    };
                    console.log('newShiftAdter unassign', { newShift }, typeof newShift.shift.shiftStartHour, newShift.shift.shiftStartHour.toISOString().substring(1, 10));
                    assigedShifts.assigend.push(newShift);
                    noUserShifts.map((shift) => {
                        if (newShift.shift.shiftStartHour.toISOString().substring(1, 10) ===
                            shift.shift.shiftStartHour.toISOString().substring(1, 10) &&
                            newShift.shift.shiftRole.roleId ===
                                shift.shift.shiftRole.roleId &&
                            newShift.shift.tmpId !== shift.shift.tmpId) {
                            shift.optinalUsers = shift.optinalUsers.filter((shiftToUpdate) => shiftToUpdate.userId !== newShift.shift.userId);
                        }
                    });
                    console.log('reduxed arr');
                    noUserShifts.splice(i, 1);
                }
            }
        }
        noUserShifts.forEach((element) => {
            assigedShifts.assigend.push(element);
        });
        const sortedShifts = assigedShifts.assigend.sort((a, b) => {
            const dateA = new Date(a.shift.shiftStartHour).getTime();
            const dateB = new Date(b.shift.shiftStartHour).getTime();
            console.log(dateA, dateB, 'a,b ');
            return dateA - dateB;
        });
        return {
            shifts: [...sortedShifts],
            stats: [...assigedShifts.userShiftStats],
        };
    }
    async setSystemSchedule(dto) {
        console.log('dto of set sched', { dto });
        const shifts = Object.values(dto)
            .map((item) => {
            if (!item.shift || !item.shift.shiftRole) {
                console.error('Invalid shift data:', item);
                return null;
            }
            console.log({ item });
            const tmpShift = Object.assign({}, item.shift);
            return tmpShift;
        })
            .filter((shift) => shift !== null);
        console.log({ shifts });
        const createRes = await this.createScheduleShifts(shifts);
        console.log({ createRes });
    }
    async createScheduleShifts(scheduleShiftsToCreate) {
        const mapedShifts = scheduleShiftsToCreate.map((shift) => {
            console.log('shift to create', { shift });
            const tmp = Object.assign(Object.assign({}, shift), { shiftRoleId: shift.shiftRole.roleId, shiftName: shift.shiftTimeName + ' ' + shift.shiftRole.role.name });
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
        }
        catch (error) {
            console.log('error msg', error.message);
        }
    }
    async addUserOptionsToEmptySystemShifts(scheduleAndShifts, selectedUsers) {
        for (const [key, roleShifts] of Object.entries(scheduleAndShifts.shifts)) {
            console.log('add users shifts ', { key }, { roleShifts }, selectedUsers);
            const usersShifts = await this.getAllUsersForSchedule(scheduleAndShifts.schedule.scheduleStart, selectedUsers, Number(key), scheduleAndShifts.schedule.facilitId);
            console.log('users Shifts|::', Object.values(usersShifts), Object.values(usersShifts[0]).length);
            if (Object.values(usersShifts[0]).length < 2) {
                console.log('error in adding options to shifts ');
                throw new common_1.ForbiddenException('There is no users ');
            }
            Object.entries(roleShifts).forEach(([shiftDate, shiftDetails]) => {
                if (shiftDetails.optinalUsers.length === 0) {
                    const availableUsers = [];
                    usersShifts.forEach((userOptions) => {
                        userOptions[shiftDate] !== undefined &&
                            userOptions[shiftDate].userPreference !== '3' &&
                            availableUsers.push(userOptions[shiftDate]);
                    });
                    console.log('availble users in add options ', { availableUsers });
                    shiftDetails.optinalUsers = availableUsers;
                }
            });
        }
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
    async deleteSystemSchedule(scheduleId) {
        const currentDate = new Date();
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
            if (!resultDeleteRequests) {
                throw new common_1.ForbiddenException('cant compete delete ');
            }
            const res = await this.prisma.systemSchedule.delete({
                where: {
                    id: scheduleId,
                },
            });
            console.log('after try delete ::1492 ', { res });
            if (res) {
                return true;
            }
        }
        catch (error) {
            throw new common_1.ForbiddenException(error.message, error);
        }
    }
    async deleteAllSystemSchedules(facilityId) {
        console.log('try delete ');
        try {
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
        }
        catch (error) {
            console.log({ error });
            throw new common_1.ForbiddenException('cant delete');
        }
    }
};
ScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        shift_services_1.ShiftService,
        user_service_1.UserService,
        schedule_utilsClass_1.ScheduleUtil,
        user_statistics_service_1.UserStatisticsService])
], ScheduleService);
exports.ScheduleService = ScheduleService;
//# sourceMappingURL=schedule.service.js.map