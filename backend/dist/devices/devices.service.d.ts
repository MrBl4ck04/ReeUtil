import { Model } from 'mongoose';
import { Device, DeviceDocument } from '../schemas/device.schema';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
export declare class DevicesService {
    private deviceModel;
    constructor(deviceModel: Model<DeviceDocument>);
    create(createDeviceDto: CreateDeviceDto): Promise<import("mongoose").Document<unknown, {}, DeviceDocument, {}, {}> & Device & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, DeviceDocument, {}, {}> & Device & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    findPending(): Promise<(import("mongoose").Document<unknown, {}, DeviceDocument, {}, {}> & Device & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    findAccepted(): Promise<(import("mongoose").Document<unknown, {}, DeviceDocument, {}, {}> & Device & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    findOne(id: number): Promise<import("mongoose").Document<unknown, {}, DeviceDocument, {}, {}> & Device & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateQuotation(updateQuotationDto: UpdateQuotationDto): Promise<import("mongoose").Document<unknown, {}, DeviceDocument, {}, {}> & Device & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateStatus(idDispositivo: number, nuevoEstado: string): Promise<import("mongoose").Document<unknown, {}, DeviceDocument, {}, {}> & Device & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: number): Promise<import("mongoose").Document<unknown, {}, DeviceDocument, {}, {}> & Device & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
}
