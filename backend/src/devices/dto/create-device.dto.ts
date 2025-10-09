import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeviceDto {
  @ApiProperty({ description: 'Detalles del dispositivo' })
  @IsNotEmpty()
  @IsString()
  detalles: string;

  @ApiProperty({ description: 'Estado del dispositivo según el cliente' })
  @IsNotEmpty()
  @IsString()
  estado: string;

  @ApiProperty({ description: 'ID del catálogo' })
  @IsNotEmpty()
  @IsNumber()
  idCatalogo: number;

  @ApiProperty({ description: 'ID del usuario', required: false })
  @IsOptional()
  @IsNumber()
  idUsuario?: number;

  @ApiProperty({ description: 'Imagen del dispositivo', required: false })
  @IsOptional()
  @IsString()
  imagen?: string;
}
