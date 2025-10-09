import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as moment from 'moment-timezone';
import { Device, DeviceDocument } from '../schemas/device.schema';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';

@Injectable()
export class DevicesService {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}

  async create(createDeviceDto: CreateDeviceDto) {
    // Obtener el siguiente ID del dispositivo
    const lastDevice = await this.deviceModel.findOne().sort({ idDispositivo: -1 });
    const nextId = lastDevice ? lastDevice.idDispositivo + 1 : 1;

    const fechaLocal = moment().tz('America/La_Paz').toDate();

    const newDevice = new this.deviceModel({
      ...createDeviceDto,
      idDispositivo: nextId,
      fecha: fechaLocal,
      estadoCotizaci: 'En Curso',
    });

    return newDevice.save();
  }

  async findAll() {
    return this.deviceModel.find().exec();
  }

  async findPending() {
    return this.deviceModel.find({ estadoCotizaci: 'En Curso' }).exec();
  }

  async findAccepted() {
    return this.deviceModel.find({ estadoCotizaci: 'aceptado' }).exec();
  }

  async findOne(id: number) {
    return this.deviceModel.findOne({ idDispositivo: id }).exec();
  }

  async updateQuotation(updateQuotationDto: UpdateQuotationDto) {
    const { idDispositivo, cotizacion, estadoCotizaci } = updateQuotationDto;
    
    return this.deviceModel.findOneAndUpdate(
      { idDispositivo },
      { $set: { cotizacion, estadoCotizaci } },
      { new: true }
    ).exec();
  }

  async updateStatus(idDispositivo: number, nuevoEstado: string) {
    return this.deviceModel.findOneAndUpdate(
      { idDispositivo },
      { $set: { estadoCotizaci: nuevoEstado } },
      { new: true }
    ).exec();
  }

  async remove(id: number) {
    return this.deviceModel.findOneAndDelete({ idDispositivo: id }).exec();
  }
}
