# apps/mobile

AI Recipe アプリのモバイルクライアント。Expo (React Native) で構築。

## 技術スタック

- **Expo ~54** / **React Native 0.81**
- **React 19** / TypeScript
- **expo-router** (ファイルベースルーティング)
- **openapi-fetch** (型安全な API クライアント / `@repo/api-types`)
- **expo-secure-store** (JWT トークン保存)
- **expo-image-picker** (カメラ / ギャラリー)
- **react-native-markdown-display** (レシピ表示)
- **@expo/vector-icons** (Ionicons)
- **zod** (バリデーション)

## ディレクトリ構成

```
apps/mobile/
├── app/                          # expo-router (ファイルベースルーティング)
│   ├── _layout.tsx               #   ルートレイアウト (AuthProvider, 認証リダイレクト)
│   ├── (auth)/                   #   認証画面グループ (公開)
│   │   ├── _layout.tsx           #     Stack (ヘッダー非表示)
│   │   ├── sign-in.tsx           #     ログイン
│   │   ├── sign-up.tsx           #     会員登録
│   │   └── forgot-password.tsx   #     パスワードリセット申請
│   └── (tabs)/                   #   メイン画面グループ (認証必須)
│       ├── _layout.tsx           #     タブナビゲーター (ホーム, 履歴)
│       ├── index.tsx             #     ホーム (食材入力 + レシピ生成)
│       ├── account.tsx           #     アカウント設定 (タブ非表示)
│       └── history/              #     履歴 (ネスト Stack)
│           ├── _layout.tsx       #       Stack (一覧 ↔ 詳細)
│           ├── index.tsx         #       レシピ一覧 (検索, フィルタ, ページネーション)
│           └── [id].tsx          #       レシピ詳細
├── components/                   # 再利用可能なコンポーネント
│   ├── IngredientSection.tsx     #   食材入力 / 画像認識 / ジャンル選択
│   ├── RecipeDisplaySection.tsx  #   レシピ表示 (Markdown)
│   ├── RecipeMeta.tsx            #   ジャンル / 食材バッジ
│   ├── StarRating.tsx            #   星評価 (1-5)
│   ├── YouTubeVideos.tsx         #   関連動画リスト
│   ├── ImageUploadArea.tsx       #   画像アップロード (カメラ / ギャラリー)
│   └── ConfirmDialog.tsx         #   確認ダイアログ
├── contexts/                     # React Context
│   └── AuthContext.tsx           #   認証状態 + 操作メソッド
├── lib/                          # ユーティリティ
│   ├── auth.ts                   #   JWT トークン操作 (SecureStore)
│   ├── api-client.ts             #   認証不要 API クライアント
│   └── auth-api-client.ts        #   認証付き API クライアント
├── assets/                       # 画像アセット (アイコン, スプラッシュ)
├── app.config.ts                 # Expo 設定
├── eas.json                      # EAS Build 設定
└── package.json
```

## ディレクトリルール

### `app/` — ルーティング (expo-router)

expo-router のファイルベースルーティングに従う。Next.js の App Router に近い構造。

- **ルートグループ**: `(auth)/` は公開画面、`(tabs)/` は認証必須画面
- **`_layout.tsx`** でグループごとのナビゲーション種別を定義する
  - `(auth)/`: `Stack` (ヘッダー非表示)
  - `(tabs)/`: `Tabs` (ボトムタブ)
  - `(tabs)/history/`: `Stack` (一覧 → 詳細のナビゲーション)
- **各画面ファイルには画面コンポーネントのみ配置**する。UIの部品は `components/` に分離する
- **動的ルート**: `[id].tsx` でパラメータ付きルートを定義する
- **タブ非表示画面**: `href: null` オプションでタブバーから隠す (account.tsx)

### `components/` — コンポーネント

再利用可能な React Native コンポーネントを配置する。

- **フラット構成**: サブディレクトリは作らず、1 ファイル = 1 コンポーネント
- **ファイル名**: PascalCase (`IngredientSection.tsx`)
- **コンポーネント名**: PascalCase (`IngredientSection`)
- Web 版 (`apps/web/components/`) と同名のコンポーネントが多いが、実装は React Native 向けに独立している

### `contexts/` — React Context

グローバルな状態管理を配置する。

| ファイル | 役割 |
|---|---|
| `AuthContext.tsx` | 認証状態 (`token`, `user`, `isLoading`) と操作 (`signIn`, `signOut`, `changePassword` 等) を提供 |

- `AuthProvider` をルートレイアウトで全体にラップする
- `useAuth()` フックで各画面からアクセスする
- 認証付き API 呼び出しは `createAuthClient(token)` を Context 内部で動的インポートして使用する

### `lib/` — ユーティリティ

API クライアントや認証ヘルパーなど、コンポーネント以外のロジックを配置する。

| ファイル | 役割 |
|---|---|
| `auth.ts` | JWT トークンの保存 / 取得 / 削除 (`expo-secure-store`)、デコード、有効期限チェック |
| `api-client.ts` | 認証不要 API クライアント (`apiClient`)。ログイン、会員登録等で使用 |
| `auth-api-client.ts` | 認証付き API クライアント (`createAuthClient(token)`)。Bearer トークンを付与 |

- API クライアントは `openapi-fetch` + `@repo/api-types` の型を使用する
- `API_URL` は `expo-constants` 経由で `app.config.ts` の `extra.apiUrl` から取得する

### `assets/` — 画像アセット

アプリアイコン、スプラッシュ画像、favicon を配置する。

## ナビゲーション構造

```
_layout.tsx (AuthProvider + 認証リダイレクト)
├── (auth)/                    ← 未認証時にリダイレクト
│   ├── sign-in.tsx
│   ├── sign-up.tsx
│   └── forgot-password.tsx
└── (tabs)/                    ← 認証済み時にリダイレクト
    ├── ホーム (index.tsx)          タブ 1
    ├── 履歴 (history/)             タブ 2
    │   ├── 一覧 (index.tsx)
    │   └── 詳細 ([id].tsx)
    └── アカウント (account.tsx)     タブ非表示 (ヘッダーアイコンから遷移)
```

- ルートレイアウトが `token` の有無で `(auth)` ↔ `(tabs)` を自動リダイレクトする
- アカウント画面はタブバーに表示せず、ヘッダー右のアイコンから遷移する

## 認証フロー

```
1. アプリ起動 → SecureStore からトークン読み込み
2. トークンあり & 有効期限内 → デコードして user 設定 → (tabs) へ
3. トークンなし or 期限切れ → (auth)/sign-in へ
4. ログイン → POST /auth/login → トークンを SecureStore に保存 → (tabs) へ
5. ログアウト → SecureStore からトークン削除 → (auth)/sign-in へ
```

- JWT ペイロード: `{ sub: userId, email, iat, exp }`
- トークンは `expo-secure-store` でネイティブの暗号化ストレージに保存される

## API クライアントの使い分け

```typescript
// 認証不要 (ログイン、会員登録等)
import { apiClient } from "@/lib/api-client";
const { data } = await apiClient.POST("/auth/login", { body: { email, password } });

// 認証必要 (レシピ操作等) — 画面内で useMemo で生成
import { createAuthClient } from "@/lib/auth-api-client";
const authClient = useMemo(() => token ? createAuthClient(token) : null, [token]);
const { data } = await authClient.GET("/recipes");
```

## 開発

```bash
# 開発サーバー起動
pnpm start

# iOS シミュレーター
pnpm ios

# Android エミュレーター
pnpm android

# 型生成 (API スキーマ変更後にモノレポルートで実行)
pnpm generate:api

# パッケージ追加 (Expo 互換バージョンを自動選択)
npx expo install <package-name>
```

## 環境変数

`.env.example` を `.env` にコピーして設定する。
