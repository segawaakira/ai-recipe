# apps/api

AI Recipe アプリのバックエンド API。NestJS で構築。

## 技術スタック

- **NestJS** (Express)
- **TypeScript**
- **Prisma** (PostgreSQL)
- **Passport + JWT** (認証)
- **@nestjs/swagger** (OpenAPI ドキュメント生成)
- **class-validator / class-transformer** (バリデーション)
- **nodemailer** (メール送信)
- **Jest** (テスト)

## ディレクトリ構成

```
apps/api/
├── src/
│   ├── main.ts                   # エントリーポイント (Express, Swagger, セキュリティ設定)
│   ├── app.module.ts             # ルートモジュール (全モジュールの集約)
│   ├── app.controller.ts         # ルートコントローラー (ヘルスチェック)
│   ├── app.service.ts            # ルートサービス
│   ├── generate-openapi.ts       # OpenAPI スキーマ生成スクリプト
│   │
│   ├── auth/                     # 認証モジュール
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── jwt.strategy.ts           # Passport JWT ストラテジー
│   │   ├── jwt-auth.guard.ts         # JWT 認証ガード (@Public 対応)
│   │   ├── current-user.decorator.ts # @CurrentUser() デコレーター
│   │   ├── public.decorator.ts       # @Public() デコレーター
│   │   └── dto/
│   │
│   ├── users/                    # ユーザーモジュール
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │
│   ├── recipe/                   # レシピモジュール
│   │   ├── recipe.module.ts
│   │   ├── recipe.controller.ts
│   │   ├── recipe.service.ts
│   │   └── dto/
│   │
│   ├── ingredient-set/           # 食材セットモジュール
│   │   ├── ingredient-set.module.ts
│   │   ├── ingredient-set.controller.ts
│   │   ├── ingredient-set.service.ts
│   │   └── dto/
│   │
│   ├── gemini/                   # Gemini AI 連携モジュール
│   │   ├── gemini.module.ts
│   │   ├── gemini.controller.ts
│   │   ├── gemini.service.ts
│   │   └── dto/
│   │
│   ├── youtube/                  # YouTube 連携モジュール
│   │   ├── youtube.module.ts
│   │   ├── youtube.controller.ts
│   │   └── youtube.service.ts
│   │
│   ├── email/                    # メールモジュール (@Global)
│   │   ├── email.module.ts
│   │   ├── email.service.ts
│   │   ├── email-verification.service.ts
│   │   ├── password-reset.service.ts
│   │   └── email-change.service.ts
│   │
│   └── prisma/                   # データベースモジュール (@Global)
│       ├── prisma.module.ts
│       └── prisma.service.ts
│
├── prisma/
│   └── schema.prisma             # Prisma スキーマ定義
├── test/                         # E2E テスト
├── openapi.json                  # 生成済み OpenAPI スキーマ
├── nest-cli.json                 # NestJS CLI 設定
└── package.json
```

## ディレクトリルール

### 機能モジュール単位の構成

`src/` 配下は **NestJS のモジュール単位** でディレクトリを分割する。1 つの機能 = 1 つのディレクトリ。

```
src/<feature>/
├── <feature>.module.ts
├── <feature>.controller.ts
├── <feature>.service.ts
└── dto/
    ├── create-<feature>.dto.ts
    ├── <feature>-response.dto.ts
    └── ...
```

### 各ファイルの責務

#### `*.module.ts` — モジュール

機能単位の依存関係を定義する。NestJS の DI コンテナにおけるスコープの境界。

```typescript
@Module({
  imports: [],       // 依存する他モジュール
  controllers: [],   // このモジュールのコントローラー
  providers: [],     // このモジュールのサービス
  exports: [],       // 他モジュールに公開するサービス
})
```

- 各モジュールは `app.module.ts` の `imports` に登録する
- `@Global()` を付与すると、他モジュールから `imports` なしで利用可能になる (`PrismaModule`, `EmailModule`)

#### `*.controller.ts` — コントローラー

HTTP リクエストの受け口。ルーティングとリクエスト/レスポンスの変換を担当する。**ビジネスロジックは書かない**。

```typescript
@ApiTags('recipes')              // Swagger グループ名
@ApiBearerAuth()                 // 認証必須の表示
@Controller('recipes')           // ルートパス
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post()
  @ApiOperation({ summary: '...' })
  @ApiResponse({ status: 201, type: RecipeResponseDto })
  async create(
    @CurrentUser() user: { userId: number; email: string },
    @Body() dto: CreateRecipeDto,
  ) {
    return this.recipeService.create({ ...dto, userId: user.userId });
  }
}
```

- HTTP メソッドデコレーター (`@Get`, `@Post`, `@Patch`, `@Delete`) でルーティング
- パラメーターデコレーター (`@Body`, `@Param`, `@Query`, `@CurrentUser`) でリクエストデータを取得
- Swagger デコレーター (`@ApiTags`, `@ApiOperation`, `@ApiResponse`) で API ドキュメントを生成
- サービスに処理を委譲し、結果をそのまま返す

#### `*.service.ts` — サービス

ビジネスロジックとデータアクセスを担当する。コントローラーから呼び出される。

```typescript
@Injectable()
export class RecipeService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRecipeDto & { userId: number }) {
    return this.prisma.prisma.recipe.create({ data: { ... } });
  }
}
```

- `@Injectable()` で DI コンテナに登録
- Prisma を介した DB 操作、外部 API 呼び出し、データ加工などを行う
- HTTP の概念 (リクエスト, レスポンスコード等) には依存しない

#### `dto/*.dto.ts` — DTO (Data Transfer Object)

リクエスト/レスポンスのデータ構造を定義する。バリデーションと Swagger ドキュメントの両方を担う。

```typescript
// リクエスト DTO — バリデーション付き
export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password1', minLength: 8 })
  @Matches(/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/)
  password: string;
}

// レスポンス DTO — 型定義 + Swagger ドキュメント
export class RecipeResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;
}
```

- `@ApiProperty()` で Swagger スキーマを定義 → OpenAPI 型生成に使用される
- `class-validator` のデコレーター (`@IsEmail`, `@Matches`, `@IsInt` 等) でバリデーション
- リクエスト用とレスポンス用を分けて定義する

### 認証関連ファイルの責務

| ファイル | 責務 |
|---|---|
| `jwt.strategy.ts` | JWT トークンの検証ロジック。Bearer トークンからペイロードを抽出し `{ userId, email }` を返す |
| `jwt-auth.guard.ts` | 全ルートに適用されるガード。`@Public()` が付いたルートは認証をスキップする |
| `public.decorator.ts` | `@Public()` デコレーター。認証不要なルートに付与する |
| `current-user.decorator.ts` | `@CurrentUser()` デコレーター。コントローラーで認証済みユーザー情報を取得する |

### グローバルモジュール

`@Global()` を付与したモジュールは、他のモジュールで `imports` せずに利用できる。

| モジュール | 役割 |
|---|---|
| `PrismaModule` | DB アクセス。全サービスが `PrismaService` を注入可能 |
| `EmailModule` | メール送信。認証メール、パスワードリセット、メールアドレス変更の各サービスを提供 |

## 認証フロー

```
1. POST /auth/login (email, password)
2. → bcrypt でパスワード照合
3. → JWT トークン発行 (payload: { sub: userId, email })
4. → クライアントが Bearer トークンとしてリクエストに付与
5. → JwtAuthGuard が全ルートで検証 (@Public 以外)
6. → JwtStrategy が payload を { userId, email } に変換
7. → @CurrentUser() でコントローラーから取得可能
```

## API エンドポイント一覧

Swagger UI を参照: `http://localhost:3001/api-docs` (Basic 認証)

## 開発

```bash
# 開発サーバー起動
pnpm dev

# DB マイグレーション
pnpm db:migrate

# DB スキーマ反映 (開発用)
pnpm db:push

# Prisma Client 生成
pnpm db:generate

# OpenAPI スキーマ生成 (DTO 変更後に実行)
pnpm generate:openapi

# テスト
pnpm test
pnpm test:e2e
```

## 新しいモジュールを追加するとき

1. `src/<feature>/` ディレクトリを作成
2. `<feature>.module.ts`, `<feature>.controller.ts`, `<feature>.service.ts` を作成
3. `dto/` に必要な DTO を作成 (`@ApiProperty()` を付与)
4. `app.module.ts` の `imports` に追加
5. `pnpm generate:openapi` で OpenAPI スキーマを再生成
6. モノレポルートで `pnpm generate:api` を実行し、フロントエンド用の型を更新
