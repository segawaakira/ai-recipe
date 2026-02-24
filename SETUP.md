# ローカル環境セットアップ

1. 環境変数の設定

   ```bash
   cd apps/api
   cp .env.example .env
   ```

   ```bash
   cd apps/web
   cp .env.example .env
   ```

   ```bash
   cd apps/mobile
   cp .env.example .env
   ```
    ※コピーした後の.envに必要なapiKeyや、認証情報などを入れる。

2. パッケージインストール

   ```bash
   pnpm install
   ```

3. Dockerセットアップ

   ```bash
   docker compose up
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
