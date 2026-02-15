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
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeRatingDto } from './dto/update-recipe-rating.dto';
import { PaginatedRecipeResponseDto } from './dto/paginated-recipe-response.dto';
import { RecipeResponseDto } from './dto/recipe-response.dto';

@ApiTags('recipes')
@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  @ApiOperation({ summary: 'Save a recipe' })
  @ApiResponse({ status: 201, description: 'Recipe saved', type: RecipeResponseDto })
  async create(@Body() dto: CreateRecipeDto) {
    return this.recipeService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get recipes by user ID' })
  @ApiQuery({ name: 'userId', type: Number })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'perPage', type: Number, required: false })
  @ApiQuery({ name: 'search', type: String, required: false })
  @ApiQuery({ name: 'ratingFilter', type: Number, required: false })
  @ApiResponse({ status: 200, description: 'Paginated list of recipes', type: PaginatedRecipeResponseDto })
  async findByUserId(
    @Query('userId') userId: number,
    @Query('page') page?: number,
    @Query('perPage') perPage?: number,
    @Query('search') search?: string,
    @Query('ratingFilter') ratingFilter?: string,
  ) {
    return this.recipeService.findByUserId(Number(userId), {
      page: page ? Number(page) : undefined,
      perPage: perPage ? Number(perPage) : undefined,
      search: search || undefined,
      ratingFilter: ratingFilter ? Number(ratingFilter) : undefined,
    });
  }

  @Get('rated')
  @ApiOperation({ summary: 'Get rated recipes for prompt context' })
  @ApiQuery({ name: 'userId', type: Number })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getRatedRecipes(
    @Query('userId') userId: number,
    @Query('limit') limit?: number,
  ) {
    return this.recipeService.getRatedRecipes(
      Number(userId),
      limit ? Number(limit) : 10,
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

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a recipe' })
  @ApiResponse({ status: 200, description: 'Recipe deleted', type: RecipeResponseDto })
  async delete(@Param('id') id: string) {
    return this.recipeService.delete(Number(id));
  }
}
