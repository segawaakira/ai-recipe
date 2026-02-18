import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { CreateIngredientDto } from './dto/create-ingredient.dto';

// Simplicity - Just a simple service to create and list users
@Injectable()
export class IngredientsService {
  constructor(private readonly prisma: PrismaService) {}

  async createIngredientSet(dto: CreateIngredientDto & { userId: number }) {
    return this.prisma.prisma.ingredientSet.create({
      data: {
        ingredients: dto.ingredients,
        user: {
          connect: { id: dto.userId },
        },
      },
    });
  }

  async updateIngredientSet(id: number, dto: UpdateIngredientDto) {
    return this.prisma.prisma.ingredientSet.upsert({
      where: { userId: id },
      update: {
        ingredients: dto.ingredients,
      },
      create: {
        ingredients: dto.ingredients,
        user: {
          connect: { id },
        },
      },
    });
  }

  async getUserIngredientSets(userId: number) {
    return this.prisma.prisma.ingredientSet.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
