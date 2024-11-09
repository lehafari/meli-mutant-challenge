// Nestjs dependencies
import { Injectable } from '@nestjs/common';

// Local files
import { PatternCounts, Position } from '../interfaces';
import { SaveDNAResults } from './save-dna-results.usecase';
import { MeliException } from '../../../common/exceptions/meli.exception';

@Injectable()
export class AnalyzeDNA {
  private readonly SEQUENCE_LENGTH = 4;
  private readonly MUTANT_THRESHOLD = 2;
  private readonly VALID_BASES = ['A', 'T', 'C', 'G'];

  constructor(private readonly _saveDNAResult: SaveDNAResults) {}

  async execute(dna: string[]): Promise<boolean> {
    if (!this._validateDNA(dna)) {
      throw new MeliException({
        error: 'Invalid DNA sequence',
        errorCode: 'invalid_dna_sequence',
        statusCode: 400,
      });
    }

    const startTime = performance.now();

    const [isMutant, patterns] = this._analyzeSequence(dna);

    const endTime = performance.now();
    const processingTime = endTime - startTime;

    await this._saveDNAResult.execute(dna, isMutant, patterns, processingTime);

    return isMutant;
  }

  private _analyzeSequence(dna: string[]): [boolean, PatternCounts] {
    const patterns: PatternCounts = {
      horizontal: 0,
      vertical: 0,
      diagonal: 0,
      total: 0,
    };

    const n = dna.length;
    const foundPatterns: Position[] = [];

    // Verificar secuencias horizontales (-)
    for (let row = 0; row < n; row++) {
      for (let col = 0; col <= n - this.SEQUENCE_LENGTH; col++) {
        if (this._checkSequence(dna, row, col, 0, 1)) {
          patterns.horizontal++;
          patterns.total++;
          foundPatterns.push({ row, col, direction: 'horizontal' });

          if (patterns.total >= this.MUTANT_THRESHOLD) {
            continue;
          }
        }
      }
    }

    // Verificar secuencias verticales (|)
    for (let col = 0; col < n; col++) {
      for (let row = 0; row <= n - this.SEQUENCE_LENGTH; row++) {
        if (this._checkSequence(dna, row, col, 1, 0)) {
          patterns.vertical++;
          patterns.total++;
          foundPatterns.push({ row, col, direction: 'vertical' });

          if (patterns.total >= this.MUTANT_THRESHOLD) {
            continue;
          }
        }
      }
    }

    // Verificar diagonales principales (↘)
    for (let row = 0; row <= n - this.SEQUENCE_LENGTH; row++) {
      for (let col = 0; col <= n - this.SEQUENCE_LENGTH; col++) {
        if (this._checkSequence(dna, row, col, 1, 1)) {
          patterns.diagonal++;
          patterns.total++;
          foundPatterns.push({ row, col, direction: 'diagonal' });

          if (patterns.total >= this.MUTANT_THRESHOLD) {
            continue;
          }
        }
      }
    }

    // Verificar diagonales inversas (↙)
    for (let row = 0; row <= n - this.SEQUENCE_LENGTH; row++) {
      for (let col = this.SEQUENCE_LENGTH - 1; col < n; col++) {
        if (this._checkSequence(dna, row, col, 1, -1)) {
          patterns.diagonal++;
          patterns.total++;
          foundPatterns.push({ row, col, direction: 'diagonal-inverse' });

          if (patterns.total >= this.MUTANT_THRESHOLD) {
            continue;
          }
        }
      }
    }

    return [patterns.total >= this.MUTANT_THRESHOLD, patterns];
  }

  private _checkSequence(
    dna: string[],
    startRow: number,
    startCol: number,
    rowDelta: number,
    colDelta: number
  ): boolean {
    const base = dna[startRow][startCol];

    if (!this.VALID_BASES.includes(base)) {
      return false;
    }

    for (let i = 1; i < this.SEQUENCE_LENGTH; i++) {
      const row = startRow + rowDelta * i;
      const col = startCol + colDelta * i;

      if (dna[row][col] !== base) {
        return false;
      }
    }

    return true;
  }

  private _validateDNA(dna: string[]): boolean {
    const n = dna.length;

    if (n === 0) return false;

    const validBasesRegex = new RegExp(`^[${this.VALID_BASES.join('')}]+$`);

    return dna.every((row) => {
      return row.length === n && validBasesRegex.test(row);
    });
  }
}
