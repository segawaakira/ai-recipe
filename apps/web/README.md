# apps/web

AI Recipe アプリの Web フロントエンド。Next.js (App Router) で構築。

## 技術スタック

- **Next.js 16** (App Router)
- **React 19** / TypeScript
- **TailwindCSS v4**
- **NextAuth** (認証)
- **openapi-fetch** (型安全な API クライアント / `@repo/api-types`)
- **React Hook Form + Zod** (フォームバリデーション)
- **shadcn/ui + lucide-react** (UI コンポーネント / アイコン)
- **Playwright** (E2E テスト)

## ディレクトリ構成

```
apps/web/
├── app/                  # Next.js App Router (ルーティング)
│   ├── layout.tsx        #   ルートレイアウト (テーマ, フォント, Toaster, AuthGuard)
│   ├── providers.tsx     #   クライアントプロバイダー (SessionProvider)
│   ├── globals.css       #   グローバルスタイル
│   ├── fonts/            #   カスタムフォント (Geist)
│   ├── api/              #   API Routes
│   │   └── auth/[...nextauth]/  # NextAuth ハンドラー
│   ├── auth/             #   認証ページ (公開)
│   │   ├── signin/       #     ログイン
│   │   ├── signup/       #     会員登録
│   │   ├── verify-email/ #     メール認証
│   │   ├── forgot-password/ #  パスワードリセット申請
│   │   └── reset-password/  #  パスワード再設定
│   └── (main)/           #   認証済みページ (AuthGuard で保護)
│       ├── layout.tsx    #     共通レイアウト (Header)
│       ├── page.tsx      #     ホーム (レシピ生成)
│       └── history/      #     履歴
│           ├── page.tsx  #       一覧 (検索, ページネーション, 評価フィルタ)
│           └── [id]/     #       詳細 (レシピ表示, 評価, YouTube, 削除)
├── components/           # React コンポーネント
├── lib/                  # ユーティリティ / ヘルパー
├── types/                # TypeScript 型定義
├── public/               # 静的アセット (SVG ロゴ, favicon)
└── e2e/                  # E2E テスト (Playwright)
```

## ディレクトリルール

### `app/` — ルーティング

Next.js App Router のファイルベースルーティングに従う。

- **ルートグループ**: `auth/` は公開ページ、`(main)/` は認証必須ページ
- **各ルートディレクトリには `page.tsx` のみ配置**する。コンポーネントやロジックは `components/` や `lib/` に分離する
- `layout.tsx` はルートグループ単位で共通 UI (Header 等) を定義する
- API Routes (`app/api/`) は NextAuth 等のサーバーサイド処理専用。ビジネスロジックの API は NestJS バックエンドに配置する

### `components/` — コンポーネント

再利用可能な React コンポーネントを配置する。

- **フラット構成**: サブディレクトリは作らず、1 ファイル = 1 コンポーネントで配置する
- **ファイル名**: kebab-case (`ingredient-section.tsx`)
- **コンポーネント名**: PascalCase (`IngredientSection`)
- **クライアントコンポーネント**: ブラウザ API やフックを使う場合は先頭に `"use client"` を記述する
- **UI ライブラリ**: shadcn/ui ベースのコンポーネントもこのディレクトリに配置する

### `lib/` — ユーティリティ

API クライアントや認証設定など、コンポーネント以外のロジックを配置する。

| ファイル | 役割 |
|---|---|
| `auth.ts` | NextAuth 設定 (CredentialsProvider, JWT コールバック) |
| `auth-api-client.ts` | 認証付き API クライアント (`createAuthClient(token)`) |
| `api-client.ts` | 認証不要な API クライアント (ログイン, 会員登録等) |

- API クライアントは `openapi-fetch` + `@repo/api-types` の型を使用する
- 認証付きリクエストには `createAuthClient` を使い、Bearer トークンを付与する

### `types/` — 型定義

- NextAuth のセッション・JWT 型拡張 (`next-auth.d.ts`) など、グローバルな型定義を配置する
- API レスポンスの型は `@repo/api-types` から自動生成されるため、ここには定義しない

### `public/` — 静的アセット

- SVG ロゴ、favicon 等の静的ファイルを配置する

### `e2e/` — E2E テスト

- Playwright による E2E テストを配置する
- ファイル名: `<対象>.spec.ts`

## 認証フロー

```
ユーザー → NextAuth (CredentialsProvider)
         → POST /auth/login (NestJS API)
         → JWT 取得 → セッションに格納
         → createAuthClient(accessToken) で認証付きリクエスト
```

- `AuthGuard` コンポーネントが未認証ユーザーを `/auth/signin` へリダイレクトする
- 認証済みユーザーが `/auth/signin` にアクセスすると `/(main)` へリダイレクトする

## 開発

```bash
# 開発サーバー起動
pnpm dev

# 型生成 (API スキーマ変更後に実行)
pnpm generate:api

# テスト
pnpm test:e2e      # Playwright (E2E テスト)
```

## 環境変数

`.env.example` を `.env` にコピーして設定する。
