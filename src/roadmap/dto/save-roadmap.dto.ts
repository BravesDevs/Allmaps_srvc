import { ApiProperty } from '@nestjs/swagger';

export class SaveRoadmapDto {
    @ApiProperty({ example: 'React', description: 'The topic of the roadmap' })
    topic: string;

    @ApiProperty({ example: 'Beginner', description: 'The difficulty level' })
    difficulty: string;

    @ApiProperty({ example: {}, description: 'The JSON data of the roadmap' })
    data: any;

    @ApiProperty({ example: 1, description: 'The ID of the user saving the roadmap' })
    userId: number;
}
