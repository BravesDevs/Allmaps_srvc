import { Module } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';
import { RoadmapController } from './roadmap.controller';
import { GeminiModule } from '../gemini/gemini.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [GeminiModule, UsersModule],
  controllers: [RoadmapController],
  providers: [RoadmapService],
})
export class RoadmapModule { }
