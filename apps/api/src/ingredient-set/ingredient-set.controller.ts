import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { IngredientsService } from './ingredient-set.service';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { IngredientSetResponseDto } from './dto/ingredient-set-response.dto';

@ApiTags('ingredient-sets')
@Controller('ingredient-sets')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  // 材料セット作成
  @Post()
  @ApiOperation({ summary: 'Create a new ingredient set' })
  @ApiResponse({ status: 201, description: 'Ingredient set created', type: IngredientSetResponseDto })
  async createIngredientSet(@Body() dto: CreateIngredientDto) {
    return this.ingredientsService.createIngredientSet(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an ingredient set' })
  @ApiResponse({ status: 200, description: 'Ingredient set updated', type: IngredientSetResponseDto })
  async updateIngredientSet(
    @Param('id') id: string,
    @Body() dto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.updateIngredientSet(Number(id), dto);
  }

  // ユーザーIDで材料セットを取得（履歴）
  @Get()
  @ApiOperation({ summary: 'Get ingredient sets by user ID' })
  @ApiQuery({ name: 'userId', type: Number })
  @ApiResponse({ status: 200, description: 'List of ingredient sets', type: [IngredientSetResponseDto] })
  async getUserIngredientSets(@Query('userId') userId: number) {
    return this.ingredientsService.getUserIngredientSets(Number(userId));
  }
}
