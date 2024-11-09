// Nestjs dependencies
import { ApiProperty } from '@nestjs/swagger';

// External dependencies
import {
  IsArray,
  IsString,
  ArrayMinSize,
  Matches,
  ArrayMaxSize,
} from 'class-validator';

export class AnalyzeDnaDto {
  @ApiProperty({
    example: ['ATGCGA', 'CAGTGC', 'TTATGT', 'AGAAGG', 'CCCCTA', 'TCACTG'],
    description: 'DNA sequence to analyze',
    required: true,
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(4, { message: 'DNA sequence must have at least 4 rows' })
  @ArrayMaxSize(1000, { message: 'DNA sequence cannot exceed 1000 rows' })
  @IsString({ each: true, message: 'Each row must be a string' })
  @Matches(/^[ATCG]+$/, {
    each: true,
    message: 'DNA sequence can only contain A, T, C, G characters',
  })
  dna: string[];
}
