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
exports.QuotationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const device_schema_1 = require("../schemas/device.schema");
const catalog_schema_1 = require("../schemas/catalog.schema");
let QuotationsService = class QuotationsService {
    constructor(deviceModel, catalogModel) {
        this.deviceModel = deviceModel;
        this.catalogModel = catalogModel;
    }
    async getQuotationsWithCatalog() {
        const devices = await this.deviceModel.find({
            estadoCotizaci: { $in: ['Para reciclar', 'Para vender'] }
        }).exec();
        const result = [];
        for (const device of devices) {
            const catalog = await this.catalogModel.findOne({
                idCatalogo: device.idCatalogo
            }).exec();
            if (catalog) {
                result.push({
                    idCatalogo: catalog.idCatalogo,
                    nombre: catalog.nombre,
                    marca: catalog.marca,
                    tipo: catalog.tipo,
                    idDispositivo: device.idDispositivo,
                    estadoCotizaci: device.estadoCotizaci,
                });
            }
        }
        return result;
    }
    async getQuotationsByType(tipo) {
        const catalog = await this.catalogModel.find({ tipo }).exec();
        const catalogIds = catalog.map(c => c.idCatalogo);
        const devices = await this.deviceModel.find({
            idCatalogo: { $in: catalogIds },
            estadoCotizaci: { $in: ['Para reciclar', 'Para vender'] }
        }).exec();
        const result = [];
        for (const device of devices) {
            const catalogItem = catalog.find(c => c.idCatalogo === device.idCatalogo);
            if (catalogItem) {
                result.push({
                    idCatalogo: catalogItem.idCatalogo,
                    nombre: catalogItem.nombre,
                    marca: catalogItem.marca,
                    tipo: catalogItem.tipo,
                    idDispositivo: device.idDispositivo,
                    estadoCotizaci: device.estadoCotizaci,
                });
            }
        }
        return result;
    }
    async getQuotationsByStatus(estado) {
        const devices = await this.deviceModel.find({
            estadoCotizaci: estado
        }).exec();
        const result = [];
        for (const device of devices) {
            const catalog = await this.catalogModel.findOne({
                idCatalogo: device.idCatalogo
            }).exec();
            if (catalog) {
                result.push({
                    idCatalogo: catalog.idCatalogo,
                    nombre: catalog.nombre,
                    marca: catalog.marca,
                    tipo: catalog.tipo,
                    idDispositivo: device.idDispositivo,
                    estadoCotizaci: device.estadoCotizaci,
                });
            }
        }
        return result;
    }
};
exports.QuotationsService = QuotationsService;
exports.QuotationsService = QuotationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(device_schema_1.Device.name)),
    __param(1, (0, mongoose_1.InjectModel)(catalog_schema_1.Catalog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], QuotationsService);
//# sourceMappingURL=quotations.service.js.map