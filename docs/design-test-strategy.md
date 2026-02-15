# テスト戦略・CI/CD設計書

## 1. 現状

| 項目 | 状態 |
|------|------|
| Jest | インストール済み、設定済み |
| 既存テスト | `app.controller.spec.ts` のみ（Hello World） |
| GitHub Actions | 未設定 |
| Render ビルド | `pnpm install → prisma generate → nest build`（テストなし） |

## 2. 目標

テストが落ちたらデプロイされないようにする。

## 3. 「テストが落ちたらビルドできない」を実現する方法

テストの実行ポイントは3箇所あり、それぞれ役割が異なる。

```
開発者のPC          GitHub              Render
    |                  |                  |
    |  git push        |                  |
    |----------------->|                  |
    |                  |  GitHub Actions   |
    |                  |  (テスト実行)     |
    |                  |                  |
    |                  |  ← テスト失敗     |
    |                  |  ❌ マージ不可     |
    |                  |                  |
    |                  |  ← テスト成功     |
    |                  |  ✅ マージ可能     |
    |                  |                  |
    |                  |  merge to main    |
    |                  |----------------->|
    |                  |                  | buildCommand
    |                  |                  | (テスト実行)
    |                  |                  |
    |                  |                  | ← 失敗: デプロイ中止
    |                  |                  | ← 成功: デプロイ実行
```

### 3.1 GitHub Actions でテスト実行（推奨・最重要）

**PRをマージする前にテストを強制実行する。** これが最も重要な防御ライン。

#### ワークフロー設計

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test-api:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:16
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - run: pnpm install

      - name: Generate Prisma Client
        run: pnpm --filter api prisma generate
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

      - name: Run unit tests
        run: pnpm --filter api test
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test

      - name: Run e2e tests
        run: pnpm --filter api test:e2e
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test
```

#### ブランチ保護ルールの設定

GitHub リポジトリの Settings > Branches > Branch protection rules で以下を設定:

- **Branch name pattern**: `main`
- **Require status checks to pass before merging**: ON
  - 必須チェックに `test-api` を追加
- **Require branches to be up to date before merging**: ON

これにより、テストが通らないPRは **mainにマージ不可** になる。

### 3.2 Render のビルドコマンドにテストを追加（第二の防御ライン）

万が一 main に直接 push された場合や、GitHub Actions をスキップした場合の安全策。

#### 変更箇所: render.yaml

```yaml
# 変更前
buildCommand: |
  cd apps/api
  pnpm install
  pnpm prisma generate
  pnpm run build

# 変更後
buildCommand: |
  cd apps/api
  pnpm install
  pnpm prisma generate
  pnpm run test
  pnpm run build
```

`pnpm run test` が失敗（exit code !== 0）すると、後続の `pnpm run build` は実行されず、Render のデプロイは中止される。

**注意点:**
- Render のビルド環境にはDBがないため、DB接続が必要なテストは実行できない
- 単体テスト（モック使用）のみがRender上で実行可能
- E2Eテストは GitHub Actions でのみ実行する

### 3.3 ローカル（任意・補助的）

pre-commit hook や pre-push hook でローカルでもテストを実行する方法。
ただし、開発速度を下げるため **必須にはしない**。

```bash
# husky + lint-staged を使う場合（任意）
npx husky add .husky/pre-push "cd apps/api && pnpm test"
```

## 4. 方針まとめ

| レイヤー | タイミング | 実行するテスト | 強制力 |
|---------|-----------|---------------|-------|
| GitHub Actions | PR作成・更新時 | 単体テスト + E2Eテスト | マージ不可（ブランチ保護） |
| Render buildCommand | main push時 | 単体テストのみ | デプロイ中止 |
| ローカル pre-push | push前 | 単体テスト | 任意（スキップ可能） |

**GitHub Actions が最も重要。** ブランチ保護と組み合わせることで、テストが落ちたコードが main に入ること自体を防げる。

## 5. 実装ステップ

### Step 1: GitHub Actions ワークフローの作成

1. `.github/workflows/test.yml` を作成（上記の内容）
2. push して動作確認

### Step 2: ブランチ保護ルールの設定

3. GitHub リポジトリの Settings > Branches で保護ルールを追加
4. `test-api` ジョブを必須チェックに設定

### Step 3: Render ビルドコマンドの更新

5. `render.yaml` の `buildCommand` にテスト実行を追加

### Step 4: テストの拡充

6. 各モジュールの Service に対する単体テストを作成
   - `users.service.spec.ts`
   - `ingredients.service.spec.ts`
   - `recipes.service.spec.ts` など
7. PrismaService のモック方針を統一する

## 6. テスト作成方針

### 単体テスト（`*.spec.ts`）

- Service 層を中心にテスト
- PrismaService はモックする
- 外部API呼び出しもモック

```typescript
// 例: users.service.spec.ts
describe('UsersService', () => {
  let service: UsersService;
  let prisma: { prisma: DeepMockProxy<PrismaClient> };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: { prisma: mockDeep<PrismaClient>() },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    prisma = module.get(PrismaService);
  });

  it('should create a user', async () => {
    prisma.prisma.user.create.mockResolvedValue({
      id: 1,
      email: 'test@example.com',
      password: 'hashed',
    });

    const result = await service.createUser('test@example.com', 'password123');
    expect(result.email).toBe('test@example.com');
  });
});
```

### E2Eテスト（`*.e2e-spec.ts`）

- Controller + Service を結合してテスト
- テスト用DBを使用（GitHub Actions の services.postgres）
- supertest でHTTPリクエストを送信

### テストのDB戦略

| 環境 | DB | テスト種別 |
|------|-----|----------|
| ローカル | docker-compose の PostgreSQL | 単体 + E2E |
| GitHub Actions | services.postgres | 単体 + E2E |
| Render | なし | 単体のみ（モック） |
