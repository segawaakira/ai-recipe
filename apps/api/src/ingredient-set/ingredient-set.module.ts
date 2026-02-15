import { Module } from '@nestjs/common';
import { IngredientsService } from './ingredient-set.service';
import { IngredientsController } from './ingredient-set.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [IngredientsService],
  controllers: [IngredientsController],
  exports: [IngredientsService],
})
export class IngredientsModule {}
