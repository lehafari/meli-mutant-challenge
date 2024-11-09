// Nestjs dependencies
import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';

// Local files
import { MutantController } from '../mutant.controller';
import { AnalyzeDNA, GetStats } from '../../usecases';

describe('MutantController', () => {
  let controller: MutantController;
  let analyzeDNAUseCase: AnalyzeDNA;
  let getStatsUseCase: GetStats;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MutantController],
      providers: [
        {
          provide: AnalyzeDNA,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetStats,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<MutantController>(MutantController);
    analyzeDNAUseCase = module.get<AnalyzeDNA>(AnalyzeDNA);
    getStatsUseCase = module.get<GetStats>(GetStats);
  });

  describe('analyzeDNA', () => {
    const mockDnaDto = {
      dna: ['ATGCGA', 'CAGTGC', 'TTATGT', 'AGAAGG', 'CCCCTA', 'TCACTG'],
    };

    it('should return isMutant true for mutant DNA', async () => {
      jest.spyOn(analyzeDNAUseCase, 'execute').mockResolvedValue(true);

      const result = await controller.analyzeDNA(mockDnaDto);

      expect(result).toEqual({ isMutant: true });
      expect(analyzeDNAUseCase.execute).toHaveBeenCalledWith(mockDnaDto.dna);
    });

    it('should throw ForbiddenException for human DNA', async () => {
      jest.spyOn(analyzeDNAUseCase, 'execute').mockResolvedValue(false);

      await expect(controller.analyzeDNA(mockDnaDto)).rejects.toThrow(
        ForbiddenException
      );
      expect(analyzeDNAUseCase.execute).toHaveBeenCalledWith(mockDnaDto.dna);
    });

    it('should propagate errors from use case', async () => {
      const error = new Error('Use case error');
      jest.spyOn(analyzeDNAUseCase, 'execute').mockRejectedValue(error);

      await expect(controller.analyzeDNA(mockDnaDto)).rejects.toThrow(error);
      expect(analyzeDNAUseCase.execute).toHaveBeenCalledWith(mockDnaDto.dna);
    });

    it('should handle empty DNA array', async () => {
      const emptyDnaDto = { dna: [] };
      jest.spyOn(analyzeDNAUseCase, 'execute').mockResolvedValue(false);

      await expect(controller.analyzeDNA(emptyDnaDto)).rejects.toThrow(
        ForbiddenException
      );
    });

    it('should validate DTO before processing', async () => {
      const invalidDnaDto = { dna: ['invalid'] };
      jest.spyOn(analyzeDNAUseCase, 'execute').mockResolvedValue(false);

      await expect(controller.analyzeDNA(invalidDnaDto)).rejects.toThrow(
        ForbiddenException
      );
    });
  });

  describe('getStats', () => {
    const mockStats = {
      count_mutant_dna: 40,
      count_human_dna: 100,
      ratio: 0.4,
      total_sequences: 140,
      base_distribution: {
        A: 25.5,
        T: 24.5,
        C: 25.0,
        G: 25.0,
      },
      mutant_patterns: {
        average: 2.3,
        max: 4,
        distribution: {
          horizontal: 1.2,
          vertical: 0.8,
          diagonal: 0.3,
        },
      },
      performance: {
        fastest_ms: 0.5,
        slowest_ms: 2.5,
        average_ms: 1.2,
      },
    };

    it('should return statistics successfully', async () => {
      jest.spyOn(getStatsUseCase, 'execute').mockResolvedValue(mockStats);

      const result = await controller.getStats();

      expect(result).toEqual(mockStats);
      expect(getStatsUseCase.execute).toHaveBeenCalled();
    });

    it('should return empty stats when no data exists', async () => {
      const emptyStats = {
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

      jest.spyOn(getStatsUseCase, 'execute').mockResolvedValue(emptyStats);

      const result = await controller.getStats();

      expect(result).toEqual(emptyStats);
      expect(getStatsUseCase.execute).toHaveBeenCalled();
    });

    it('should propagate errors from stats use case', async () => {
      const error = new Error('Stats error');
      jest.spyOn(getStatsUseCase, 'execute').mockRejectedValue(error);

      await expect(controller.getStats()).rejects.toThrow(error);
      expect(getStatsUseCase.execute).toHaveBeenCalled();
    });

    it('should handle null response from stats use case', async () => {
      jest.spyOn(getStatsUseCase, 'execute').mockResolvedValue(null);

      const result = await controller.getStats();

      expect(result).toBeNull();
      expect(getStatsUseCase.execute).toHaveBeenCalled();
    });
  });

  describe('Controller Decorators', () => {
    it('should have correct HTTP status code decorators', () => {
      const analyzeDNAMetadata = Reflect.getMetadata(
        'method',
        controller.analyzeDNA
      );
      const getStatsMetadata = Reflect.getMetadata(
        'method',
        controller.getStats
      );

      expect(analyzeDNAMetadata).toBeDefined();
      expect(getStatsMetadata).toBeDefined();
    });

    it('should have Swagger documentation', () => {
      const analyzeDNAResponses = Reflect.getMetadata(
        'swagger/apiResponse',
        controller.analyzeDNA
      );
      const getStatsResponses = Reflect.getMetadata(
        'swagger/apiResponse',
        controller.getStats
      );

      expect(analyzeDNAResponses).toBeDefined();
      expect(getStatsResponses).toBeDefined();
    });
  });
});
