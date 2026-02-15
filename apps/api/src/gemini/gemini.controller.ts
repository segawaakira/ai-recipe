import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GeminiService } from './gemini.service';

@ApiTags('gemini')
@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('generate-recipe')
  @ApiOperation({ summary: 'Generate a recipe using Gemini AI' })
  @ApiResponse({ status: 201, description: 'Recipe generated' })
  async generateRecipe(
    @Body()
    body: {
      preferredIngredients?: string[];
      allIngredients?: string[];
      ingredients?: string[];
      servings?: number;
      ratedRecipes?: { name: string; rating: number }[];
    },
  ) {
    const preferred = body.preferredIngredients || body.ingredients || [];
    const all = body.allIngredients || [];
    const servings = body.servings || 2;
    return this.geminiService.generateRecipe(
      preferred,
      all,
      servings,
      body.ratedRecipes,
    );
  }

  @Post('recognize-ingredients')
  @ApiOperation({ summary: 'Recognize ingredients from an image' })
  @ApiResponse({ status: 201, description: 'Ingredients recognized' })
  async recognizeIngredients(@Body() body: { image: string }) {
    return this.geminiService.recognizeIngredients(body.image);
  }

  @Post('validate-ingredients')
  @ApiOperation({ summary: 'Validate ingredients using Gemini AI' })
  @ApiResponse({ status: 201, description: 'Ingredients validated' })
  async validateIngredients(
    @Body() body: { newIngredients: string[]; existingIngredients: string[] },
  ) {
    return this.geminiService.validateIngredients(
      body.newIngredients,
      body.existingIngredients,
    );
  }
}
