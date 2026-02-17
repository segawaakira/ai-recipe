import { Badge } from "@repo/ui/components/badge";

interface RecipeMetaProps {
  ingredients: string[];
  genre?: string | null;
}

export function RecipeMeta({ ingredients, genre }: RecipeMetaProps) {
  return (
    <div className="space-y-2 mt-4">
      <div className="flex items-start justify-start">
        <p className="text-xs text-gray-500 mb-1 w-28 pt-1">使いたい食材</p>
        <div className="flex flex-wrap gap-1">
          {ingredients.map((ing, i) => (
            <Badge key={i} variant="secondary" className="text-xs">
              {ing}
            </Badge>
          ))}
        </div>
      </div>
      {genre && (
        <div className="flex items-start justify-start">
          <p className="text-xs text-gray-500 mb-1 w-28 pt-1">ジャンル</p>
          <Badge variant="secondary" className="text-xs">
            {genre}
          </Badge>
        </div>
      )}
    </div>
  );
}
