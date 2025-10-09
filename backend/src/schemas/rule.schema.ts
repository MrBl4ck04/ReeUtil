import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { autoIncrementPlugin } from '../plugins/auto-increment.plugin';

export type RuleDocument = Rule & Document;

@Schema()
export class Rule {
  @Prop({ required: true })
  idReglas: number;

  @Prop({ required: true })
  nombreRegla: string;

  @Prop({ required: true })
  descripcionRE: string;

  @Prop({ required: true })
  idCatalogo: string;
}

export const RuleSchema = SchemaFactory.createForClass(Rule);
RuleSchema.plugin(autoIncrementPlugin, { field: 'idReglas' });
