export * from './get-stats.usecase';
export * from './analyze-dna.usecase';
export * from './save-dna-results.usecase';

import { GetStats } from './get-stats.usecase';
import { AnalyzeDNA } from './analyze-dna.usecase';
import { SaveDNAResults } from './save-dna-results.usecase';

export const USE_CASES = [AnalyzeDNA, SaveDNAResults, GetStats];
