import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DevicesService } from './devices.service';
import { CreateDeviceDto } from './dto/create-device.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';

@ApiTags('Dispositivos')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva solicitud de cotización' })
  @ApiResponse({ status: 201, description: 'Solicitud creada exitosamente' })
  async create(@Body() createDeviceDto: CreateDeviceDto) {
    return this.devicesService.create(createDeviceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las solicitudes' })
  @ApiResponse({ status: 200, description: 'Lista de solicitudes obtenida exitosamente' })
  async findAll() {
    return this.devicesService.findAll();
  }

  @Get('pending')
  @ApiOperation({ summary: 'Obtener solicitudes pendientes' })
  @ApiResponse({ status: 200, description: 'Solicitudes pendientes obtenidas exitosamente' })
  async findPending() {
    return this.devicesService.findPending();
  }

  @Get('accepted')
  @ApiOperation({ summary: 'Obtener solicitudes aceptadas' })
  @ApiResponse({ status: 200, description: 'Solicitudes aceptadas obtenidas exitosamente' })
  async findAccepted() {
    return this.devicesService.findAccepted();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener solicitud por ID' })
  @ApiResponse({ status: 200, description: 'Solicitud encontrada' })
  @ApiResponse({ status: 404, description: 'Solicitud no encontrada' })
  async findOne(@Param('id') id: string) {
    return this.devicesService.findOne(+id);
  }

  @Post('update-quotation')
  @ApiOperation({ summary: 'Actualizar cotización de un dispositivo' })
  @ApiResponse({ status: 200, description: 'Cotización actualizada exitosamente' })
  async updateQuotation(@Body() updateQuotationDto: UpdateQuotationDto) {
    return this.devicesService.updateQuotation(updateQuotationDto);
  }

  @Post('update-status')
  @ApiOperation({ summary: 'Actualizar estado de un dispositivo' })
  @ApiResponse({ status: 200, description: 'Estado actualizado exitosamente' })
  async updateStatus(@Body() body: { idDispositivo: number; nuevoEstado: string }) {
    return this.devicesService.updateStatus(body.idDispositivo, body.nuevoEstado);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar solicitud' })
  @ApiResponse({ status: 200, description: 'Solicitud eliminada exitosamente' })
  async remove(@Param('id') id: string) {
    return this.devicesService.remove(+id);
  }
}
