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
exports.RulesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const rule_schema_1 = require("../schemas/rule.schema");
let RulesService = class RulesService {
    constructor(ruleModel) {
        this.ruleModel = ruleModel;
    }
    async create(createRuleDto) {
        const lastRule = await this.ruleModel.findOne().sort({ idReglas: -1 });
        const nextId = lastRule ? lastRule.idReglas + 1 : 1;
        const newRule = new this.ruleModel({
            ...createRuleDto,
            idReglas: nextId,
        });
        return newRule.save();
    }
    async findByCatalogId(idCatalogo) {
        return this.ruleModel.find({ idCatalogo }).exec();
    }
    async findAll() {
        return this.ruleModel.find().exec();
    }
    async remove(id) {
        return this.ruleModel.findByIdAndDelete(id).exec();
    }
};
exports.RulesService = RulesService;
exports.RulesService = RulesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(rule_schema_1.Rule.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], RulesService);
//# sourceMappingURL=rules.service.js.map