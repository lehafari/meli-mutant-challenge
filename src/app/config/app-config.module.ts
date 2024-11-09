// Nestjs dependencies
import { Global, Module } from '@nestjs/common';

// Local files
import { AppConfigService } from './services/app-config.service';

const PROVIDERS = [AppConfigService];

@Global()
@Module({
  providers: [...PROVIDERS],
  exports: [...PROVIDERS],
})
export class AppConfigModule {}
