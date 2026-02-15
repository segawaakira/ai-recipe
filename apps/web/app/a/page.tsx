"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card";
import { Badge } from "@repo/ui/components/badge";
import { Separator } from "@repo/ui/components/separator";
import { Trash2, Plus, ChefHat, Loader2 } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@repo/ui/components/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { Label } from "@repo/ui/components/label";
import { User, LogOut, Settings, BookOpen, Heart } from "lucide-react";
import { Camera, Type } from "lucide-react";
import { ImageUploadArea } from "components/image-upload-area";

export default function RecipeApp() {
  const [ingredients, setIngredients] = useState<string[]>([
    "鶏肉",
    "玉ねぎ",
    "人参",
    "じゃがいも",
    "醤油",
    "みりん",
  ]);
  const [newIngredient, setNewIngredient] = useState("");
  const [recipe, setRecipe] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // デモ用にtrueに設定
  const [user, setUser] = useState({
    name: "田中太郎",
    email: "tanaka@example.com",
    avatar: "",
  });
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const addIngredient = () => {
    if (newIngredient.trim() && !ingredients.includes(newIngredient.trim())) {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const generateRecipe = async () => {
    if (ingredients.length === 0) return;

    setIsGenerating(true);
    setRecipe("");

    //     try {
    //       const { text } = await generateText({
    //         model: openai("gpt-4o"),
    //         prompt: `以下の食材を使って、美味しいレシピを1つ提案してください。レシピには料理名、材料、作り方を含めてください。

    // 利用可能な食材: ${ingredients.join("、")}

    // レシピは日本語で、分かりやすく詳細に説明してください。`,
    //       })

    //       setRecipe(text)
    //     } catch (error) {
    //       setRecipe("レシピの生成中にエラーが発生しました。もう一度お試しください。")
    //     } finally {
    //       setIsGenerating(false)
    //     }
  };

  const saveRecipe = () => {
    if (recipe && !savedRecipes.includes(recipe)) {
      setSavedRecipes([...savedRecipes, recipe]);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser({ name: "", email: "", avatar: "" });
    setSavedRecipes([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addIngredient();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ChefHat className="h-8 w-8 text-orange-600" />
            <h1 className="text-xl font-bold text-gray-900">
              AIレシピ提案アプリ
            </h1>
          </div>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-3"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="h-4 w-4 mr-2" />
                  プロフィール
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <BookOpen className="h-4 w-4 mr-2" />
                  保存したレシピ ({savedRecipes.length})
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  設定
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-600"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  ログアウト
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
              <DialogTrigger asChild>
                <Button>ログイン</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>アカウント</DialogTitle>
                  <DialogDescription>
                    ログインまたは新規登録してレシピを保存しましょう
                  </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="login">ログイン</TabsTrigger>
                    <TabsTrigger value="register">新規登録</TabsTrigger>
                  </TabsList>
                  <TabsContent value="login" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">メールアドレス</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">パスワード</Label>
                      <Input id="password" type="password" />
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setIsLoggedIn(true);
                        setShowAuthDialog(false);
                      }}
                    >
                      ログイン
                    </Button>
                  </TabsContent>
                  <TabsContent value="register" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">お名前</Label>
                      <Input id="name" placeholder="田中太郎" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email-register">メールアドレス</Label>
                      <Input
                        id="email-register"
                        type="email"
                        placeholder="your@example.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-register">パスワード</Label>
                      <Input id="password-register" type="password" />
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setIsLoggedIn(true);
                        setShowAuthDialog(false);
                      }}
                    >
                      新規登録
                    </Button>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </header>

      <div className="p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {!isLoggedIn && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <User className="h-12 w-12 mx-auto text-blue-600" />
                  <h3 className="font-semibold text-blue-900">
                    ログインしてレシピを保存
                  </h3>
                  <p className="text-blue-700 text-sm">
                    アカウントを作成すると、お気に入りのレシピを保存できます
                  </p>
                  <Button
                    onClick={() => setShowAuthDialog(true)}
                    className="mt-4"
                  >
                    ログイン・新規登録
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="max-w-4xl mx-auto space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-2">
                <ChefHat className="h-8 w-8 text-orange-600" />
                AIレシピ提案アプリ
              </h1>
              <p className="text-gray-600">
                所有している食材からAIがおすすめレシピを提案します
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* 食材管理セクション */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    食材管理
                  </CardTitle>
                  <CardDescription>
                    テキスト入力または画像から食材を追加できます
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 食材追加方法の切り替え */}
                  <Tabs defaultValue="text" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="text"
                        className="flex items-center gap-2"
                      >
                        <Type className="h-4 w-4" />
                        テキスト入力
                      </TabsTrigger>
                      <TabsTrigger
                        value="image"
                        className="flex items-center gap-2"
                      >
                        <Camera className="h-4 w-4" />
                        画像から追加
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="text" className="space-y-4">
                      {/* 既存のテキスト入力 */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="食材名を入力..."
                          value={newIngredient}
                          onChange={(e) => setNewIngredient(e.target.value)}
                          onKeyPress={handleKeyPress}
                          className="flex-1"
                        />
                        <Button
                          onClick={addIngredient}
                          disabled={!newIngredient.trim()}
                        >
                          追加
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="image" className="space-y-4">
                      <ImageUploadArea onIngredientsRecognized={(newIngredients) => {
                        const unique = newIngredients.filter(i => !ingredients.includes(i));
                        setIngredients([...ingredients, ...unique]);
                      }} />
                    </TabsContent>
                  </Tabs>

                  {/* 食材一覧は既存のまま */}
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-gray-700">
                      所有食材 ({ingredients.length}個)
                    </h3>
                    {ingredients.length === 0 ? (
                      <p className="text-gray-500 text-sm py-4 text-center">
                        食材を追加してください
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {ingredients.map((ingredient, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1"
                          >
                            {ingredient}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-4 w-4 p-0 hover:bg-red-100"
                              onClick={() => removeIngredient(index)}
                            >
                              <Trash2 className="h-3 w-3 text-red-500" />
                            </Button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* レシピ生成ボタンは既存のまま */}
                  <Button
                    onClick={generateRecipe}
                    disabled={ingredients.length === 0 || isGenerating}
                    className="w-full bg-orange-600 hover:bg-orange-700"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        レシピを生成中...
                      </>
                    ) : (
                      <>
                        <ChefHat className="h-4 w-4 mr-2" />
                        AIレシピを作成
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* レシピ表示セクション */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="h-5 w-5" />
                    おすすめレシピ
                  </CardTitle>
                  <CardDescription>
                    AIが提案するレシピが表示されます
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recipe ? (
                    <div className="prose prose-sm max-w-none">
                      <div className="bg-white p-4 rounded-lg border whitespace-pre-wrap">
                        {recipe}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <ChefHat className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>「AIレシピを作成」ボタンを押して</p>
                      <p>おすすめレシピを生成してください</p>
                    </div>
                  )}
                  {recipe && isLoggedIn && (
                    <div className="mt-4 pt-4 border-t">
                      <Button
                        onClick={saveRecipe}
                        variant="outline"
                        className="w-full bg-transparent"
                        disabled={savedRecipes.includes(recipe)}
                      >
                        <Heart
                          className={`h-4 w-4 mr-2 ${savedRecipes.includes(recipe) ? "fill-red-500 text-red-500" : ""}`}
                        />
                        {savedRecipes.includes(recipe)
                          ? "保存済み"
                          : "レシピを保存"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
