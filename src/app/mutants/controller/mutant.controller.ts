// Nestjs dependencies
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

// Local files
import { AnalyzeDnaDto } from '../dtos';
import { AnalyzeDNA, GetStats } from '../usecases';

const path = 'mutant';

@ApiTags(path)
@Controller(path)
export class MutantController {
  constructor(
    private readonly _analyzeDnaUseCase: AnalyzeDNA,
    private readonly _getStats: GetStats
  ) {}

  @Post()
  @ApiResponse({
    status: 200,
    description: 'The DNA sequence belongs to a mutant',
  })
  @ApiResponse({
    status: 403,
    description: 'The DNA sequence belongs to a human',
  })
  @HttpCode(HttpStatus.OK)
  async analyzeDNA(@Body() { dna }: AnalyzeDnaDto) {
    const isMutant = await this._analyzeDnaUseCase.execute(dna);

    if (!isMutant) {
      throw new ForbiddenException('DNA sequence belongs to a human');
    }

    return { isMutant };
  }

  @Get('stats')
  @ApiResponse({
    status: 200,
    description: 'Comprehensive DNA analysis statistics',
  })
  async getStats() {
    return this._getStats.execute();
  }
}
