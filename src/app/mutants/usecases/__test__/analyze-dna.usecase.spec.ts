// Nestjs dependencies
import { Test } from '@nestjs/testing';

// Local files
import { AnalyzeDNA } from '../analyze-dna.usecase';
import { MeliException } from '../../../../common/exceptions/meli.exception';
import { SaveDNAResults } from '../save-dna-results.usecase';

describe('AnalyzeDNA', () => {
  let analyzeDNA: AnalyzeDNA;
  let saveDNAResults: SaveDNAResults;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AnalyzeDNA,
        {
          provide: SaveDNAResults,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    analyzeDNA = moduleRef.get<AnalyzeDNA>(AnalyzeDNA);
    saveDNAResults = moduleRef.get<SaveDNAResults>(SaveDNAResults);
  });

  describe('execute', () => {
    it('should identify a mutant DNA sequence', async () => {
      const dna = ['ATGCGA', 'CAGTGC', 'TTATGT', 'AGAAGG', 'CCCCTA', 'TCACTG'];

      const result = await analyzeDNA.execute(dna);
      expect(result).toBe(true);
      expect(saveDNAResults.execute).toHaveBeenCalled();
    });

    it('should identify a human DNA sequence', async () => {
      const dna = ['ATGCGA', 'CAGTGC', 'TTATTT', 'AGACGG', 'GCGTCA', 'TCACTG'];

      const result = await analyzeDNA.execute(dna);
      expect(result).toBe(false);
      expect(saveDNAResults.execute).toHaveBeenCalled();
    });

    it('should throw an error for invalid DNA sequence', async () => {
      const dna = ['ATGCGA', 'CAGTGC', 'TTATTT', 'AGACGG', 'GCGTCA'];

      await expect(analyzeDNA.execute(dna)).rejects.toThrow(MeliException);
    });

    it('should throw an error for empty DNA sequence', async () => {
      const dna: string[] = [];

      await expect(analyzeDNA.execute(dna)).rejects.toThrow(MeliException);
    });

    it('should throw an error for invalid characters in DNA sequence', async () => {
      const dna = ['ATGCGA', 'CAGTGC', 'TTATTT', 'AGACGG', 'GCGTCA', 'TCACT1'];

      await expect(analyzeDNA.execute(dna)).rejects.toThrow(MeliException);
    });

    it('should identify diagonal patterns correctly', async () => {
      const dna = ['ATGCGA', 'CATTGC', 'TTATGT', 'AGAATG', 'CCCATA', 'TCACTG'];

      const result = await analyzeDNA.execute(dna);
      expect(result).toBe(true);
    });

    it('should identify horizontal patterns correctly', async () => {
      const dna = ['AAAAGA', 'CAGTGC', 'TTATGT', 'AGAAGG', 'CCCCTA', 'TCACTG'];

      const result = await analyzeDNA.execute(dna);
      expect(result).toBe(true);
    });

    it('should identify vertical patterns correctly', async () => {
      const dna = ['ATGCGA', 'ATGTGC', 'ATATGT', 'AGAAGG', 'CCCCTA', 'TCACTG'];

      const result = await analyzeDNA.execute(dna);
      expect(result).toBe(true);
    });

    describe('diagonal inverse patterns', () => {
      it('should identify inverse diagonal patterns at the start', async () => {
        const dna = [
          'ATGCGA',
          'CAGTAC',
          'TCAAGT',
          'AGAATG',
          'CCCATA',
          'TCACTG',
        ];

        const result = await analyzeDNA.execute(dna);
        expect(result).toBe(true);
      });

      it('should identify inverse diagonal patterns at the end', async () => {
        const dna = [
          'ATGCGT',
          'CAGTGT',
          'TTATTT',
          'AGAATG',
          'CCCATA',
          'TCACTG',
        ];

        const result = await analyzeDNA.execute(dna);
        expect(result).toBe(true);
      });

      it('should identify multiple inverse diagonal patterns', async () => {
        const dna = [
          'ATGCGT',
          'CAGTGT',
          'TCATTT',
          'AGCATG',
          'CCTATA',
          'TCACTG',
        ];

        const result = await analyzeDNA.execute(dna);
        expect(result).toBe(true);
      });
    });

    describe('edge cases', () => {
      it('should handle minimum size matrix', async () => {
        const dna = ['AAAA', 'ATAA', 'ATAA', 'ATAA'];

        const result = await analyzeDNA.execute(dna);
        expect(result).toBe(true);
      });

      it('should handle matrix with repeated patterns', async () => {
        const dna = [
          'AAAAAT',
          'TTTTTT',
          'AAAACC',
          'GGGGGG',
          'CCCCCT',
          'AAAAAA',
        ];

        const result = await analyzeDNA.execute(dna);
        expect(result).toBe(true);
      });
    });
  });
});
