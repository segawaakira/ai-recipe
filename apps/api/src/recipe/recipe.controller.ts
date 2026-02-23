import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Query,
  Param,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeRatingDto } from './dto/update-recipe-rating.dto';
import { UpdateRecipeContentDto } from './dto/update-recipe-content.dto';
import { GetRecipesQueryDto } from './dto/get-recipes-query.dto';
import { GetRatedRecipesQueryDto } from './dto/get-rated-recipes-query.dto';
import { PaginatedRecipeResponseDto } from './dto/paginated-recipe-response.dto';
import { RecipeResponseDto, RatedRecipeResponseDto } from './dto/recipe-response.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('recipes')
@ApiBearerAuth()
@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  @ApiOperation({ summary: 'Save a recipe' })
  @ApiResponse({ status: 201, description: 'Recipe saved', type: RecipeResponseDto })
  async create(
    @CurrentUser() user: { userId: number; email: string },
    @Body() dto: CreateRecipeDto,
  ) {
    return this.recipeService.create({ ...dto, userId: user.userId });
  }

  @Get()
  @ApiOperation({ summary: 'Get recipes by user ID' })
  @ApiResponse({ status: 200, description: 'Paginated list of recipes', type: PaginatedRecipeResponseDto })
  async findByUserId(
    @CurrentUser() user: { userId: number; email: string },
    @Query() query: GetRecipesQueryDto,
  ) {
    return this.recipeService.findByUserId(user.userId, {
      page: query.page,
      perPage: query.perPage,
      search: query.search || undefined,
      ratingFilter: query.ratingFilter,
    });
  }

  @Get('rated')
  @ApiOperation({ summary: 'Get rated recipes for prompt context' })
  @ApiResponse({ status: 200, type: [RatedRecipeResponseDto] })
  async getRatedRecipes(
    @CurrentUser() user: { userId: number; email: string },
    @Query() query: GetRatedRecipesQueryDto,
  ) {
    return this.recipeService.getRatedRecipes(
      user.userId,
      query.limit ?? 10,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a recipe by ID' })
  @ApiResponse({ status: 200, type: RecipeResponseDto })
  async findById(@Param('id') id: string) {
    const recipe = await this.recipeService.findById(Number(id));
    if (!recipe) throw new NotFoundException();
    return recipe;
  }

  @Patch(':id/rating')
  @ApiOperation({ summary: 'Update recipe rating (1-5)' })
  @ApiResponse({ status: 200, description: 'Rating updated', type: RecipeResponseDto })
  async updateRating(
    @Param('id') id: string,
    @Body() dto: UpdateRecipeRatingDto,
  ) {
    return this.recipeService.updateRating(Number(id), dto.rating);
  }

  @Patch(':id/content')
  @ApiOperation({ summary: 'Update recipe name and content' })
  @ApiResponse({ status: 200, description: 'Recipe content updated', type: RecipeResponseDto })
  async updateContent(
    @Param('id') id: string,
    @Body() dto: UpdateRecipeContentDto,
  ) {
    return this.recipeService.updateContent(
      Number(id),
      dto.name,
      dto.content,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recipe' })
  @ApiResponse({ status: 200, description: 'Recipe deleted', type: RecipeResponseDto })
  async delete(@Param('id') id: string) {
    return this.recipeService.delete(Number(id));
  }
}
