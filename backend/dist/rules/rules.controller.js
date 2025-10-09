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
exports.RulesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const rules_service_1 = require("./rules.service");
const create_rule_dto_1 = require("./dto/create-rule.dto");
let RulesController = class RulesController {
    constructor(rulesService) {
        this.rulesService = rulesService;
    }
    async create(createRuleDto) {
        return this.rulesService.create(createRuleDto);
    }
    async findAll() {
        return this.rulesService.findAll();
    }
    async findByCatalogId(idCatalogo) {
        return this.rulesService.findByCatalogId(idCatalogo);
    }
    async remove(id) {
        return this.rulesService.remove(id);
    }
};
exports.RulesController = RulesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Crear nueva regla' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Regla creada exitosamente' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_rule_dto_1.CreateRuleDto]),
    __metadata("design:returntype", Promise)
], RulesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener todas las reglas' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Lista de reglas obtenida exitosamente' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RulesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('catalog/:idCatalogo'),
    (0, swagger_1.ApiOperation)({ summary: 'Obtener reglas por ID de catálogo' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reglas encontradas' }),
    __param(0, (0, common_1.Param)('idCatalogo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RulesController.prototype, "findByCatalogId", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Eliminar regla' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Regla eliminada exitosamente' }),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RulesController.prototype, "remove", null);
exports.RulesController = RulesController = __decorate([
    (0, swagger_1.ApiTags)('Reglas'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.Controller)('rules'),
    __metadata("design:paramtypes", [rules_service_1.RulesService])
], RulesController);
//# sourceMappingURL=rules.controller.js.map