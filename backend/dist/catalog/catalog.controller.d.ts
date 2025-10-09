import { CatalogService } from './catalog.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';
export declare class CatalogController {
    private readonly catalogService;
    constructor(catalogService: CatalogService);
    create(createCatalogDto: CreateCatalogDto): Promise<import("mongoose").Document<unknown, {}, import("../schemas/catalog.schema").CatalogDocument, {}, {}> & import("../schemas/catalog.schema").Catalog & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    findAll(): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/catalog.schema").CatalogDocument, {}, {}> & import("../schemas/catalog.schema").Catalog & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    getTypes(): Promise<string[]>;
    findByType(tipo: string): Promise<(import("mongoose").Document<unknown, {}, import("../schemas/catalog.schema").CatalogDocument, {}, {}> & import("../schemas/catalog.schema").Catalog & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/catalog.schema").CatalogDocument, {}, {}> & import("../schemas/catalog.schema").Catalog & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    update(id: string, updateData: Partial<CreateCatalogDto>): Promise<import("mongoose").Document<unknown, {}, import("../schemas/catalog.schema").CatalogDocument, {}, {}> & import("../schemas/catalog.schema").Catalog & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
    remove(id: string): Promise<import("mongoose").Document<unknown, {}, import("../schemas/catalog.schema").CatalogDocument, {}, {}> & import("../schemas/catalog.schema").Catalog & import("mongoose").Document<unknown, any, any, Record<string, any>, {}> & Required<{
        _id: unknown;
    }> & {
        __v: number;
    }>;
}
