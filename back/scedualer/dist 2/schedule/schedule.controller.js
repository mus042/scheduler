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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerController = void 0;
const Guard_1 = require("../auth/Guard");
const common_1 = require("@nestjs/common");
const schedule_service_1 = require("./schedule.service");
const dto_1 = require("./dto");
const Decorator_1 = require("../Decorator");
const dto_2 = require("../shift/dto");
const role_guard_1 = require("../auth/role/role.guard");
const roles_decorator_1 = require("../auth/roles/roles.decorator");
let SchedulerController = class SchedulerController {
    constructor(ScheduleService) {
        this.ScheduleService = ScheduleService;
    }
    setScheduleMold(scheduleMold, facilityId) {
        console.log('mold', { scheduleMold });
        return this.ScheduleService.setScheduleMold(scheduleMold, facilityId);
    }
    getSelctedScheduleMold(facilityId) {
        console.log("facilityID", { facilityId });
        return this.ScheduleService.getSelctedScheduleMold(Number(facilityId));
    }
    getNextScheduleUser(userId, facilityId) {
        console.log('next schedule for user call', { userId }, { facilityId });
        return this.ScheduleService.getNextScheduleForUser(userId, facilityId);
    }
    getNextScheduleUserAsAdmin(userId, facilityId) {
        console.log(userId);
        return this.ScheduleService.getNextScheduleForUser(userId, facilityId);
    }
    getNextScheduleSystem(facilityId) {
        console.log('next sys schde', { facilityId }, "facilitId");
        return this.ScheduleService.getNextSystemSchedule(facilityId);
    }
    getCurrentSchedule(facilityId) {
        console.log("get current sched ");
        return this.ScheduleService.getCurrentSchedule(facilityId);
    }
    cnScheduleFU(userId, facilityId, dto) {
        console.log('schedual controler ');
        const startDate = new Date(dto.scedualStart);
        const endDate = new Date(dto.scedualStart.getDate() + 7);
        const schedDto = {
            scedualStart: startDate,
            scedualEnd: endDate,
            scedualDue: dto.scedualDue,
            userId: userId,
            facilityId: facilityId
        };
        console.log({ facilityId }, { schedDto });
        return this.ScheduleService.createSchedualeForUser(schedDto);
    }
    editeFuterSceduleForUser(shiftsToEdit) {
        console.log('controler ', { shiftsToEdit });
        const schedualId = shiftsToEdit.scheduleId;
        const shifts = shiftsToEdit.shiftsEdit;
        return this.ScheduleService.editeFuterSceduleForUser(schedualId, shifts);
    }
    submittedUsers(facilityId) {
        return this.ScheduleService.getSubmmitedUsersSchedule(facilityId);
    }
    createSchedule(scheduleDto, facilityId) {
        console.log("schecdcont ", { scheduleDto }, scheduleDto.selctedUsers);
        return this.ScheduleService.createSystemSchedule(Object.assign(Object.assign({}, scheduleDto), { facilityId }));
    }
    setSystemSchedule(scheduleDto, facilityId) {
        console.log("schecdcont ", { scheduleDto }, scheduleDto.selctedUsers);
        return this.ScheduleService.setSystemSchedule(Object.assign(Object.assign({}, scheduleDto), { facilityId }));
    }
    deleteSchedule(facilityId) {
        return this.ScheduleService.deleteAllSystemSchedules(facilityId);
    }
    getReplaceForShift(shiftId, schedule) {
        console.log('shift id controler', { shiftId });
        return this.ScheduleService.findReplaceForShift(parseInt(shiftId), parseInt(schedule));
    }
    checkAdmnin() {
        console.log('admin acsses ');
    }
};
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('setScheduleMold'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, Decorator_1.GetUser)('facilityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "setScheduleMold", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)('getSelctedScheduleMold'),
    __param(0, (0, common_1.Query)('facilityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "getSelctedScheduleMold", null);
__decorate([
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)('getNextSchedule'),
    __param(0, (0, Decorator_1.GetUser)('id')),
    __param(1, (0, Decorator_1.GetUser)('facilityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "getNextScheduleUser", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)('getNextScheduleAsAdmin'),
    __param(0, (0, common_1.Param)()),
    __param(1, (0, Decorator_1.GetUser)('facilityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "getNextScheduleUserAsAdmin", null);
__decorate([
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)('getNextSystemSchedule'),
    __param(0, (0, Decorator_1.GetUser)('facilityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "getNextScheduleSystem", null);
__decorate([
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)('getCurrentSchedule'),
    __param(0, (0, Decorator_1.GetUser)('facilityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "getCurrentSchedule", null);
__decorate([
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('cnScheduleFU'),
    __param(0, (0, Decorator_1.GetUser)('id', 'facilityId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, dto_1.scheduleDto]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "cnScheduleFU", null);
__decorate([
    (0, roles_decorator_1.Roles)('user', 'admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('editeFuterSceduleForUser'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_2.bulkShiftsToEditDto]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "editeFuterSceduleForUser", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)('submittedUsers'),
    __param(0, (0, Decorator_1.GetUser)('facilityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "submittedUsers", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('createSchedule'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, Decorator_1.GetUser)('facilityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "createSchedule", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('setSystemSchedule'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, Decorator_1.GetUser)('facilityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "setSystemSchedule", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Delete)('deleteSchedule/:scheduleId'),
    __param(0, (0, Decorator_1.GetUser)('facilityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "deleteSchedule", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin', 'user'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Get)('getReplaceForShift/:shiftId/:schedule'),
    __param(0, (0, common_1.Param)('shiftId')),
    __param(1, (0, common_1.Param)('schedule')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "getReplaceForShift", null);
__decorate([
    (0, roles_decorator_1.Roles)('admin'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('checkAdmin'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SchedulerController.prototype, "checkAdmnin", null);
SchedulerController = __decorate([
    (0, common_1.UseGuards)(Guard_1.JwtGuard, role_guard_1.RoleGuard),
    (0, common_1.Controller)('schedule'),
    __metadata("design:paramtypes", [schedule_service_1.ScheduleService])
], SchedulerController);
exports.SchedulerController = SchedulerController;
//# sourceMappingURL=schedule.controller.js.map