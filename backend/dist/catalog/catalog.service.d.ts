import { Model } from 'mongoose';
import { Catalog, CatalogDocument } from '../schemas/catalog.schema';
import { CreateCatalogDto } from './dto/create-catalog.dto';
export declare class CatalogService {
    private catalogModel;
    constructor(catalogModel: Model<CatalogDocument>);
    create(createCatalogDto: CreateCatalogDto): Promise<import("mongoose").Document<unknown, {}, CatalogDocument, {}, {}> & Catalog & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, CatalogDocument, {}, {}> & Catalog & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, CatalogDocument, {}, {}> & Catalog & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findByType(tipo: string): Promise<(import("mongoose").Document<unknown, {}, CatalogDocument, {}, {}> & Catalog & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    getTypes(): Promise<string[]>;
    update(id: string, updateData: Partial<CreateCatalogDto>): Promise<import("mongoose").Document<unknown, {}, CatalogDocument, {}, {}> & Catalog & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, CatalogDocument, {}, {}> & Catalog & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
}
