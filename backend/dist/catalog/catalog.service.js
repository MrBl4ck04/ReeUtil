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
exports.CatalogService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const catalog_schema_1 = require("../schemas/catalog.schema");
let CatalogService = class CatalogService {
    constructor(catalogModel) {
        this.catalogModel = catalogModel;
    }
    async create(createCatalogDto) {
        const lastCatalog = await this.catalogModel.findOne().sort({ idCatalogo: -1 });
        const nextId = lastCatalog ? lastCatalog.idCatalogo + 1 : 1;
        const newCatalog = new this.catalogModel({
            ...createCatalogDto,
            idCatalogo: nextId,
        });
        return newCatalog.save();
    }
    async findAll() {
        return this.catalogModel.find().exec();
    }
    async findOne(id) {
        return this.catalogModel.findById(id).exec();
    }
    async findByType(tipo) {
        return this.catalogModel.find({ tipo }).exec();
    }
    async getTypes() {
        return this.catalogModel.distinct('tipo').exec();
    }
    async update(id, updateData) {
        return this.catalogModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
    }
    async remove(id) {
        return this.catalogModel.findByIdAndDelete(id).exec();
    }
};
exports.CatalogService = CatalogService;
exports.CatalogService = CatalogService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(catalog_schema_1.Catalog.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], CatalogService);
//# sourceMappingURL=catalog.service.js.map