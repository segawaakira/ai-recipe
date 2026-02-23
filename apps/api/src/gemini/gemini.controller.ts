import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GeminiService } from './gemini.service';
import { GenerateRecipeDto } from './dto/generate-recipe.dto';
import { GenerateRecipeResponseDto } from './dto/generate-recipe-response.dto';
import { RecognizeIngredientsDto } from './dto/recognize-ingredients.dto';
import { RecognizeIngredientsResponseDto } from './dto/recognize-ingredients-response.dto';
import { ValidateIngredientsDto } from './dto/validate-ingredients.dto';
import { ValidateIngredientsResponseDto } from './dto/validate-ingredients-response.dto';
import { FollowUpRecipeDto } from './dto/follow-up-recipe.dto';
import { FollowUpRecipeResponseDto } from './dto/follow-up-recipe-response.dto';

@ApiTags('gemini')
@ApiBearerAuth()
@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('generate-recipe')
  @ApiOperation({ summary: 'Generate a recipe using Gemini AI' })
  @ApiResponse({ status: 201, description: 'Recipe generated', type: GenerateRecipeResponseDto })
  async generateRecipe(@Body() body: GenerateRecipeDto) {
    return this.geminiService.generateRecipe(
      body.preferredIngredients,
      body.allIngredients,
      body.servings,
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

  @Post('follow-up-recipe')
  @ApiOperation({ summary: 'Follow-up question about a generated recipe' })
  @ApiResponse({ status: 201, description: 'Follow-up reply generated', type: FollowUpRecipeResponseDto })
  async followUpRecipe(@Body() body: FollowUpRecipeDto) {
    return this.geminiService.followUpRecipe(
      body.recipeContent,
      body.recipeName,
      body.message,
    );
  }
}
