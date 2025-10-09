import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Rule, RuleDocument } from '../schemas/rule.schema';
import { CreateRuleDto } from './dto/create-rule.dto';

@Injectable()
export class RulesService {
  constructor(
    @InjectModel(Rule.name) private ruleModel: Model<RuleDocument>,
  ) {}

  async create(createRuleDto: CreateRuleDto) {
    // Obtener el siguiente ID de regla
    const lastRule = await this.ruleModel.findOne().sort({ idReglas: -1 });
    const nextId = lastRule ? lastRule.idReglas + 1 : 1;

    const newRule = new this.ruleModel({
      ...createRuleDto,
      idReglas: nextId,
    });

    return newRule.save();
  }

  async findByCatalogId(idCatalogo: string) {
    return this.ruleModel.find({ idCatalogo }).exec();
  }

  async findAll() {
    return this.ruleModel.find().exec();
  }

  async remove(id: string) {
    return this.ruleModel.findByIdAndDelete(id).exec();
  }
}
