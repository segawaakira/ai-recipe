# バックエンド型定義の Web / Mobile 共有

## 概要

このドキュメントでは、NestJS API が生成する型定義を Web（Next.js）と Mobile（Expo）の両方で共有する方法を整理する。UI コンポーネントの共有は対象外とする。

## 現状の型の流れ

```
apps/api (NestJS)
│
├── Swagger デコレータ → openapi.json → openapi-typescript → apps/web/types/api.d.ts
│   (API のリクエスト/レスポンス型を自動生成)
│
└── Zod スキーマ (CreateUserInput) をコントローラー内にローカル定義 ← ⚠️ 重複

packages/api-schema
│
└── Zod スキーマ (CreateUserInput, SignInInput) + 型推論
    (apps/web のフォームバリデーションで使用)
```

### 現状の問題点

| 問題 | 詳細 |
|------|------|
| **Zod スキーマの重複** | `packages/api-schema/src/user.ts` と `apps/api/src/users/users.controller.ts` で `CreateUserInput` が二重定義されている。片方を変更するともう片方と乖離するリスクがある |
| **OpenAPI 型が Web 専用** | `apps/web/types/api.d.ts` に直接生成されており、他のアプリから参照できない |

## 共有する型の種類

この2つの仕組みを Mobile にも共有する。

### 1. Zod スキーマ (`@repo/api-schema`)

**役割**: フォーム入力のバリデーション + TypeScript 型推論

```ts
// packages/api-schema/src/user.ts（現在の内容）
export const CreateUserInput = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{8,}$/),
});
export type CreateUserInputType = z.infer<typeof CreateUserInput>;

export const SignInInput = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});
export type SignInInputType = z.infer<typeof SignInInput>;
```

**現在の利用箇所**:
- `apps/web/app/auth/signup/page.tsx` — `CreateUserInput` でサインアップフォームをバリデーション
- `apps/web/app/auth/signin/page.tsx` — `SignInInput` でサインインフォームをバリデーション
- `apps/api/src/users/users.controller.ts` — **ローカルに重複定義（未共有）**

**Mobile で共有可能か**: **そのまま使える。** ランタイム依存は `zod` のみ。

### 2. OpenAPI 生成型 (`openapi-typescript`)

**役割**: API エンドポイントの `paths` / `operations` 型を生成し、`openapi-fetch` の型安全な API クライアントを実現

```ts
// apps/web/lib/api-client.ts（現在の内容）
import createClient from "openapi-fetch";
import type { paths } from "@/types/api";

export const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
});
```

**生成フロー**:
```
pnpm generate:api
  → pnpm --filter api generate:openapi    # NestJS Swagger → openapi.json
  → pnpm --filter web generate:api-types  # openapi.json → apps/web/types/api.d.ts
```

**Mobile で共有可能か**: **共有パッケージに移動すれば使える。**

## 実装ステップ

### Step 1: API コントローラーの重複スキーマを解消

`apps/api/src/users/users.controller.ts` のローカル `CreateUserInput` を削除し、`@repo/api-schema` からインポートするよう変更する。

```diff
- import { z } from 'zod';
-
- const CreateUserInput = z.object({
-   email: z.string().email(),
-   password: z.string().min(8, '...').regex(/.../, '...'),
- });

+ import { CreateUserInput } from '@repo/api-schema';
```

これにより API / Web / Mobile の全てが同一のスキーマを参照する「Single Source of Truth」になる。

### Step 2: OpenAPI 型を共有パッケージに移動

```bash
mkdir -p packages/api-types/src
```

```jsonc
// packages/api-types/package.json
{
  "name": "@repo/api-types",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "generate": "openapi-typescript ../../apps/api/openapi.json -o ./src/api.d.ts",
    "build": "tsc --build"
  },
  "devDependencies": {
    "openapi-typescript": "7.13.0",
    "typescript": "5.8.3"
  },
  "files": ["dist"]
}
```

```ts
// packages/api-types/src/index.ts
export type { paths, operations } from "./api";
```

ルートの生成コマンドを更新：

```diff
// package.json
- "generate:api": "pnpm --filter api generate:openapi && pnpm --filter web generate:api-types"
+ "generate:api": "pnpm --filter api generate:openapi && pnpm --filter @repo/api-types generate && pnpm --filter @repo/api-types build"
```

`apps/web` の `generate:api-types` スクリプトと `apps/web/types/api.d.ts` は不要になるため削除する。

### Step 3: Web の API クライアントを共有パッケージ参照に変更

```diff
// apps/web/lib/api-client.ts
  import createClient from "openapi-fetch";
- import type { paths } from "@/types/api";
+ import type { paths } from "@repo/api-types";
```

```diff
// apps/web/package.json の dependencies に追加
+ "@repo/api-types": "workspace:*",
```

### Step 4: Mobile アプリから共有パッケージを参照

```jsonc
// apps/mobile/package.json
{
  "dependencies": {
    "@repo/api-schema": "workspace:*",
    "@repo/api-types": "workspace:*",
    "react-hook-form": "^7.71.0",
    "@hookform/resolvers": "^5.2.0",
    "zod": "^3.23.0",
    "openapi-fetch": "^0.17.0"
  }
}
```

Metro bundler がワークスペースパッケージを解決できるよう設定：

```js
// apps/mobile/metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
];

module.exports = config;
```

### Step 5: Mobile での利用例

Zod スキーマによるフォームバリデーション（react-hook-form の `Controller` を使用）：

```tsx
// apps/mobile/src/screens/SignUpScreen.tsx
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserInput, type CreateUserInputType } from "@repo/api-schema";

export function SignUpScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<CreateUserInputType>({
    resolver: zodResolver(CreateUserInput),
  });
  // Web と同一のスキーマでバリデーション
}
```

型安全な API クライアント：

```tsx
// apps/mobile/src/lib/api-client.ts
import createClient from "openapi-fetch";
import type { paths } from "@repo/api-types";

export const apiClient = createClient<paths>({
  baseUrl: "https://api.example.com",
});
// Web と同一の paths 型で API 呼び出し
```

## 変更後の型の流れ

```
packages/api-schema (Single Source of Truth)
├── Zod スキーマ + 型推論
├── → apps/api       バリデーション（ローカル重複を解消）
├── → apps/web       フォームバリデーション
└── → apps/mobile    フォームバリデーション

packages/api-types (自動生成)
├── OpenAPI paths / operations 型
├── → apps/web       型安全な API クライアント
└── → apps/mobile    型安全な API クライアント

apps/api
└── NestJS Swagger → openapi.json → packages/api-types に生成
```

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `apps/api/src/users/users.controller.ts` | ローカル Zod スキーマ → `@repo/api-schema` からインポート |
| `packages/api-types/` | 新規パッケージ作成（OpenAPI 生成型） |
| `apps/web/lib/api-client.ts` | `@/types/api` → `@repo/api-types` に変更 |
| `apps/web/package.json` | `@repo/api-types` 依存追加、`generate:api-types` スクリプト削除 |
| `apps/web/types/api.d.ts` | 削除（共有パッケージに移動） |
| `package.json`（ルート） | `generate:api` コマンドを更新 |
| `apps/mobile/package.json` | `@repo/api-schema`, `@repo/api-types` 依存追加 |
| `apps/mobile/metro.config.js` | モノレポのモジュール解決設定 |

## モバイルアプリ開発で気をつけること

### 1. API 認証基盤の整備（モバイル対応の前提条件）

現在の認証は NextAuth（Web 専用）に依存しており、API 自体に認証の仕組みがない。

**現在の認証フロー（Web）**:
```
ブラウザ → NextAuth (JWT cookie で session 管理)
        → session.user.id を取得
        → API に userId をクエリパラメータで渡す
        → API 側: userId を信頼してそのまま使用（認証チェックなし）
```

**問題点**:
- API エンドポイントに認証ガードが存在しない
- `GET /recipes?userId=123` のように userId を変えるだけで他人のデータにアクセス可能
- Web では NextAuth のセッションで間接的に守られているが、API 自体は無防備
- モバイルアプリが API に直接アクセスする場合、この問題がより深刻になる

**モバイル対応前に必要な API 側の変更**:

```
1. JWT トークン発行エンドポイントの追加
   POST /auth/login → { accessToken, refreshToken }

2. NestJS AuthGuard でデータエンドポイントを保護
   @UseGuards(JwtAuthGuard) を全コントローラーに適用

3. トークン内の userId とリクエストの userId の一致を検証
   リクエストの userId をトークンのペイロードから取得する設計に変更
```

**変更後の認証フロー（Web / Mobile 共通）**:
```
Web:    NextAuth → POST /auth/login → accessToken 取得 → Authorization ヘッダーに付与
Mobile: ログイン画面 → POST /auth/login → accessToken 取得 → Authorization ヘッダーに付与

API クライアント（共通）:
  apiClient.GET("/recipes", {
    headers: { Authorization: `Bearer ${token}` }
  })

API 側:
  JwtAuthGuard がトークンを検証 → トークンから userId を取得 → データを返却
```

### 2. トークンの安全な保存

| プラットフォーム | 推奨する保存先 | 使ってはいけない保存先 |
|----------------|--------------|-------------------|
| Web | HttpOnly Cookie（NextAuth が管理） | `localStorage`（XSS で漏洩する） |
| Mobile | `expo-secure-store`（OS レベルの暗号化） | `AsyncStorage`（暗号化なし、平文保存） |

### 3. API クライアントへの認証ヘッダー付与

現在の Web の API クライアントは認証ヘッダーを送っていない：

```ts
// 現在の apps/web/lib/api-client.ts — ヘッダーなし
export const apiClient = createClient<paths>({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
});
```

Mobile ではトークンを付与する必要がある。Web 側も同様に修正すべき：

```ts
// apps/mobile/src/lib/api-client.ts
import createClient from "openapi-fetch";
import type { paths } from "@repo/api-types";
import * as SecureStore from "expo-secure-store";

export const apiClient = createClient<paths>({
  baseUrl: "https://api.example.com",
  headers: async () => {
    const token = await SecureStore.getItemAsync("accessToken");
    return token ? { Authorization: `Bearer ${token}` } : {};
  },
});
```

### 4. ネットワーク環境の違い

モバイルは不安定なネットワークを前提に設計する必要がある。

| 考慮点 | 詳細 |
|--------|------|
| **タイムアウト・リトライ** | API 呼び出しにタイムアウトとリトライ処理を追加する |
| **画像アップロード** | `/gemini/recognize-ingredients` は base64 画像を送信する。モバイル回線では失敗しやすいため、アップロード前の圧縮・リサイズがより重要 |
| **オフライン時** | ネットワーク到達不能時のエラーハンドリングとユーザーへの通知 |

### 5. 環境変数の扱い

Expo では `NEXT_PUBLIC_*` 環境変数は使えない。

```js
// apps/mobile/app.config.js
export default {
  expo: {
    extra: {
      apiUrl: process.env.API_URL || "http://localhost:3001",
    },
  },
};
```

```ts
// アプリ内での参照
import Constants from "expo-constants";
const API_URL = Constants.expoConfig?.extra?.apiUrl;
```

## その他の注意点

- **Zod バージョン**: api-schema (`^3.23.0`)、web (`^3.25.76`)、mobile、api の全パッケージで同一メジャーバージョン（v3 系）を使うこと
- **openapi-typescript バージョン**: `@repo/api-types` と `apps/web` で同じバージョン（`7.13.0`）を使い、生成結果に差異が出ないようにする
- **生成タイミング**: API のエンドポイントを変更したら `pnpm generate:api` を実行し、`@repo/api-types` をリビルドする。CI でこれを自動化するのが望ましい
- **pnpm overrides**: 依存の重複やバージョン不一致が発生した場合、`overrides` はルートの `package.json` に記述する（アプリ個別の `package.json` では無効）
