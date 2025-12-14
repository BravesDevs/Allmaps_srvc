
import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor() {
        const adapter = new PrismaMariaDb({ host: process.env.DB_HOST, port: Number(process.env.DB_PORT), user: process.env.DB_USER, password: process.env.DB_PASSWORD, database: process.env.DB_NAME });
            super({ adapter });
            this.$connect().then(() => {
                console.log('Connected to database');
            }).catch((error) => {
                console.error('Failed to connect to database:', error);
            });
    }
}
