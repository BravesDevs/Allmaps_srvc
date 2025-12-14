import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '../generated/prisma/client';

@Injectable()
export class RoadmapService {
  constructor(private prisma: PrismaService) { }

  async create(data: Prisma.RoadmapCreateInput | any) {
    return this.prisma.roadmap.create({ data });
  }

  async findAllByUser(userId: number) {
    return this.prisma.roadmap.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
