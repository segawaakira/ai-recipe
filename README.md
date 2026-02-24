# AI Recipe

## デモサイト

- WEB

    https://ai-recipe-web.vercel.app/

    ```
    BASIC認証
    ID: user
    PW: uE8i|cB/
    ```

- Mobile
以下のアドレスからInstallボタンをクリックし、それぞれのデバイスで、QRコードを読み込んで、アプリをインストールする。
    - iOS

    https://expo.dev/accounts/segawaakira/projects/ai-recipe/builds/2984f922-fd7b-42f3-ad3e-6806ffc8ba53

    ※iOSは、`設定 > プライバシーとセキュリティ > デベロッパモード`を`オン`にする必要あり

    - Android

    https://expo.dev/accounts/segawaakira/projects/ai-recipe/builds/916a5b4f-68a1-4490-98c5-a79029316f42

---

## 概要

### 何をするアプリか
- 持っている食材を登録し、AIがレシピを提案してくれます。
- 提案されたレシピに対して、対話や評価によりさらに自分に合ったレシピをAIが提案してくれます。
- 食材の登録はテキスト or 画像（ファイルアップロード・撮影）から簡単に登録できます。

### どんな人向けか
- 自炊はするけど毎日の献立に悩む人。
- 食材の写真を撮ってサッとレシピを知りたい人。
- 今持っている食材をなんとか活かせないかと思っている人。

### なんでこれを作ったか
- SNSでも料理系のニーズは高まっており、レシピを考える時間を減らしたい・レシピの引き出しを増やしたい人の課題解決になると思った。
- 持っている食材優先でレシピ生成するから、自然と使い切り提案になり、フードロス削減・昨今の物価高対策に直結。

---

## スクリーンショット

- 所有食材から使いたい食材を選択し、AIレシピを作成クリックで、AIが提案するレシピが表示されます。評価をすると、次回以降のレシピに反映されます。

    <img width="430" height="auto" alt="1" src="https://github.com/user-attachments/assets/0162603c-5b94-4a7e-a051-73f195c6a7a2" />


- 所有食材は、テキストだけでなく画像からも登録できます。

    <img width="430" height="auto" alt="2" src="https://github.com/user-attachments/assets/4eab7bbc-298c-4991-b7c2-ce0b323b2cde" />


- 提案されたレシピは履歴一覧で確認できます。

    <img width="430" height="auto" alt="3" src="https://github.com/user-attachments/assets/002630a3-55ba-4a4a-ae2b-4b9c7a114bcc" />


- 履歴詳細で、過去のAIレシピが確認できます。

    <img width="430" height="auto" alt="4" src="https://github.com/user-attachments/assets/6e016dda-b1ad-4290-a9b2-2e4d01e68c05" />


---

## 使用技術

API、Web、MobileともにTypeScriptでモノレポで構成しています。

| カテゴリ | 技術 |
|---|---|
| **モノレポ管理** | pnpm ワークスペース / Turborepo |
| **API** | NestJS / Prisma / PostgreSQL / Passport + JWT / Swagger (OpenAPI 自動生成) |
| **Web** | Next.js (Turbopack) / React 19 / NextAuth / Tailwind CSS v4 / shadcn/ui |
| **Mobile** | Expo SDK 54 / React Native / expo-router / expo-secure-store |
| **テスト** | Jest + Supertest (API unit/e2e) / Jest + Testing Library (Web unit) / Playwright (Web E2E) |
| **コード品質** | ESLint / Prettier |

### 外部サービス

| サービス | 用途 |
|---|---|
| [Google Gemini API](https://ai.google.dev/) | レシピ生成・食材画像認識・食材バリデーション |
| [YouTube Data API v3](https://developers.google.com/youtube/v3) | 生成したレシピに関連する調理動画の検索 |
| Gmail SMTP | メールアドレス確認・パスワードリセット等の通知メール送信 |
| [Vercel](https://vercel.com/) | Web フロントエンド (Next.js) のホスティング |
| [Render](https://render.com/) | バックエンド API (NestJS) と PostgreSQL のホスティング |
| [Expo Application Services (EAS)](https://expo.dev/eas) | モバイルアプリのビルド・配信 |
| [GitHub Actions](https://github.com/features/actions) | CI (テスト・ビルドの自動実行) |

---

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
│   ├── database/     # Prisma Client ラッパー
│   ├── ui/           # 共有 UI コンポーネント
│   ├── typescript-config/
│   └── eslint-config/
└── package.json
```

### API 型共有の仕組み

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

---

## 個別のREADME

- [ローカル環境セットアップ](./SETUP.md) 
- [API](./apps/api/README.md)
- [WEB](./apps/web/README.md)
- [MOBILE](./apps/mobile/README.md)
