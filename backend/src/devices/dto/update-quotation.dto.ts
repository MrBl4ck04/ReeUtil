import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateQuotationDto {
  @ApiProperty({ description: 'ID del dispositivo' })
  @IsNotEmpty()
  @IsNumber()
  idDispositivo: number;

  @ApiProperty({ description: 'Valor de la cotización' })
  @IsNotEmpty()
  @IsNumber()
  cotizacion: number;

  @ApiProperty({ description: 'Nuevo estado de la cotización' })
  @IsNotEmpty()
  @IsString()
  estadoCotizaci: string;
}
