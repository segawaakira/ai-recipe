# レシピフィードバック機能 設計書

## 1. 概要

### 目的

ユーザーがAI生成レシピに対して「いいね / いまいち」の評価を行い、その評価履歴をもとに次回以降のレシピ提案を最適化する。

### 採用アプローチ

**プロンプトエンジニアリング方式**を採用する。

過去の評価済みレシピをGemini APIへのプロンプトに含め、ユーザーの好みを反映したレシピを生成する。

**選定理由:**

- 追加インフラ不要（ベクトルDB等が不要）
- 現在のアーキテクチャ（NestJS + Prisma + Gemini API）との親和性が高い
- 実装コストが最も低い
- Geminiの自然言語理解力を活用できる

**トレードオフ:**

- プロンプトが長くなるためトークンコストが増加する
- 評価数が増えると全件をプロンプトに含められなくなる（直近N件に制限する必要あり）

---

## 2. データベース設計

### 新規テーブル: `Recipe`

```prisma
// packages/database/prisma/schema.prisma

model Recipe {
  id          Int      @id @default(autoincrement())
  title       String   // レシピ名（Geminiに構造化出力させて抽出）
  content     String   // Geminiが生成したレシピ全文
  ingredients String[] // 生成時に使用した材料リスト
  rating      Int?     // null=未評価, 1=いまいち, 2=良い
  userId      Int
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Userモデルへのリレーション追加

```prisma
model User {
  id             Int             @id @default(autoincrement())
  email          String          @unique
  password       String
  ingredientSets IngredientSet[]
  recipes        Recipe[]        // 追加
}
```

### 補足

- `rating` は nullable にし、生成直後は未評価（null）とする
- `title` はGeminiの応答からパースして格納する（プロンプト改善のコンテキストとして使用）
- `ingredients` を保存することで「この材料の組み合わせで過去に何を作ったか」の分析が可能

---

## 3. API設計

### 3.1 NestJS バックエンド（apps/api）

既存の ingredient-set モジュールと同様のパターンで `recipes` モジュールを新設する。

#### モジュール構成

```
apps/api/src/recipes/
├── recipes.module.ts
├── recipes.controller.ts
├── recipes.service.ts
└── dto/
    ├── create-recipe.dto.ts
    └── update-recipe-rating.dto.ts
```

#### エンドポイント

| メソッド | パス | 用途 | リクエスト | レスポンス |
|---------|------|------|-----------|-----------|
| `POST` | `/recipes` | レシピ保存 | `CreateRecipeDto` | `Recipe` |
| `GET` | `/recipes?userId={id}` | ユーザーのレシピ一覧取得 | query: userId | `Recipe[]` |
| `PATCH` | `/recipes/:id/rating` | 評価を更新 | `UpdateRecipeRatingDto` | `Recipe` |
| `GET` | `/recipes/rated?userId={id}` | 評価済みレシピ取得（プロンプト用） | query: userId, rating | `Recipe[]` |

#### DTO定義

```typescript
// create-recipe.dto.ts
export class CreateRecipeDto {
  userId: number;
  title: string;
  content: string;
  ingredients: string[];
}

// update-recipe-rating.dto.ts
export class UpdateRecipeRatingDto {
  rating: number; // 1=いまいち, 2=良い
}
```

#### Service実装方針

```typescript
// recipes.service.ts
@Injectable()
export class RecipesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRecipeDto) {
    return this.prisma.prisma.recipe.create({
      data: {
        title: dto.title,
        content: dto.content,
        ingredients: dto.ingredients,
        user: { connect: { id: dto.userId } },
      },
    });
  }

  async updateRating(id: number, rating: number) {
    return this.prisma.prisma.recipe.update({
      where: { id },
      data: { rating },
    });
  }

  async getUserRecipes(userId: number) {
    return this.prisma.prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // プロンプト生成用: 直近の評価済みレシピを取得
  async getRatedRecipes(userId: number, limit: number = 10) {
    return this.prisma.prisma.recipe.findMany({
      where: {
        userId,
        rating: { not: null },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: {
        title: true,
        rating: true,
        ingredients: true,
      },
    });
  }
}
```

### 3.2 Next.js API Route（apps/web）

#### Gemini API Route の改修

`apps/web/app/api/gemini/route.ts` を改修し、過去の評価データを受け取ってプロンプトに反映する。

```typescript
// 変更後のリクエスト型
interface GenerateRecipeRequest {
  ingredients: string[];
  ratedRecipes?: {
    title: string;
    rating: number;
    ingredients: string[];
  }[];
}
```

---

## 4. プロンプト設計

### 改修後のプロンプトテンプレート

```
あなたはプロの料理アドバイザーです。ユーザーの好みを考慮して、家庭向けの料理を1つ提案してください。

${好みセクション（評価履歴がある場合のみ）}

【材料】
${ingredients.join(", ")}

【出力形式】
以下の形式でレシピを出力してください：
# レシピ名
## 材料（分量付き）
## 手順
## 所要時間
## ポイント
```

### 好みセクションの生成ロジック

```typescript
function buildPreferenceSection(ratedRecipes: RatedRecipe[]): string {
  const liked = ratedRecipes.filter(r => r.rating === 2);
  const disliked = ratedRecipes.filter(r => r.rating === 1);

  if (liked.length === 0 && disliked.length === 0) return '';

  let section = '【ユーザーの好み】\n';

  if (liked.length > 0) {
    section += '気に入ったレシピ:\n';
    section += liked.map(r => `- ${r.title}`).join('\n');
    section += '\n';
  }

  if (disliked.length > 0) {
    section += 'いまいちだったレシピ:\n';
    section += disliked.map(r => `- ${r.title}`).join('\n');
    section += '\n';
  }

  section += '\nこの傾向を踏まえて、新しいレシピを提案してください。同じレシピは提案しないでください。\n';

  return section;
}
```

### プロンプト長の制限

- 評価済みレシピは **直近10件** までをプロンプトに含める
- タイトルのみを含めることでトークン数を抑える（全文は含めない）
- 将来的に評価数が増えた場合は、カテゴリ/タグによる要約に切り替える

---

## 5. フロントエンド設計

### 5.1 UI変更箇所

#### レシピ表示カード内に評価ボタンを追加

レシピ生成後、カードの下部に以下のUIを表示する：

```
┌─────────────────────────────┐
│  おすすめレシピ              │
│                             │
│  # 鶏肉の照り焼き           │
│  ## 材料...                 │
│  ## 手順...                 │
│                             │
│  ─────────────────────────  │
│  このレシピはいかがですか？   │
│  [👍 いいね]  [👎 いまいち]  │
│                             │
│  評価済み: いいね ✓          │
└─────────────────────────────┘
```

#### 評価の状態管理

```typescript
// 追加するstate
const [currentRecipeId, setCurrentRecipeId] = useState<number | null>(null);
const [currentRating, setCurrentRating] = useState<number | null>(null);
```

### 5.2 レシピ生成フロー（改修後）

```
1. ユーザーが「AIレシピを作成」をクリック
2. フロントエンドが GET /recipes/rated?userId=X で評価履歴を取得
3. POST /api/gemini に ingredients + ratedRecipes を送信
4. Geminiがレシピを生成
5. フロントエンドにレシピを表示
6. 同時に POST /recipes でレシピをDBに保存（rating=null）
7. ユーザーが評価ボタンを押す
8. PATCH /recipes/:id/rating で評価を保存
```

### 5.3 シーケンス図

```
User        Frontend         Next.js API      NestJS API       Gemini      DB
 |              |                |                |               |          |
 |--[生成]----->|                |                |               |          |
 |              |--GET /recipes/rated------------>|               |          |
 |              |<--評価済みレシピ一覧-------------|               |          |
 |              |                |                |               |          |
 |              |--POST /api/gemini-------------->|               |          |
 |              |   (ingredients + ratedRecipes)  |               |          |
 |              |                |--prompt-------->|               |          |
 |              |                |<--recipe--------|               |          |
 |              |<--recipe-------|                |               |          |
 |              |                |                |               |          |
 |<-[表示]------|                |                |               |          |
 |              |--POST /recipes---------------->|-------------->|          |
 |              |<--recipeId---------------------|               |          |
 |              |                |                |               |          |
 |--[評価]----->|                |                |               |          |
 |              |--PATCH /recipes/:id/rating----->|-------------->|          |
 |              |<--updated------|----------------|               |          |
 |<-[評価済み]--|                |                |               |          |
```

---

## 6. 実装ステップ

### Phase 1: DB + API（バックエンド）

1. `packages/database/prisma/schema.prisma` に Recipe モデルを追加
2. マイグレーション実行 (`prisma migrate dev`)
3. `apps/api/src/recipes/` モジュールを新設
   - `recipes.module.ts`
   - `recipes.controller.ts`
   - `recipes.service.ts`
   - `dto/create-recipe.dto.ts`
   - `dto/update-recipe-rating.dto.ts`
4. `app.module.ts` に RecipesModule を追加

### Phase 2: プロンプト改善（Gemini API）

5. `apps/web/app/api/gemini/route.ts` を改修
   - ratedRecipes を受け取れるようにする
   - プロンプトテンプレートを更新
   - レスポンスからタイトルをパースするロジック追加

### Phase 3: フロントエンド

6. `apps/web/app/page.tsx` に評価UIを追加
   - 評価ボタン（いいね / いまいち）
   - 評価済み状態の表示
7. レシピ生成フローを改修
   - 生成前に評価履歴を取得
   - 生成後にレシピをDBに保存
   - 評価ボタン押下時にAPIを呼び出し

### Phase 4: 拡張（将来）

- レシピ履歴ページの追加
- 評価の変更機能
- 評価統計の表示（「和食が好みのようです」等）
- カテゴリ/タグベースの要約（評価数が増えた場合）

---

## 7. 考慮事項

### パフォーマンス

- 評価済みレシピの取得は直近10件に制限し、プロンプトの肥大化を防ぐ
- タイトルのみをプロンプトに含めることでトークン消費を最小化

### データ整合性

- Recipe は User に紐づけ、`onDelete: Cascade` でユーザー削除時に自動削除
- 未ログインユーザーには評価機能を非表示

### UX

- 評価は任意（スキップ可能）
- 評価後にトーストで「好みを記録しました」と通知
- 初回利用時は評価履歴がないため、従来通りの汎用プロンプトで生成
