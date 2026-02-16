import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';

@Injectable()
export class RecipeService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: number) {
    return this.prisma.prisma.recipe.findUnique({ where: { id } });
  }

  async create(dto: CreateRecipeDto) {
    return this.prisma.prisma.recipe.create({
      data: {
        name: dto.name,
        content: dto.content,
        ingredients: dto.ingredients,
        servings: dto.servings,
        genre: dto.genre ?? undefined,
        youtubeVideos: dto.youtubeVideos ?? undefined,
        user: {
          connect: { id: dto.userId },
        },
      },
    });
  }

  async findByUserId(
    userId: number,
    options?: {
      page?: number;
      perPage?: number;
      search?: string;
      ratingFilter?: number;
    },
  ) {
    const page = options?.page ?? 1;
    const perPage = options?.perPage ?? 10;

    const where: Record<string, unknown> = { userId };

    if (options?.ratingFilter) {
      where.rating = options.ratingFilter;
    }

    if (options?.search) {
      where.OR = [
        { name: { contains: options.search, mode: 'insensitive' } },
        { ingredients: { hasSome: [options.search] } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.prisma.recipe.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      this.prisma.prisma.recipe.count({ where }),
    ]);

    return { items, total };
  }

  async delete(id: number) {
    return this.prisma.prisma.recipe.delete({
      where: { id },
    });
  }

  async updateRating(id: number, rating: number) {
    return this.prisma.prisma.recipe.update({
      where: { id },
      data: { rating },
    });
  }

  async getRatedRecipes(userId: number, limit: number = 10) {
    return this.prisma.prisma.recipe.findMany({
      where: {
        userId,
        rating: { not: null },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        name: true,
        rating: true,
      },
    });
  }
}
