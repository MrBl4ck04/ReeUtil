import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { QuotationsService } from './quotations.service';

@ApiTags('Cotizaciones')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Get('inventory')
  @ApiOperation({ summary: 'Obtener inventario de cotizaciones' })
  @ApiResponse({ status: 200, description: 'Inventario obtenido exitosamente' })
  async getInventory(@Query('tipo') tipo?: string, @Query('estado') estado?: string) {
    if (tipo) {
      return this.quotationsService.getQuotationsByType(tipo);
    }
    if (estado) {
      return this.quotationsService.getQuotationsByStatus(estado);
    }
    return this.quotationsService.getQuotationsWithCatalog();
  }
}
