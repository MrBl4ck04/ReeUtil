import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from '../schemas/device.schema';
import { Catalog, CatalogDocument } from '../schemas/catalog.schema';

@Injectable()
export class InventoryService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
    @InjectModel(Catalog.name) private catalogModel: Model<CatalogDocument>,
  ) {}

  async getInventory(tipo?: string, estado?: string) {
    const query = tipo ? { tipo } : {};
    const catalogo = await this.catalogModel.find(query).lean();
    
    let resultado = [];
    
    for (const item of catalogo) {
      let dispositivoQuery = { idCatalogo: item.idCatalogo };
      
      if (estado) {
        dispositivoQuery.estadoCotizaci = estado;
      } else {
        dispositivoQuery.estadoCotizaci = { $in: ['Para reciclar', 'Para vender'] };
      }
      
      const dispositivosRelacionados = await this.deviceModel.find(dispositivoQuery).lean();
      
      dispositivosRelacionados.forEach(dispositivo => {
        resultado.push({
          idCatalogo: item.idCatalogo,
          nombre: item.nombre,
          marca: item.marca,
          tipo: item.tipo,
          idDispositivo: dispositivo.idDispositivo,
          estadoCotizaci: dispositivo.estadoCotizaci,
        });
      });
    }
    
    return resultado;
  }
}
