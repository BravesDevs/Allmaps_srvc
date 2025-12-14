import { ApiProperty } from '@nestjs/swagger';

export class GenerateRoadmapDto {
    @ApiProperty({ example: 'React', description: 'The topic to generate a roadmap for' })
    topic: string;

    @ApiProperty({ example: 'Beginner', description: 'The difficulty level of the roadmap' })
    difficulty: string;
}
