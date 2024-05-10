"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScheduleModule = void 0;
const common_1 = require("@nestjs/common");
const schedule_controller_1 = require("./schedule.controller");
const schedule_service_1 = require("./schedule.service");
const shift_module_1 = require("../shift/shift.module");
const user_module_1 = require("../user/user.module");
const schedule_utilsClass_1 = require("./schedule.utilsClass");
const user_statistics_module_1 = require("../user-statistics/user-statistics.module");
let ScheduleModule = class ScheduleModule {
};
ScheduleModule = __decorate([
    (0, common_1.Module)({
        imports: [shift_module_1.ShiftModule, user_module_1.UserModule, user_statistics_module_1.UserStatisticsModule],
        controllers: [schedule_controller_1.SchedulerController],
        providers: [schedule_service_1.ScheduleService, schedule_utilsClass_1.ScheduleUtil],
    })
], ScheduleModule);
exports.ScheduleModule = ScheduleModule;
//# sourceMappingURL=schedule.module.js.map