# AI Recipe

AI を活用したレシピ提案アプリ。

## プロジェクト構成

```
ai-recipe/
├── apps/
│   ├── api/          # バックエンド (NestJS)
│   ├── web/          # Web フロントエンド (Next.js)
│   └── mobile/       # モバイル (Expo / React Native)
├── packages/
│   ├── api-types/    # OpenAPI 生成型 (paths, operations)
│   ├── api-schema/   # 共有バリデーションスキーマ (Zod)
│   ├── ui/           # 共有 UI コンポーネント
│   ├── typescript-config/
│   └── eslint-config/
└── package.json
```

## API 型共有の仕組み

API のレスポンス型は NestJS の DTO デコレーターから自動生成され、Web・Mobile の両方で型安全に利用できます。

```
NestJS DTO (@ApiResponse, @ApiProperty)
  ↓  pnpm --filter api generate:openapi
apps/api/openapi.json
  ↓  pnpm --filter @repo/api-types generate (openapi-typescript)
packages/api-types/src/api.d.ts   ← paths, operations の型定義
  ↓  workspace 参照 (@repo/api-types)
apps/web  &  apps/mobile          ← createClient<paths>() で型推論
```

**API の DTO やエンドポイントを変更した場合**は、モノレポルートで以下を実行してください：

```bash
pnpm generate:api
```

これにより openapi.json の再生成 → TypeScript 型の再生成が一括で行われ、フロントエンド側の型が最新になります。

## 利用している外部サービス

| サービス | 用途 |
|---|---|
| [Google Gemini API](https://ai.google.dev/) | レシピ生成・食材画像認識・食材バリデーション (gemini-2.0-flash) |
| [YouTube Data API v3](https://developers.google.com/youtube/v3) | 生成したレシピに関連する調理動画の検索 |
| Gmail SMTP | メールアドレス確認・パスワードリセット等の通知メール送信 |
| [PostgreSQL](https://www.postgresql.org/) | ユーザー・レシピ履歴・食材セットのデータ永続化 (ローカルは Docker、本番は Render) |
| [Vercel](https://vercel.com/) | Web フロントエンド (Next.js) のホスティング |
| [Render](https://render.com/) | バックエンド API (NestJS) と PostgreSQL のホスティング |
| [Expo Application Services (EAS)](https://expo.dev/eas) | モバイルアプリのビルド・配信 |
| [GitHub Actions](https://github.com/features/actions) | CI (テスト・ビルドの自動実行) |

### ローカル環境セットアップ

1. 環境変数の設定

   ```bash
   cd apps/api
   cp .env.example .env
   ```

   ```bash
   cd apps/web
   cp .env.example .env
   ```

    ※コピーした後の.envにapiKeyや、認証情報は任意のものを入れる。

2. パッケージインストール

   ```bash
   pnpm install
   ```

3. Dockerセットアップ

   ```bash
   docker-compose up
   ```

4. Prisma client生成

   ```bash
   cd apps/api
   pnpm prisma generate
   ```

5. Database migration実行

   ```bash
   cd apps/api
   pnpm prisma migrate dev --name init
   ```

6. 起動
   ```bash
   pnpm dev
   ```
