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
exports.InventoryService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const device_schema_1 = require("../schemas/device.schema");
const catalog_schema_1 = require("../schemas/catalog.schema");
let InventoryService = class InventoryService {
    constructor(deviceModel, catalogModel) {
        this.deviceModel = deviceModel;
        this.catalogModel = catalogModel;
    }
    async getInventory(tipo, estado) {
        const query = tipo ? { tipo } : {};
        const catalogo = await this.catalogModel.find(query).lean();
        let resultado = [];
        for (const item of catalogo) {
            let dispositivoQuery = { idCatalogo: item.idCatalogo };
            if (estado) {
                dispositivoQuery.estadoCotizaci = estado;
            }
            else {
                dispositivoQuery.estadoCotizaci = { $in: ['Para reciclar', 'Para vender'] };
            }
            const dispositivosRelacionados = await this.deviceModel.find(dispositivoQuery).lean();
            dispositivosRelacionados.forEach(dispositivo => {
                resultado.push({
                    idCatalogo: item.idCatalogo,
                    nombre: item.nombre,
                    marca: item.marca,
                    tipo: item.tipo,
                    idDispositivo: dispositivo.idDispositivo,
                    estadoCotizaci: dispositivo.estadoCotizaci,
                });
            });
        }
        return resultado;
    }
};
exports.InventoryService = InventoryService;
exports.InventoryService = InventoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(device_schema_1.Device.name)),
    __param(1, (0, mongoose_1.InjectModel)(catalog_schema_1.Catalog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], InventoryService);
//# sourceMappingURL=inventory.service.js.map