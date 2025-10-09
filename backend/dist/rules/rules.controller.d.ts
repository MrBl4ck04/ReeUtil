import { RulesService } from './rules.service';
import { CreateRuleDto } from './dto/create-rule.dto';
export declare class RulesController {
    private readonly rulesService;
    constructor(rulesService: RulesService);
    create(createRuleDto: CreateRuleDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/rule.schema").RuleDocument, {}, {}> & import("../schemas/rule.schema").Rule & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/rule.schema").RuleDocument, {}, {}> & import("../schemas/rule.schema").Rule & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    findByCatalogId(idCatalogo: string): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/rule.schema").RuleDocument, {}, {}> & import("../schemas/rule.schema").Rule & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/rule.schema").RuleDocument, {}, {}> & import("../schemas/rule.schema").Rule & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
}
