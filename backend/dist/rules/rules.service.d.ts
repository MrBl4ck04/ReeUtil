import { Model } from 'mongoose';
import { Rule, RuleDocument } from '../schemas/rule.schema';
import { CreateRuleDto } from './dto/create-rule.dto';
export declare class RulesService {
    private ruleModel;
    constructor(ruleModel: Model<RuleDocument>);
    create(createRuleDto: CreateRuleDto): Promise<import("mongoose").Document<unknown, {}, RuleDocument, {}, {}> & Rule & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findByCatalogId(idCatalogo: string): Promise<(import("mongoose").Document<unknown, {}, RuleDocument, {}, {}> & Rule & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, RuleDocument, {}, {}> & Rule & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, RuleDocument, {}, {}> & Rule & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
}
