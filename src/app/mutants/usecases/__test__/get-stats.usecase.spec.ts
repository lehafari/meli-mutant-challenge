// Nestjs dependencies
import { Test } from '@nestjs/testing';

// Local files
import { GetStats } from '../get-stats.usecase';
import { PrismaService } from '../../../db/services/prisma.service';

describe('GetStats', () => {
  let getStats: GetStats;
  let prismaService: PrismaService;

  const mockPrismaService = {
    statistics: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        GetStats,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    getStats = moduleRef.get<GetStats>(GetStats);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  describe('execute', () => {
    it('should return empty stats when no data exists', async () => {
      mockPrismaService.statistics.findFirst.mockResolvedValue(null);

      const result = await getStats.execute();

      expect(result).toEqual({
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
      });
    });

    it('should return formatted stats when data exists', async () => {
      const mockStats = {
        mutantCount: 40,
        humanCount: 60,
        ratio: 0.4,
        totalSequences: 100,
        avgBaseA: 25,
        avgBaseT: 25,
        avgBaseC: 25,
        avgBaseG: 25,
        avgMutantPatterns: 2.5,
        maxMutantPatterns: 4,
        avgHorizontalPatterns: 1,
        avgVerticalPatterns: 1,
        avgDiagonalPatterns: 0.5,
        fastestProcessing: 0.5,
        slowestProcessing: 2,
        avgProcessingTime: 1,
      };

      mockPrismaService.statistics.findFirst.mockResolvedValue(mockStats);

      const result = await getStats.execute();

      expect(result).toEqual({
        count_mutant_dna: 40,
        count_human_dna: 60,
        ratio: 0.4,
        total_sequences: 100,
        base_distribution: {
          A: 25,
          T: 25,
          C: 25,
          G: 25,
        },
        mutant_patterns: {
          average: 2.5,
          max: 4,
          distribution: {
            horizontal: 1,
            vertical: 1,
            diagonal: 0.5,
          },
        },
        performance: {
          fastest_ms: 0.5,
          slowest_ms: 2,
          average_ms: 1,
        },
      });
    });
  });
});
