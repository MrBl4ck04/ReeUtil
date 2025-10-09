import { Document } from 'mongoose';
export type CatalogDocument = Catalog & Document;
export declare class Catalog {
    idCatalogo: number;
    nombre: string;
    marca: string;
    modelo: string;
    descripcion: string;
    tipo: string;
    imagenProdu?: string;
    idUsuario?: string;
}
export declare const CatalogSchema: import("mongoose").Schema<Catalog, import("mongoose").Model<Catalog, any, any, any, Document<unknown, any, Catalog, any, {}> & Catalog & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Catalog, Document<unknown, {}, import("mongoose").FlatRecord<Catalog>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Catalog> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
