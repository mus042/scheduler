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
exports.SystemShiftDTO = void 0;
const client_1 = require("@prisma/client");
const class_validator_1 = require("class-validator");
class SystemShiftDTO {
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SystemShiftDTO.prototype, "id", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Date)
], SystemShiftDTO.prototype, "createdAt", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SystemShiftDTO.prototype, "shiftName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Date)
], SystemShiftDTO.prototype, "shiftStartHour", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", Date)
], SystemShiftDTO.prototype, "shiftEndHour", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(client_1.typeOfShift),
    __metadata("design:type", String)
], SystemShiftDTO.prototype, "typeOfShift", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.shiftTimeClassification),
    __metadata("design:type", String)
], SystemShiftDTO.prototype, "shiftTimeName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], SystemShiftDTO.prototype, "shiftMoldId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], SystemShiftDTO.prototype, "scheduleId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], SystemShiftDTO.prototype, "shiftType", void 0);
exports.SystemShiftDTO = SystemShiftDTO;
//# sourceMappingURL=sysShift.dto.js.map