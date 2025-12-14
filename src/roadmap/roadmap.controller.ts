import { Controller, Post, Body, Get, Param, ForbiddenException } from '@nestjs/common';
import { RoadmapService } from './roadmap.service';
import { UsersService } from '../users/users.service';
import { GeminiService } from '../gemini/gemini.service';
import { GenerateRoadmapDto } from './dto/generate-roadmap.dto';
import { SaveRoadmapDto } from './dto/save-roadmap.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('roadmap')
@Controller('roadmap')
export class RoadmapController {
  constructor(
    private readonly roadmapService: RoadmapService,
    private readonly geminiService: GeminiService,
    private readonly usersService: UsersService
  ) { }

  @Post('generate')
  @ApiOperation({ summary: 'Generate a learning roadmap' })
  @ApiResponse({ status: 200, description: 'The generated roadmap.' })
  async generate(@Body() body: GenerateRoadmapDto) {
    return this.geminiService.generateRoadmap(body.topic, body.difficulty);
  }

  @Post('save')
  @ApiOperation({ summary: 'Save a roadmap' })
  @ApiResponse({ status: 201, description: 'The roadmap has been successfully saved.' })
  async save(@Body() body: SaveRoadmapDto) {
    // Check if user is verified
    const user = await this.usersService.findById(body.userId);
    if (!user || !user.isEmailVerified) {
      throw new ForbiddenException({ error: "Please verify your email first before saving workflows. Check your inbox for the verification link." });
    }

    return this.roadmapService.create({
      topic: body.topic,
      difficulty: body.difficulty,
      data: body.data,
      user: { connect: { id: body.userId } }
    });
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get roadmaps for a user' })
  @ApiResponse({ status: 200, description: 'List of user roadmaps.' })
  async getUserRoadmaps(@Param('userId') userId: string) {
    return this.roadmapService.findAllByUser(Number(userId));
  }
}
