import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCatalogDto {
  @ApiProperty({ description: 'Nombre del dispositivo' })
  @IsNotEmpty()
  @IsString()
  nombre: string;

  @ApiProperty({ description: 'Descripción del dispositivo' })
  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @ApiProperty({ description: 'Marca del dispositivo' })
  @IsNotEmpty()
  @IsString()
  marca: string;

  @ApiProperty({ description: 'Modelo del dispositivo' })
  @IsNotEmpty()
  @IsString()
  modelo: string;

  @ApiProperty({ description: 'Tipo de dispositivo' })
  @IsNotEmpty()
  @IsString()
  tipo: string;

  @ApiProperty({ description: 'Imagen del dispositivo en base64', required: false })
  @IsOptional()
  @IsString()
  imagenProdu?: string;
}
