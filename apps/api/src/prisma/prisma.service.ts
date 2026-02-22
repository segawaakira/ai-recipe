import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

// Type definition for Prisma client
interface PrismaClientType {
  user: any;
  ingredientSet: any;
  recipe: any;
  emailVerificationToken: any;
  $connect: () => Promise<void>;
  $disconnect: () => Promise<void>;
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  public prisma: PrismaClientType;

  constructor() {
    // Dynamic import to avoid TypeScript issues
    try {
      // 正しいパスでPrismaクライアントをインポート
      const { PrismaClient } = require('../../node_modules/.prisma/client');
      this.prisma = new PrismaClient({
        log:
          process.env.NODE_ENV === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
      });
      this.logger.log('Prisma client initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Prisma client:', error);
      // Fallback to a mock client for development
      this.prisma = {
        user: {
          findUnique: async () => null,
          findMany: async () => [],
          create: async () => null,
          delete: async () => null,
        },
        ingredientSet: {
          findMany: async () => [],
          create: async () => null,
          update: async () => null,
        },
        recipe: {
          findMany: async () => [],
          create: async () => null,
          delete: async () => null,
        },
        emailVerificationToken: {
          findUnique: async () => null,
          create: async () => null,
          delete: async () => null,
          deleteMany: async () => null,
        },
        $connect: async () => {
          this.logger.warn(
            'Using mock Prisma client - database operations will not work',
          );
        },
        $disconnect: async () => {},
      };
    }
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    try {
      await this.prisma.$connect();
      this.logger.log('Database connected successfully');
    } catch (error) {
      this.logger.error('Failed to connect to database:', error);
    }
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    try {
      await this.prisma.$disconnect();
      this.logger.log('Database disconnected successfully');
    } catch (error) {
      this.logger.error('Failed to disconnect from database:', error);
    }
  }
}
