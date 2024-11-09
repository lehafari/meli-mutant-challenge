// Nestjs dependencies
import { Module } from '@nestjs/common';

// Local files
import { USE_CASES } from './usecases';
import { MutantController } from './controller/mutant.controller';

const CONTROLLERS = [MutantController];

@Module({
  controllers: [...CONTROLLERS],
  providers: [...USE_CASES],
  exports: [...USE_CASES],
})
export class MutantModule {}
