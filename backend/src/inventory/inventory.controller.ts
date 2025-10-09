import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { InventoryService } from './inventory.service';

@ApiTags('Inventario')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener inventario completo' })
  @ApiResponse({ status: 200, description: 'Inventario obtenido exitosamente' })
  async getInventory(@Query('tipo') tipo?: string, @Query('estado') estado?: string) {
    return this.inventoryService.getInventory(tipo, estado);
  }
}
