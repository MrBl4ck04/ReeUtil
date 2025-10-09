import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
export declare class DevicesController {
    private readonly devicesService;
    constructor(devicesService: DevicesService);
    create(createDeviceDto: CreateDeviceDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/device.schema").DeviceDocument, {}, {}> & import("../schemas/device.schema").Device & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/device.schema").DeviceDocument, {}, {}> & import("../schemas/device.schema").Device & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    findPending(): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/device.schema").DeviceDocument, {}, {}> & import("../schemas/device.schema").Device & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    findAccepted(): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/device.schema").DeviceDocument, {}, {}> & import("../schemas/device.schema").Device & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/device.schema").DeviceDocument, {}, {}> & import("../schemas/device.schema").Device & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateQuotation(updateQuotationDto: UpdateQuotationDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/device.schema").DeviceDocument, {}, {}> & import("../schemas/device.schema").Device & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    updateStatus(body: {
        idDispositivo: number;
        nuevoEstado: string;
    }): Promise<import("mongoose").Document<unknown, {}, import("../schemas/device.schema").DeviceDocument, {}, {}> & import("../schemas/device.schema").Device & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/device.schema").DeviceDocument, {}, {}> & import("../schemas/device.schema").Device & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
}
