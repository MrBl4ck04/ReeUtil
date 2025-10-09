import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { autoIncrementPlugin } from '../plugins/auto-increment.plugin';

export type UserDocument = User & Document;

@Schema({ versionKey: false })
export class User {
  @Prop({ required: true })
  idUsuario: number;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  apellido: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  contraseA: string;

  @Prop()
  direccion?: string;

  @Prop()
  telefono?: string;

  @Prop({ default: false })
  rol: boolean; // true = admin, false = cliente
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.plugin(autoIncrementPlugin, { field: 'idUsuario' });
