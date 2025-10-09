import { Document } from 'mongoose';
export type DeviceDocument = Device & Document;
export declare class Device {
    idDispositivo: number;
    cotizacion?: number;
    detalles?: string;
    estadoCotizaci: string;
    estadoDisposit?: string;
    fecha: Date;
    idCatalogo?: number;
    idUsuario?: number;
    imagen?: string;
}
export declare const DeviceSchema: import("mongoose").Schema<Device, import("mongoose").Model<Device, any, any, any, Document<unknown, any, Device, any, {}> & Device & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Device, Document<unknown, {}, import("mongoose").FlatRecord<Device>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Device> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
