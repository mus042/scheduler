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
exports.ScheduleUtil = void 0;
const common_1 = require("@nestjs/common");
const shift_services_1 = require("../shift/shift.services");
const user_service_1 = require("../user/user.service");
let ScheduleUtil = class ScheduleUtil {
    constructor(userService, ShiftService) {
        this.userService = userService;
        this.ShiftService = ShiftService;
        this.userShiftCount = {};
        this.shiftsStats = {};
    }
    getScheduleBeforForUser() { }
    setToNextDayOfWeek(targetDayOfWeek) {
        const currentDate = new Date();
        currentDate.setUTCHours(0, 0, 0, 0);
        let adjusted;
        if (currentDate.getDay() >= 3) {
            const daysUntilNextSunday = 7 - currentDate.getDay();
            const daysToAdd = daysUntilNextSunday;
            adjusted = new Date(currentDate.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
        }
        else {
            const daysUntilNextSunday = 7 - currentDate.getDay();
            adjusted = new Date(currentDate.getTime() + daysUntilNextSunday * 24 * 60 * 60 * 1000);
        }
        console.log({ adjusted });
        adjusted.setTime(adjusted.getTime() + targetDayOfWeek * 24 * 60 * 60 * 1000);
        return adjusted;
    }
    generateNewScheduleShifts(startingDate, endDate, scheduleId, schedulMold, type) {
        const shifts = schedulMold.shiftsTemplate.map((shift, index) => {
            console.log('shift Roles', shift.roles, { shift });
            const startDate = this.setToNextDayOfWeek(shift.day);
            startDate.setUTCHours(shift.startHour, 0, 0, 0);
            const endDate = this.setToNextDayOfWeek(shift.day);
            endDate.setUTCHours(shift.endHour, 0, 0, 0);
            console.log({ startDate }, { endDate }, shift.startHour, shift.day);
            if (type === 'system') {
                const shiftsByRoles = shift.userPrefs.map((role) => {
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
            const dto = {
                userPreference: '0',
                shiftType: 'user',
                typeOfShift: 'short',
                shiftStartHour: new Date(startDate),
                shiftEndHour: new Date(endDate),
                scheduleId: scheduleId,
                shiftTimeName: shift.shiftTimeName,
                shiftName: shift.name,
            };
            console.log({ dto });
            return dto;
        });
        console.log('shifts :', { shifts });
        return shifts;
    }
    async getUserprefForDate(shiftDate, userid) {
        let shiftPref;
        const userShift = await this.ShiftService.getUserShiftByParam(shiftDate, { name: 'userid', value: userid });
        if ((userShift === null || userShift === void 0 ? void 0 : userShift.userId) !== undefined && (userShift === null || userShift === void 0 ? void 0 : userShift.userPreference) !== null) {
            shiftPref = userShift.userPreference;
            return shiftPref;
        }
        return '-1';
    }
};
ScheduleUtil = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [user_service_1.UserService,
        shift_services_1.ShiftService])
], ScheduleUtil);
exports.ScheduleUtil = ScheduleUtil;
//# sourceMappingURL=schedule.utilsClass.js.map