import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { IngredientsModule } from './ingredient-set/ingredient-set.module';
import { RecipeModule } from './recipe/recipe.module';
import { YouTubeModule } from './youtube/youtube.module';
import { GeminiModule } from './gemini/gemini.module';

@Module({
  imports: [PrismaModule, UsersModule, IngredientsModule, RecipeModule, YouTubeModule, GeminiModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
