"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Separator } from "@repo/ui/components/separator";
import { UtensilsCrossed } from "lucide-react";
import ReactMarkdown from "react-markdown";

import { LoadingAnimation } from "components/loading-animation";
import { RecipeFollowUp } from "components/recipe-follow-up";
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
  isGenerating: boolean;
  onRate: (rating: number) => Promise<void>;
  isFollowUpLoading: boolean;
  onSendFollowUp: (message: string) => void;
}

export function RecipeDisplaySection({
  recipe,
  recipeName,
  youtubeVideos,
  savedRecipeId,
  recipeRating,
  recipeIngredients,
  recipeGenre,
  isGenerating,
  onRate,
  isFollowUpLoading,
  onSendFollowUp,
}: RecipeDisplaySectionProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UtensilsCrossed className="h-5 w-5" />
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
        {recipe && !isFollowUpLoading ? (
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
            {recipeName && !isGenerating && (
              <RecipeFollowUp
                isLoading={isFollowUpLoading}
                onSend={onSendFollowUp}
              />
            )}
            {recipeName && (
              <YouTubeVideos
                videos={youtubeVideos}
                recipeName={recipeName}
              />
            )}
          </div>
        ) : isGenerating || isFollowUpLoading ? (
          <div className="flex flex-col items-center py-12 text-gray-500">
            <LoadingAnimation />
            <p className="mt-8 text-sm">{isFollowUpLoading ? "レシピをアレンジ中..." : "レシピを生成中..."}</p>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <img src="/logo.svg" alt="logo" className="h-12 w-12 mx-auto mb-4 grayscale opacity-30" />
            <p>「AIレシピを作成」ボタンを押して<br />
            おすすめレシピを生成してください</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
