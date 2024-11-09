// Nestjs dependencies
import { Test } from '@nestjs/testing';

// Local files
import { SaveDNAResults } from '../save-dna-results.usecase';
import { PrismaService } from '../../../db/services/prisma.service';

describe('SaveDNAResults', () => {
  let saveDNAResults: SaveDNAResults;
  let prismaService: PrismaService;

  const mockPrismaService = {
    $transaction: jest.fn(),
    dnaSequence: {
      create: jest.fn(),
      groupBy: jest.fn(),
      aggregate: jest.fn(),
    },
    statistics: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        SaveDNAResults,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    saveDNAResults = moduleRef.get<SaveDNAResults>(SaveDNAResults);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  describe('execute', () => {
    const dna = ['ATGCGA', 'CAGTGC', 'TTATGT'];
    const patterns = {
      horizontal: 1,
      vertical: 1,
      diagonal: 0,
      total: 2,
    };

    beforeEach(() => {
      jest.clearAllMocks();
      mockPrismaService.$transaction.mockImplementation((callback) =>
        callback(mockPrismaService)
      );
    });

    it('should save DNA sequence and update stats for new sequence', async () => {
      mockPrismaService.statistics.findFirst.mockResolvedValue({
        id: 1,
        totalSequences: 10,
        mutantCount: 4,
        humanCount: 6,
      });

      mockPrismaService.dnaSequence.groupBy.mockResolvedValue([
        {
          isMutant: true,
          _count: { id: 5 },
          _avg: {
            processingTime: 1.5,
            mutantPatterns: 2,
            horizontalPatterns: 1,
            verticalPatterns: 1,
            diagonalPatterns: 0,
          },
        },
      ]);

      mockPrismaService.dnaSequence.aggregate.mockResolvedValue({
        _min: { processingTime: 0.5 },
        _max: { processingTime: 2.5, mutantPatterns: 3 },
      });

      await saveDNAResults.execute(dna, true, patterns, 1.5);

      expect(mockPrismaService.dnaSequence.create).toHaveBeenCalled();
      expect(mockPrismaService.statistics.update).toHaveBeenCalled();
    });

    it('should handle duplicate DNA sequences gracefully', async () => {
      mockPrismaService.$transaction.mockRejectedValue({ code: 'P2002' });

      await expect(
        saveDNAResults.execute(dna, true, patterns, 1.5)
      ).resolves.not.toThrow();
    });

    it('should correctly count bases in DNA sequence', async () => {
      mockPrismaService.statistics.findFirst.mockResolvedValue({ id: 1 });

      await saveDNAResults.execute(dna, true, patterns, 1.5);

      expect(mockPrismaService.dnaSequence.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            countA: expect.any(Number),
            countC: expect.any(Number),
            countG: expect.any(Number),
            countT: expect.any(Number),
          }),
        })
      );
    });
  });
});
