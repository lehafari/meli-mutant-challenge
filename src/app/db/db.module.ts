import { Global, Module } from '@nestjs/common';
import { PrismaService } from './services/prisma.service';

const SERVICES = [PrismaService];

@Global()
@Module({
  providers: [...SERVICES],
  exports: [...SERVICES],
})
export class DbModule {}
