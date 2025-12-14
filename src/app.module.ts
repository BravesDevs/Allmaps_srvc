import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { RoadmapModule } from './roadmap/roadmap.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { GeminiModule } from './gemini/gemini.module';

import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RoadmapModule,
    AuthModule,
    UsersModule,
    GeminiModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
