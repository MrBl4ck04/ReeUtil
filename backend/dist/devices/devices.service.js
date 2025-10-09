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
exports.DevicesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const moment = require("moment-timezone");
const device_schema_1 = require("../schemas/device.schema");
let DevicesService = class DevicesService {
    constructor(deviceModel) {
        this.deviceModel = deviceModel;
    }
    async create(createDeviceDto) {
        const lastDevice = await this.deviceModel.findOne().sort({ idDispositivo: -1 });
        const nextId = lastDevice ? lastDevice.idDispositivo + 1 : 1;
        const fechaLocal = moment().tz('America/La_Paz').toDate();
        const newDevice = new this.deviceModel({
            ...createDeviceDto,
            idDispositivo: nextId,
            fecha: fechaLocal,
            estadoCotizaci: 'En Curso',
        });
        return newDevice.save();
    }
    async findAll() {
        return this.deviceModel.find().exec();
    }
    async findPending() {
        return this.deviceModel.find({ estadoCotizaci: 'En Curso' }).exec();
    }
    async findAccepted() {
        return this.deviceModel.find({ estadoCotizaci: 'aceptado' }).exec();
    }
    async findOne(id) {
        return this.deviceModel.findOne({ idDispositivo: id }).exec();
    }
    async updateQuotation(updateQuotationDto) {
        const { idDispositivo, cotizacion, estadoCotizaci } = updateQuotationDto;
        return this.deviceModel.findOneAndUpdate({ idDispositivo }, { $set: { cotizacion, estadoCotizaci } }, { new: true }).exec();
    }
    async updateStatus(idDispositivo, nuevoEstado) {
        return this.deviceModel.findOneAndUpdate({ idDispositivo }, { $set: { estadoCotizaci: nuevoEstado } }, { new: true }).exec();
    }
    async remove(id) {
        return this.deviceModel.findOneAndDelete({ idDispositivo: id }).exec();
    }
};
exports.DevicesService = DevicesService;
exports.DevicesService = DevicesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(device_schema_1.Device.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], DevicesService);
//# sourceMappingURL=devices.service.js.map