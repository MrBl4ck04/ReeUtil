import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { autoIncrementPlugin } from '../plugins/auto-increment.plugin';

export type DeviceDocument = Device & Document;

@Schema({ collection: 'dispositivos' })
export class Device {
  @Prop({ required: true })
  idDispositivo: number;

  @Prop()
  cotizacion?: number;

  @Prop()
  detalles?: string;

  @Prop({ default: 'En Curso' })
  estadoCotizaci: string;

  @Prop()
  estadoDisposit?: string;

  @Prop({ default: Date.now })
  fecha: Date;

  @Prop()
  idCatalogo?: number;

  @Prop()
  idUsuario?: number;

  @Prop()
  imagen?: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
DeviceSchema.plugin(autoIncrementPlugin, { field: 'idDispositivo' });
