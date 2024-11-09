// Nestjs dependencies
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Local files
import { DbModule } from './app/db/db.module';
import { AppConfigModule } from './app/config/app-config.module';
import { MutantModule } from './app/mutants/mutant.module';

const MODULES = [
  ConfigModule.forRoot(),
  DbModule,
  AppConfigModule,

  // app
  MutantModule,
];

@Module({
  imports: [...MODULES],
})
export class AppModule {}
