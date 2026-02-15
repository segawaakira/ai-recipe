import { Module } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { RecipeController } from './recipe.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [RecipeService],
  controllers: [RecipeController],
  exports: [RecipeService],
})
export class RecipeModule {}
