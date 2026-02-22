import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';

// Simplicity - Just a simple service to create and list users
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.prisma.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      return { id: user.id, email: user.email, emailVerified: user.emailVerified };
    }
    return null;
  }

  async createUser(email: string, password: string) {
    this.logger.log(`Attempting to create user with email: ${email}`);

    try {
      // 既存のユーザーをチェック
      this.logger.log('Checking for existing user...');
      const existingUser = await this.prisma.prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        this.logger.warn(`User with email ${email} already exists`);
        throw new Error('User with this email already exists');
      }

      this.logger.log('Hashing password...');
      const hashedPassword = await bcrypt.hash(password, 10);

      this.logger.log('Creating user in database....');
      const user = await this.prisma.prisma.user.create({
        data: { email, password: hashedPassword },
      });

      this.logger.log(`User created successfully with ID: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error(
        `Error in createUser: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async listUsers() {
    const users = await this.prisma.prisma.user.findMany();

    if (!users) {
      throw new NotFoundException(`No users found`);
    }

    return users;
  }

  async updatePassword(userId: number, newPassword: string) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.prisma.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  async deleteUser(id: number) {
    // ユーザーが存在するかチェック
    const user = await this.prisma.prisma.user.findUnique({
      where: { id },
      include: { ingredientSets: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // 関連データ（IngredientSet）も含めて削除
    await this.prisma.prisma.user.delete({
      where: { id },
      include: { ingredientSets: true },
    });

    return { message: 'User and associated data deleted successfully' };
  }
}
