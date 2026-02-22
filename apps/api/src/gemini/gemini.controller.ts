import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GeminiService } from './gemini.service';
import { GenerateRecipeDto } from './dto/generate-recipe.dto';
import { GenerateRecipeResponseDto } from './dto/generate-recipe-response.dto';
import { RecognizeIngredientsDto } from './dto/recognize-ingredients.dto';
import { RecognizeIngredientsResponseDto } from './dto/recognize-ingredients-response.dto';
import { ValidateIngredientsDto } from './dto/validate-ingredients.dto';
import { ValidateIngredientsResponseDto } from './dto/validate-ingredients-response.dto';

@ApiTags('gemini')
@ApiBearerAuth()
@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('generate-recipe')
  @ApiOperation({ summary: 'Generate a recipe using Gemini AI' })
  @ApiResponse({ status: 201, description: 'Recipe generated', type: GenerateRecipeResponseDto })
  async generateRecipe(@Body() body: GenerateRecipeDto) {
    const preferred = body.preferredIngredients || body.ingredients || [];
    const all = body.allIngredients || [];
    const servings = body.servings || 2;
    return this.geminiService.generateRecipe(
      preferred,
      all,
      servings,
      body.ratedRecipes,
      body.genre,
    );
  }

  @Post('recognize-ingredients')
  @ApiOperation({ summary: 'Recognize ingredients from an image' })
  @ApiResponse({ status: 201, description: 'Ingredients recognized', type: RecognizeIngredientsResponseDto })
  async recognizeIngredients(@Body() body: RecognizeIngredientsDto) {
    return this.geminiService.recognizeIngredients(body.image);
  }

  @Post('validate-ingredients')
  @ApiOperation({ summary: 'Validate ingredients using Gemini AI' })
  @ApiResponse({ status: 201, description: 'Ingredients validated', type: ValidateIngredientsResponseDto })
  async validateIngredients(@Body() body: ValidateIngredientsDto) {
    return this.geminiService.validateIngredients(
      body.newIngredients,
      body.existingIngredients,
    );
  }
}
