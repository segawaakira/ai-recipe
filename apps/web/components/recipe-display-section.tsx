"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { ChefHat, CookingPot } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { RecipeMeta } from "components/recipe-meta";
import { StarRating } from "components/star-rating";
import { YouTubeVideos } from "components/youtube-videos";

interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

interface RecipeDisplaySectionProps {
  recipe: string;
  recipeName: string;
  youtubeVideos: YouTubeVideo[];
  savedRecipeId: number | null;
  recipeRating: number | null;
  recipeIngredients: string[];
  recipeGenre: string;
  onRate: (rating: number) => Promise<void>;
}

export function RecipeDisplaySection({
  recipe,
  recipeName,
  youtubeVideos,
  savedRecipeId,
  recipeRating,
  recipeIngredients,
  recipeGenre,
  onRate,
}: RecipeDisplaySectionProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CookingPot className="h-5 w-5" />
          おすすめレシピ
        </CardTitle>
        <CardDescription>
          AIが提案するレシピが表示されます
        </CardDescription>
        {recipeName && (
          <>
          <p className="text-lg font-semibold mt-1">{recipeName}</p>
            <RecipeMeta
              ingredients={recipeIngredients}
              genre={recipeGenre}
            />
            </>
        )}
      </CardHeader>
      <CardContent>
        {recipe ? (
          <div className="space-y-4">
            <div className="markdown-content">
              <ReactMarkdown>{recipe}</ReactMarkdown>
            </div>
            {savedRecipeId && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    このレシピはいかがですか？
                  </span>
                  <StarRating rating={recipeRating} onRate={onRate} />
                </div>
                {recipeRating && (
                  <p className="text-xs text-gray-400 text-right">
                    次回のレシピ提案に反映されます
                  </p>
                )}
              </>
            )}
            {recipeName && (
              <YouTubeVideos
                videos={youtubeVideos}
                recipeName={recipeName}
              />
            )}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>「AIレシピを作成」ボタンを押して</p>
            <p>おすすめレシピを生成してください</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
