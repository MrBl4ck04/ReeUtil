import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query,
  UseGuards 
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CatalogService } from './catalog.service';
import { CreateCatalogDto } from './dto/create-catalog.dto';

@ApiTags('Catálogo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nuevo dispositivo en el catálogo' })
  @ApiResponse({ status: 201, description: 'Dispositivo creado exitosamente' })
  async create(@Body() createCatalogDto: CreateCatalogDto) {
    return this.catalogService.create(createCatalogDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los dispositivos del catálogo' })
  @ApiResponse({ status: 200, description: 'Lista de dispositivos obtenida exitosamente' })
  async findAll() {
    return this.catalogService.findAll();
  }

  @Get('types')
  @ApiOperation({ summary: 'Obtener tipos únicos de dispositivos' })
  @ApiResponse({ status: 200, description: 'Lista de tipos obtenida exitosamente' })
  async getTypes() {
    return this.catalogService.getTypes();
  }

  @Get('filter')
  @ApiOperation({ summary: 'Filtrar dispositivos por tipo' })
  @ApiResponse({ status: 200, description: 'Dispositivos filtrados exitosamente' })
  async findByType(@Query('tipo') tipo: string) {
    return this.catalogService.findByType(tipo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener dispositivo por ID' })
  @ApiResponse({ status: 200, description: 'Dispositivo encontrado' })
  @ApiResponse({ status: 404, description: 'Dispositivo no encontrado' })
  async findOne(@Param('id') id: string) {
    return this.catalogService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar dispositivo' })
  @ApiResponse({ status: 200, description: 'Dispositivo actualizado exitosamente' })
  async update(@Param('id') id: string, @Body() updateData: Partial<CreateCatalogDto>) {
    return this.catalogService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar dispositivo' })
  @ApiResponse({ status: 200, description: 'Dispositivo eliminado exitosamente' })
  async remove(@Param('id') id: string) {
    return this.catalogService.remove(id);
  }
}
