import { Model } from 'mongoose';
import { DeviceDocument } from '../schemas/device.schema';
import { CatalogDocument } from '../schemas/catalog.schema';
export declare class InventoryService {
    private deviceModel;
    private catalogModel;
    constructor(deviceModel: Model<DeviceDocument>, catalogModel: Model<CatalogDocument>);
    getInventory(tipo?: string, estado?: string): Promise<any[]>;
}
