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
exports.RuleSchema = exports.Rule = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const auto_increment_plugin_1 = require("../plugins/auto-increment.plugin");
let Rule = class Rule {
};
exports.Rule = Rule;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Number)
], Rule.prototype, "idReglas", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Rule.prototype, "nombreRegla", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Rule.prototype, "descripcionRE", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Rule.prototype, "idCatalogo", void 0);
exports.Rule = Rule = __decorate([
    (0, mongoose_1.Schema)()
], Rule);
exports.RuleSchema = mongoose_1.SchemaFactory.createForClass(Rule);
exports.RuleSchema.plugin(auto_increment_plugin_1.autoIncrementPlugin, { field: 'idReglas' });
//# sourceMappingURL=rule.schema.js.map