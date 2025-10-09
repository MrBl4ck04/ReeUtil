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
exports.CatalogSchema = exports.Catalog = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const auto_increment_plugin_1 = require("../plugins/auto-increment.plugin");
let Catalog = class Catalog {
};
exports.Catalog = Catalog;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Catalog.prototype, "idCatalogo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Catalog.prototype, "nombre", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Catalog.prototype, "marca", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Catalog.prototype, "modelo", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Catalog.prototype, "descripcion", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Catalog.prototype, "tipo", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Catalog.prototype, "imagenProdu", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Catalog.prototype, "idUsuario", void 0);
exports.Catalog = Catalog = __decorate([
    (0, mongoose_1.Schema)({ collection: 'catalogo' })
], Catalog);
exports.CatalogSchema = mongoose_1.SchemaFactory.createForClass(Catalog);
exports.CatalogSchema.plugin(auto_increment_plugin_1.autoIncrementPlugin, { field: 'idCatalogo' });
//# sourceMappingURL=catalog.schema.js.map