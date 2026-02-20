import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { IngredientsService } from './ingredient-set.service';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { IngredientSetResponseDto } from './dto/ingredient-set-response.dto';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('ingredient-sets')
@ApiBearerAuth()
@Controller('ingredient-sets')
export class IngredientsController {
  constructor(private readonly ingredientsService: IngredientsService) {}

  // 材料セット作成
  @Post()
  @ApiOperation({ summary: 'Create a new ingredient set' })
  @ApiResponse({ status: 201, description: 'Ingredient set created', type: IngredientSetResponseDto })
  async createIngredientSet(
    @CurrentUser() user: { userId: number; email: string },
    @Body() dto: CreateIngredientDto,
  ) {
    return this.ingredientsService.createIngredientSet({ ...dto, userId: user.userId });
  }

  @Patch()
  @ApiOperation({ summary: 'Update an ingredient set' })
  @ApiResponse({ status: 200, description: 'Ingredient set updated', type: IngredientSetResponseDto })
  async updateIngredientSet(
    @CurrentUser() user: { userId: number; email: string },
    @Body() dto: UpdateIngredientDto,
  ) {
    return this.ingredientsService.updateIngredientSet(user.userId, dto);
  }

  // ユーザーIDで材料セットを取得（履歴）
  @Get()
  @ApiOperation({ summary: 'Get ingredient sets by user ID' })
  @ApiResponse({ status: 200, description: 'List of ingredient sets', type: [IngredientSetResponseDto] })
  async getUserIngredientSets(
    @CurrentUser() user: { userId: number; email: string },
  ) {
    return this.ingredientsService.getUserIngredientSets(user.userId);
  }
}
