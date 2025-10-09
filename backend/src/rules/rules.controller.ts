import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RulesService } from './rules.service';
import { CreateRuleDto } from './dto/create-rule.dto';

@ApiTags('Reglas')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post()
  @ApiOperation({ summary: 'Crear nueva regla' })
  @ApiResponse({ status: 201, description: 'Regla creada exitosamente' })
  async create(@Body() createRuleDto: CreateRuleDto) {
    return this.rulesService.create(createRuleDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todas las reglas' })
  @ApiResponse({ status: 200, description: 'Lista de reglas obtenida exitosamente' })
  async findAll() {
    return this.rulesService.findAll();
  }

  @Get('catalog/:idCatalogo')
  @ApiOperation({ summary: 'Obtener reglas por ID de catálogo' })
  @ApiResponse({ status: 200, description: 'Reglas encontradas' })
  async findByCatalogId(@Param('idCatalogo') idCatalogo: string) {
    return this.rulesService.findByCatalogId(idCatalogo);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar regla' })
  @ApiResponse({ status: 200, description: 'Regla eliminada exitosamente' })
  async remove(@Param('id') id: string) {
    return this.rulesService.remove(id);
  }
}
