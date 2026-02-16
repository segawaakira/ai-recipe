import { Badge } from "@repo/ui/components/badge";

interface RecipeMetaProps {
  ingredients: string[];
  servings: number;
  genre?: string | null;
}

export function RecipeMeta({ ingredients, servings, genre }: RecipeMetaProps) {
  return (
    <div className="flex flex-wrap gap-1">
      {ingredients.map((ing, i) => (
        <Badge key={i} variant="secondary" className="text-xs">
          {ing}
        </Badge>
      ))}
      <span className="text-xs text-gray-500 ml-2 self-center">
        {genre && `${genre} / `}
        {servings}人分
      </span>
    </div>
  );
}
