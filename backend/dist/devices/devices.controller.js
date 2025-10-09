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
exports.DevicesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const devices_service_1 = require("./devices.service");
const create_device_dto_1 = require("./dto/create-device.dto");
const update_quotation_dto_1 = require("./dto/update-quotation.dto");
let DevicesController = class DevicesController {
    constructor(devicesService) {
        this.devicesService = devicesService;
    }
    async create(createDeviceDto) {
        return this.devicesService.create(createDeviceDto);
    }
    async findAll() {
        return this.devicesService.findAll();
    }
    async findPending() {
        return this.devicesService.findPending();
    }
    async findAccepted() {
        return this.devicesService.findAccepted();
    }
    async findOne(id) {
        return this.devicesService.findOne(+id);
    }
    async updateQuotation(updateQuotationDto) {
        return this.devicesService.updateQuotation(updateQuotationDto);
    }
    async updateStatus(body) {
        return this.devicesService.updateStatus(body.idDispositivo, body.nuevoEstado);
    }
    async remove(id) {
        return this.devicesService.remove(+id);
    }
};
exports.DevicesController = DevicesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nueva solicitud de cotización' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Solicitud creada exitosamente' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_device_dto_1.CreateDeviceDto]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las solicitudes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de solicitudes obtenida exitosamente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('pending'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener solicitudes pendientes' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Solicitudes pendientes obtenidas exitosamente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "findPending", null);
__decorate([
    (0, common_1.Get)('accepted'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener solicitudes aceptadas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Solicitudes aceptadas obtenidas exitosamente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "findAccepted", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener solicitud por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Solicitud encontrada' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Solicitud no encontrada' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('update-quotation'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar cotización de un dispositivo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Cotización actualizada exitosamente' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_quotation_dto_1.UpdateQuotationDto]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "updateQuotation", null);
__decorate([
    (0, common_1.Post)('update-status'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar estado de un dispositivo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Estado actualizado exitosamente' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar solicitud' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Solicitud eliminada exitosamente' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DevicesController.prototype, "remove", null);
exports.DevicesController = DevicesController = __decorate([
    (0, swagger_1.ApiTags)('Dispositivos'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('devices'),
    __metadata("design:paramtypes", [devices_service_1.DevicesService])
], DevicesController);
//# sourceMappingURL=devices.controller.js.map