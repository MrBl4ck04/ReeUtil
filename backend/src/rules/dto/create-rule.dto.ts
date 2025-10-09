import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRuleDto {
  @ApiProperty({ description: 'Nombre de la regla' })
  @IsNotEmpty()
  @IsString()
  nombreRegla: string;

  @ApiProperty({ description: 'Descripción de la regla' })
  @IsNotEmpty()
  @IsString()
  descripcionRE: string;

  @ApiProperty({ description: 'ID del catálogo asociado' })
  @IsNotEmpty()
  @IsString()
  idCatalogo: string;
}
