import { Model } from 'mongoose';
import { DeviceDocument } from '../schemas/device.schema';
import { CatalogDocument } from '../schemas/catalog.schema';
export declare class QuotationsService {
    private deviceModel;
    private catalogModel;
    constructor(deviceModel: Model<DeviceDocument>, catalogModel: Model<CatalogDocument>);
    getQuotationsWithCatalog(): Promise<any[]>;
    getQuotationsByType(tipo: string): Promise<any[]>;
    getQuotationsByStatus(estado: string): Promise<any[]>;
}
