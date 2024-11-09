// Nestjs dependencies
import { Injectable } from '@nestjs/common';

// Local files
import { Env } from '../enums/env.enum';

@Injectable()
export class AppConfigService {
  get env(): string {
    return process.env[Env.NODE_ENV] || 'development';
  }

  get globalPrefix(): string {
    return process.env[Env.GLOBAL_PREFIX] || 'api/v1';
  }

  get databaseUrl(): string {
    return process.env[Env.DATABASE_URL] || '';
  }

  get port(): number {
    return Number(process.env[Env.PORT]) || 3000;
  }
}
