import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Catalog, CatalogDocument } from '../schemas/catalog.schema';
import { CreateCatalogDto } from './dto/create-catalog.dto';

@Injectable()
export class CatalogService {
  constructor(
    @InjectModel(Catalog.name) private catalogModel: Model<CatalogDocument>,
  ) {}

  async create(createCatalogDto: CreateCatalogDto) {
    // Obtener el siguiente ID del catálogo
    const lastCatalog = await this.catalogModel.findOne().sort({ idCatalogo: -1 });
    const nextId = lastCatalog ? lastCatalog.idCatalogo + 1 : 1;

    const newCatalog = new this.catalogModel({
      ...createCatalogDto,
      idCatalogo: nextId,
    });

    return newCatalog.save();
  }

  async findAll() {
    return this.catalogModel.find().exec();
  }

  async findOne(id: string) {
    return this.catalogModel.findById(id).exec();
  }

  async findByType(tipo: string) {
    return this.catalogModel.find({ tipo }).exec();
  }

  async getTypes() {
    return this.catalogModel.distinct('tipo').exec();
  }

  async update(id: string, updateData: Partial<CreateCatalogDto>) {
    return this.catalogModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  async remove(id: string) {
    return this.catalogModel.findByIdAndDelete(id).exec();
  }
}
