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
exports.DeviceSchema = exports.Device = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const auto_increment_plugin_1 = require("../plugins/auto-increment.plugin");
let Device = class Device {
};
exports.Device = Device;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Device.prototype, "idDispositivo", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Device.prototype, "cotizacion", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Device.prototype, "detalles", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: 'En Curso' }),
    __metadata("design:type", String)
], Device.prototype, "estadoCotizaci", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Device.prototype, "estadoDisposit", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Device.prototype, "fecha", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Device.prototype, "idCatalogo", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", Number)
], Device.prototype, "idUsuario", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Device.prototype, "imagen", void 0);
exports.Device = Device = __decorate([
    (0, mongoose_1.Schema)({ collection: 'dispositivos' })
], Device);
exports.DeviceSchema = mongoose_1.SchemaFactory.createForClass(Device);
exports.DeviceSchema.plugin(auto_increment_plugin_1.autoIncrementPlugin, { field: 'idDispositivo' });
//# sourceMappingURL=device.schema.js.map