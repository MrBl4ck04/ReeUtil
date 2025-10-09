import { QuotationsService } from './quotations.service';
export declare class QuotationsController {
    private readonly quotationsService;
    constructor(quotationsService: QuotationsService);
    getInventory(tipo?: string, estado?: string): Promise<any[]>;
}
