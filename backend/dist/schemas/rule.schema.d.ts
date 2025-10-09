import { Document } from 'mongoose';
export type RuleDocument = Rule & Document;
export declare class Rule {
    idReglas: number;
    nombreRegla: string;
    descripcionRE: string;
    idCatalogo: string;
}
export declare const RuleSchema: import("mongoose").Schema<Rule, import("mongoose").Model<Rule, any, any, any, Document<unknown, any, Rule, any, {}> & Rule & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Rule, Document<unknown, {}, import("mongoose").FlatRecord<Rule>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Rule> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
