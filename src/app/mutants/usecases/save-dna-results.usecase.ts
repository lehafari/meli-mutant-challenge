// Nestjs dependencies
import { Injectable, BadRequestException } from '@nestjs/common';

// External dependencies
import * as crypto from 'crypto';

// Local files
import { PatternCounts } from '../interfaces';
import { PrismaService } from '../../db/services/prisma.service';

@Injectable()
export class SaveDNAResults {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    dna: string[],
    isMutant: boolean,
    patterns: PatternCounts,
    processingTime: number
  ): Promise<void> {
    const hash = this._calculateHash(dna);
    const baseCounts = this._countBases(dna);

    try {
      await this.prisma.$transaction(async (tx) => {
        // Crear secuencia
        await tx.dnaSequence.create({
          data: {
            sequence: dna,
            isMutant,
            hash,
            sequenceSize: dna.length,
            mutantPatterns: patterns.total,
            processingTime,
            horizontalPatterns: patterns.horizontal,
            verticalPatterns: patterns.vertical,
            diagonalPatterns: patterns.diagonal,
            ...baseCounts,
          },
        });

        // Obtener o crear estadísticas
        let stats = await tx.statistics.findFirst();
        if (!stats) {
          stats = await tx.statistics.create({
            data: {
              totalSequences: 0,
              mutantCount: 0,
              humanCount: 0,
              ratio: 0,
              avgProcessingTime: 0,
              avgMutantPatterns: 0,
              avgHorizontalPatterns: 0,
              avgVerticalPatterns: 0,
              avgDiagonalPatterns: 0,
              avgBaseA: 0,
              avgBaseC: 0,
              avgBaseG: 0,
              avgBaseT: 0,
              fastestProcessing: processingTime,
              slowestProcessing: processingTime,
              maxMutantPatterns: patterns.total,
            },
          });
        }

        // Calcular nuevas estadísticas
        const newStats = await tx.dnaSequence.groupBy({
          by: ['isMutant'],
          _count: {
            id: true,
          },
          _avg: {
            processingTime: true,
            mutantPatterns: true,
            horizontalPatterns: true,
            verticalPatterns: true,
            diagonalPatterns: true,
            countA: true,
            countC: true,
            countG: true,
            countT: true,
          },
        });

        // Extraer estadísticas por tipo
        const mutantStats = newStats.find((stat) => stat.isMutant) || {
          _count: { id: 0 },
          _avg: {
            processingTime: 0,
            mutantPatterns: 0,
            horizontalPatterns: 0,
            verticalPatterns: 0,
            diagonalPatterns: 0,
            countA: 0,
            countC: 0,
            countG: 0,
            countT: 0,
          },
        };
        const humanStats = newStats.find((stat) => !stat.isMutant) || {
          _count: { id: 0 },
          _avg: {
            processingTime: 0,
            mutantPatterns: 0,
            horizontalPatterns: 0,
            verticalPatterns: 0,
            diagonalPatterns: 0,
            countA: 0,
            countC: 0,
            countG: 0,
            countT: 0,
          },
        };

        // Calcular totales
        const totalSequences = mutantStats._count.id + humanStats._count.id;
        const ratio =
          totalSequences > 0 ? mutantStats._count.id / totalSequences : 0;

        // Obtener records
        const records = await tx.dnaSequence.aggregate({
          _min: {
            processingTime: true,
          },
          _max: {
            processingTime: true,
            mutantPatterns: true,
          },
        });

        // Calcular promedios asegurándose de que no sean NaN
        const avgProcessingTime =
          this._calculateAverage([mutantStats, humanStats], 'processingTime') ||
          processingTime;

        const updateData = {
          totalSequences,
          mutantCount: mutantStats._count.id,
          humanCount: humanStats._count.id,
          ratio,
          avgProcessingTime,
          avgMutantPatterns: mutantStats._avg.mutantPatterns || 0,
          avgHorizontalPatterns:
            this._calculateAverage(
              [mutantStats, humanStats],
              'horizontalPatterns'
            ) || 0,
          avgVerticalPatterns:
            this._calculateAverage(
              [mutantStats, humanStats],
              'verticalPatterns'
            ) || 0,
          avgDiagonalPatterns:
            this._calculateAverage(
              [mutantStats, humanStats],
              'diagonalPatterns'
            ) || 0,
          avgBaseA:
            this._calculateAverage([mutantStats, humanStats], 'countA') || 0,
          avgBaseC:
            this._calculateAverage([mutantStats, humanStats], 'countC') || 0,
          avgBaseG:
            this._calculateAverage([mutantStats, humanStats], 'countG') || 0,
          avgBaseT:
            this._calculateAverage([mutantStats, humanStats], 'countT') || 0,
          fastestProcessing: records._min.processingTime || processingTime,
          slowestProcessing: records._max.processingTime || processingTime,
          maxMutantPatterns: records._max.mutantPatterns || patterns.total,
        };

        // Actualizar estadísticas
        await tx.statistics.update({
          where: { id: stats.id },
          data: updateData,
        });
      });
    } catch (error) {
      if (error.code === 'P2002') {
        console.log('Duplicate DNA sequence detected, skipping save');
        return;
      }
      throw error;
    }
  }

  private _calculateHash(dna: string[]): string {
    return crypto.createHash('sha256').update(dna.join('')).digest('hex');
  }

  private _calculateAverage(stats: any[], field: string): number {
    const validValues = stats
      .filter(
        (stat) =>
          stat._avg && stat._avg[field] !== null && !isNaN(stat._avg[field])
      )
      .map((stat) => stat._avg[field]);

    if (validValues.length === 0) return 0;

    const sum = validValues.reduce((a, b) => a + b, 0);
    return sum / validValues.length;
  }

  private _countBases(dna: string[]): {
    countA: number;
    countC: number;
    countG: number;
    countT: number;
  } {
    const joined = dna.join('');
    return {
      countA: (joined.match(/A/g) || []).length,
      countC: (joined.match(/C/g) || []).length,
      countG: (joined.match(/G/g) || []).length,
      countT: (joined.match(/T/g) || []).length,
    };
  }
}
