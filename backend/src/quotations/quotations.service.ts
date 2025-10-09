import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from '../schemas/device.schema';
import { Catalog, CatalogDocument } from '../schemas/catalog.schema';

@Injectable()
export class QuotationsService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(Catalog.name) private catalogModel: Model<CatalogDocument>,
  ) {}

  async getQuotationsWithCatalog() {
    const devices = await this.deviceModel.find({
      estadoCotizaci: { $in: ['Para reciclar', 'Para vender'] }
    }).exec();

    const result = [];
    
    for (const device of devices) {
      const catalog = await this.catalogModel.findOne({ 
        idCatalogo: device.idCatalogo 
      }).exec();
      
      if (catalog) {
        result.push({
          idCatalogo: catalog.idCatalogo,
          nombre: catalog.nombre,
          marca: catalog.marca,
          tipo: catalog.tipo,
          idDispositivo: device.idDispositivo,
          estadoCotizaci: device.estadoCotizaci,
        });
      }
    }
    
    return result;
  }

  async getQuotationsByType(tipo: string) {
    const catalog = await this.catalogModel.find({ tipo }).exec();
    const catalogIds = catalog.map(c => c.idCatalogo);
    
    const devices = await this.deviceModel.find({
      idCatalogo: { $in: catalogIds },
      estadoCotizaci: { $in: ['Para reciclar', 'Para vender'] }
    }).exec();

    const result = [];
    
    for (const device of devices) {
      const catalogItem = catalog.find(c => c.idCatalogo === device.idCatalogo);
      if (catalogItem) {
        result.push({
          idCatalogo: catalogItem.idCatalogo,
          nombre: catalogItem.nombre,
          marca: catalogItem.marca,
          tipo: catalogItem.tipo,
          idDispositivo: device.idDispositivo,
          estadoCotizaci: device.estadoCotizaci,
        });
      }
    }
    
    return result;
  }

  async getQuotationsByStatus(estado: string) {
    const devices = await this.deviceModel.find({
      estadoCotizaci: estado
    }).exec();

    const result = [];
    
    for (const device of devices) {
      const catalog = await this.catalogModel.findOne({ 
        idCatalogo: device.idCatalogo 
      }).exec();
      
      if (catalog) {
        result.push({
          idCatalogo: catalog.idCatalogo,
          nombre: catalog.nombre,
          marca: catalog.marca,
          tipo: catalog.tipo,
          idDispositivo: device.idDispositivo,
          estadoCotizaci: device.estadoCotizaci,
        });
      }
    }
    
    return result;
  }
}
