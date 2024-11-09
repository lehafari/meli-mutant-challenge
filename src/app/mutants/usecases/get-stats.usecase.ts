// Nestjs dependencies
import { Injectable } from '@nestjs/common';

// Local files
import { PrismaService } from '../../db/services/prisma.service';

@Injectable()
export class GetStats {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const stats = await this.prisma.statistics.findFirst();

    if (!stats) {
      return this._getEmptyStats();
    }

    return {
      count_mutant_dna: stats.mutantCount,
      count_human_dna: stats.humanCount,
      ratio: stats.ratio,
      total_sequences: stats.totalSequences,
      base_distribution: {
        A: stats.avgBaseA,
        T: stats.avgBaseT,
        C: stats.avgBaseC,
        G: stats.avgBaseG,
      },
      mutant_patterns: {
        average: stats.avgMutantPatterns,
        max: stats.maxMutantPatterns,
        distribution: {
          horizontal: stats.avgHorizontalPatterns,
          vertical: stats.avgVerticalPatterns,
          diagonal: stats.avgDiagonalPatterns,
        },
      },
      performance: {
        fastest_ms: stats.fastestProcessing,
        slowest_ms: stats.slowestProcessing,
        average_ms: stats.avgProcessingTime,
      },
    };
  }

  private _getEmptyStats() {
    return {
      count_mutant_dna: 0,
      count_human_dna: 0,
      ratio: 0,
      total_sequences: 0,
      base_distribution: {
        A: 0,
        T: 0,
        C: 0,
        G: 0,
      },
      mutant_patterns: {
        average: 0,
        max: 0,
        distribution: {
          horizontal: 0,
          vertical: 0,
          diagonal: 0,
        },
      },
      performance: {
        fastest_ms: 0,
        slowest_ms: 0,
        average_ms: 0,
      },
    };
  }
}
