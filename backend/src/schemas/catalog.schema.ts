import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { autoIncrementPlugin } from '../plugins/auto-increment.plugin';

export type CatalogDocument = Catalog & Document;

@Schema({ collection: 'catalogo' })
export class Catalog {
  @Prop({ required: true })
  idCatalogo: number;

  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  marca: string;

  @Prop({ required: true })
  modelo: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ required: true })
  tipo: string;

  @Prop()
  imagenProdu?: string;

  @Prop()
  idUsuario?: string;
}

export const CatalogSchema = SchemaFactory.createForClass(Catalog);
CatalogSchema.plugin(autoIncrementPlugin, { field: 'idCatalogo' });
