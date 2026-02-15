-- DropForeignKey
ALTER TABLE "IngredientSet" DROP CONSTRAINT "IngredientSet_userId_fkey";

-- AddForeignKey
ALTER TABLE "IngredientSet" ADD CONSTRAINT "IngredientSet_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
