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
exports.CatalogController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const catalog_service_1 = require("./catalog.service");
const create_catalog_dto_1 = require("./dto/create-catalog.dto");
let CatalogController = class CatalogController {
    constructor(catalogService) {
        this.catalogService = catalogService;
    }
    async create(createCatalogDto) {
        return this.catalogService.create(createCatalogDto);
    }
    async findAll() {
        return this.catalogService.findAll();
    }
    async getTypes() {
        return this.catalogService.getTypes();
    }
    async findByType(tipo) {
        return this.catalogService.findByType(tipo);
    }
    async findOne(id) {
        return this.catalogService.findOne(id);
    }
    async update(id, updateData) {
        return this.catalogService.update(id, updateData);
    }
    async remove(id) {
        return this.catalogService.remove(id);
    }
};
exports.CatalogController = CatalogController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nuevo dispositivo en el catálogo' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Dispositivo creado exitosamente' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_catalog_dto_1.CreateCatalogDto]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todos los dispositivos del catálogo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de dispositivos obtenida exitosamente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('types'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener tipos únicos de dispositivos' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de tipos obtenida exitosamente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "getTypes", null);
__decorate([
    (0, common_1.Get)('filter'),
    (0, swagger_1.ApiOperation)({ summary: 'Filtrar dispositivos por tipo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dispositivos filtrados exitosamente' }),
    __param(0, (0, common_1.Query)('tipo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "findByType", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener dispositivo por ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dispositivo encontrado' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Dispositivo no encontrado' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Actualizar dispositivo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dispositivo actualizado exitosamente' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar dispositivo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dispositivo eliminado exitosamente' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CatalogController.prototype, "remove", null);
exports.CatalogController = CatalogController = __decorate([
    (0, swagger_1.ApiTags)('Catálogo'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('catalog'),
    __metadata("design:paramtypes", [catalog_service_1.CatalogService])
], CatalogController);
//# sourceMappingURL=catalog.controller.js.map