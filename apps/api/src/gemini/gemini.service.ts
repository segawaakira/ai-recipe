import { Injectable } from '@nestjs/common';

@Injectable()
export class GeminiService {
  private get apiKey(): string {
    return process.env.GEMINI_API_KEY || '';
  }

  async generateRecipe(
    preferredIngredients: string[],
    allIngredients: string[],
    servings: number,
    ratedRecipes?: { name: string; rating: number }[],
    genre?: string,
  ): Promise<{ recipe: string; recipeName: string }> {
    const otherIngredients = allIngredients.filter(
      (i) => !preferredIngredients.includes(i),
    );

    const preferenceSection = this.buildPreferenceSection(ratedRecipes);

    const genreSection = genre ? `\n【ジャンル】${genre}\n` : '';

    const prompt = `以下の条件で、日本語で家庭向けの料理を1つ提案してください。
${preferenceSection}${genreSection}
【人数】${servings}人分

【特に使いたい食材】（必ずこれらを中心に使ってください）
${preferredIngredients.join(', ')}
${
  otherIngredients.length > 0
    ? `\n【その他持っている食材】（相性が良ければ補完的に使ってください）\n${otherIngredients.join(', ')}`
    : ''
}

ルール:
- ${servings}人分の分量で材料を記載してください
- 「特に使いたい食材」をなるべく全て使うレシピにしてください
- 足りない食材があっても「その他持っている食材」から相性の良いものを選んで補完してください
- 持っていない食材は基本的に使わないでください（調味料は除く）
${genre ? `- 「${genre}」のジャンルに合った料理を提案してください` : ''}
${ratedRecipes && ratedRecipes.length > 0 ? '- ユーザーの好みを考慮し、同じレシピは提案しないでください\n' : ''}
必ず以下の形式で出力してください：
# 料理名
## 材料（${servings}人分）
## 手順
## 所要時間
## ポイント

1行目は必ず「# 料理名」の形式にしてください。`;

    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    const data = await res.json();
    const result =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'レシピを生成できませんでした';

    const titleMatch = result.match(/^#\s+(.+)$/m);
    const recipeName = titleMatch ? titleMatch[1].trim() : '';

    return { recipe: result, recipeName };
  }

  async recognizeIngredients(
    image: string,
  ): Promise<{ ingredients: string[] }> {
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const mimeType =
      image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg';

    const prompt = `この画像に写っている食材をすべて識別してください。
食材名のみをJSON配列で返してください。食材以外のもの（皿、テーブル、調理器具等）は含めないでください。
必ずJSON配列のみを返してください。説明文は不要です。
例: ["トマト", "玉ねぎ", "鶏もも肉"]`;

    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                { inline_data: { mime_type: mimeType, data: base64Data } },
              ],
            },
          ],
        }),
      },
    );

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

    const jsonMatch = text.match(/\[[\s\S]*?\]/);
    const ingredients: string[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

    return { ingredients };
  }

  async validateIngredients(
    newIngredients: string[],
    existingIngredients: string[],
  ): Promise<{
    results: {
      name: string;
      isFood: boolean;
      similarTo: string | null;
    }[];
  }> {
    const prompt = `あなたは食材バリデーターです。以下の「追加しようとしている食材」について、2つの観点で判定してください。

1. **食材かどうか**: その名前が食べ物・食材として妥当かどうか（調味料も食材に含む）
2. **既存食材との類似**: 「既存の食材リスト」に類似・重複する食材があるか（例: 「トマト」と「ミニトマト」、「玉ねぎ」と「たまねぎ」）

【追加しようとしている食材】
${JSON.stringify(newIngredients)}

【既存の食材リスト】
${JSON.stringify(existingIngredients)}

必ず以下のJSON形式のみで返してください。説明文は不要です。
{
  "results": [
    { "name": "食材名", "isFood": true/false, "similarTo": "類似する既存食材名またはnull" }
  ]
}

全ての追加食材について結果を返してください。similarToは既存食材リストの中から最も類似するものがある場合のみ設定し、なければnullにしてください。`;

    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': this.apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      },
    );

    const data = await res.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || '{"results":[]}';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { results: [] };

    return { results: parsed.results };
  }

  private buildPreferenceSection(
    ratedRecipes?: { name: string; rating: number }[],
  ): string {
    if (!ratedRecipes || ratedRecipes.length === 0) return '';

    const liked = ratedRecipes.filter((r) => r.rating >= 4);
    const disliked = ratedRecipes.filter((r) => r.rating <= 2);

    if (liked.length === 0 && disliked.length === 0) return '';

    let section = '\n【ユーザーの好み】\n';
    if (liked.length > 0) {
      section += `好評: ${liked.map((r) => r.name).join('、')}\n`;
    }
    if (disliked.length > 0) {
      section += `不評: ${disliked.map((r) => r.name).join('、')}\n`;
    }
    return section;
  }
}
