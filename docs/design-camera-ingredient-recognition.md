# カメラ食材認識機能 設計書

## 1. 概要

### 目的

カメラで撮影した食材画像をAIが解析し、認識された食材を食材リストに追加する。手入力の手間を削減し、UXを向上させる。

### 現状

- `components/image-upload-area.tsx` にUIの雛形が存在するが、**デモ用モック実装**（ハードコードされた食材 + 偽の進捗バー）
- 実際の画像認識APIとの接続は未実装

### 採用アプローチ

**Gemini 2.0 Flash のマルチモーダル機能**を使用する。

現在レシピ生成で使用している Gemini API がそのまま画像入力に対応しているため、追加のAIサービスは不要。

**選定理由:**

- 既に Gemini API キーが設定済みで、追加コスト（新規サービス契約）が不要
- Gemini 2.0 Flash は画像理解の精度が高い
- 1つのAPIで食材認識とレシピ生成の両方を賄える

**代替案との比較:**

| アプローチ | メリット | デメリット |
|-----------|---------|-----------|
| **Gemini Vision（採用）** | 追加サービス不要、高精度、日本語対応 | API呼び出しコスト |
| Google Cloud Vision API | 物体認識に特化 | 食材名の抽出に追加ロジックが必要、別料金 |
| ローカルML（TensorFlow.js） | オフライン対応 | モデルサイズ大、精度が低い、学習コスト高 |

---

## 2. 追加ライブラリ

### 必須: なし

現在の技術スタックのみで実装可能。

- **画像入力**: `<input type="file" accept="image/*" capture="environment">` （ブラウザ標準API）
  - モバイル: `capture="environment"` でカメラが直接起動する
  - デスクトップ: ファイル選択ダイアログ（既存の D&D も継続利用）
- **画像認識**: Gemini 2.0 Flash（既に導入済み）
- **Base64変換**: `FileReader` API（ブラウザ標準）

### 任意: react-webcam（リアルタイムプレビューが必要な場合）

```bash
pnpm add react-webcam
```

- デスクトップでもカメラのライブプレビューを表示したい場合に使用
- モバイル中心なら不要（`<input capture>` で十分）

**推奨: 初期実装では追加ライブラリなしで進める。**

---

## 3. API設計

### Next.js API Route（新規）

`apps/web/app/api/gemini/recognize-ingredients/route.ts` を新設する。

#### エンドポイント

| メソッド | パス | 用途 |
|---------|------|------|
| `POST` | `/api/gemini/recognize-ingredients` | 画像から食材を認識 |

#### リクエスト

```typescript
interface RecognizeIngredientsRequest {
  image: string; // Base64エンコードされた画像データ（data URL）
}
```

#### レスポンス

```typescript
interface RecognizeIngredientsResponse {
  ingredients: string[]; // 認識された食材名の配列
}
```

#### 実装方針

```typescript
// apps/web/app/api/gemini/recognize-ingredients/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { image } = await req.json();

  // data:image/jpeg;base64,... から base64 部分を抽出
  const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
  const mimeType = image.match(/^data:(image\/\w+);base64,/)?.[1] || "image/jpeg";

  const prompt = `この画像に写っている食材をすべて識別してください。
食材名のみをJSON配列で返してください。食材以外のもの（皿、テーブル等）は含めないでください。
例: ["トマト", "玉ねぎ", "鶏もも肉"]`;

  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Data,
              },
            },
          ],
        }],
      }),
    }
  );

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

  // JSON配列をパース（Geminiの出力からJSON部分を抽出）
  const jsonMatch = text.match(/\[[\s\S]*?\]/);
  const ingredients: string[] = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

  return NextResponse.json({ ingredients });
}
```

---

## 4. フロントエンド設計

### 4.1 UI設計

食材管理カード内に「テキスト入力」と「カメラ入力」の切り替えタブを設ける。

```
┌─────────────────────────────────┐
│  食材管理                        │
│  テキスト入力または画像から追加    │
│                                 │
│  [テキスト入力] [カメラで追加]    │  ← タブ切り替え
│                                 │
│  ┌─ テキスト入力タブ ──────────┐ │
│  │ [食材名を入力...] [追加]    │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─ カメラタブ ────────────────┐ │
│  │                             │ │
│  │  ┌───────────────────┐      │ │
│  │  │                   │      │ │
│  │  │  カメラで撮影      │      │ │
│  │  │  または画像を選択   │      │ │
│  │  │                   │      │ │
│  │  └───────────────────┘      │ │
│  │                             │ │
│  │  ── 認識結果（解析後） ──    │ │
│  │  [v トマト] [v 玉ねぎ]      │ │
│  │  [  人参 ] [  じゃがいも]    │ │
│  │                             │ │
│  │  [選択した食材を追加 (2)]    │ │
│  └─────────────────────────────┘ │
│                                 │
│  所有食材 (5個)                   │
│  [トマト x] [玉ねぎ x] ...       │
└─────────────────────────────────┘
```

### 4.2 カメラ入力の2つのモード

#### モバイル: ネイティブカメラ起動

```html
<input
  type="file"
  accept="image/*"
  capture="environment"
/>
```

- `capture="environment"` により、モバイル端末では直接カメラが起動する
- 背面カメラ（environment）を優先指定

#### デスクトップ: ファイル選択 + ドラッグ&ドロップ

- 既存の `ImageUploadArea` のD&D UIを流用
- ファイル選択ダイアログからの画像選択

### 4.3 コンポーネント改修

#### `ImageUploadArea` の改修ポイント

現在のモック実装を実際のAPI呼び出しに差し替える。

```typescript
// 変更点
// 1. props でコールバックを受け取る
interface ImageUploadAreaProps {
  onIngredientsRecognized: (ingredients: string[]) => void;
}

// 2. analyzeImage() を実APIに差し替え
const analyzeImage = async (base64Image: string) => {
  setIsAnalyzing(true);
  try {
    const response = await fetch("/api/gemini/recognize-ingredients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Image }),
    });
    const data = await response.json();
    setRecognizedIngredients(data.ingredients);
  } catch (error) {
    // エラーハンドリング
  } finally {
    setIsAnalyzing(false);
  }
};

// 3. addSelectedIngredients() で親コンポーネントに通知
const addSelectedIngredients = () => {
  onIngredientsRecognized(selectedIngredients);
  resetUpload();
};
```

#### `page.tsx` の改修ポイント

```typescript
// タブの状態管理
const [inputMode, setInputMode] = useState<"text" | "camera">("text");

// ImageUploadArea からのコールバック
const handleImageIngredients = (newIngredients: string[]) => {
  const unique = newIngredients.filter(i => !ingredients.includes(i));
  setIngredients([...ingredients, ...unique]);
  toast.success(`${unique.length}個の食材を追加しました`);
};
```

### 4.4 認識フロー

```
1. ユーザーが「カメラで追加」タブを選択
2. カメラで撮影 or 画像ファイルを選択
3. プレビュー表示 + 「解析中...」ローディング
4. POST /api/gemini/recognize-ingredients に画像を送信
5. Gemini が食材を認識し、JSON配列で返却
6. 認識された食材をバッジで一覧表示（チェックボックス付き）
7. ユーザーが追加する食材を選択（全選択 / 個別選択）
8. 「選択した食材を追加」で食材リストに反映
```

### 4.5 シーケンス図

```
User        Frontend              Next.js API         Gemini
 |              |                      |                 |
 |--[撮影]----->|                      |                 |
 |              |--Base64変換          |                 |
 |              |                      |                 |
 |<-[プレビュー]|                      |                 |
 |              |                      |                 |
 |              |--POST /recognize---->|                 |
 |              |   (base64 image)     |--prompt+image-->|
 |              |                      |<--JSON配列------|
 |              |<--ingredients[]------|                 |
 |              |                      |                 |
 |<-[認識結果]--|                      |                 |
 |              |                      |                 |
 |--[食材選択]->|                      |                 |
 |--[追加]----->|                      |                 |
 |              |--食材リストに反映     |                 |
 |<-[完了]------|                      |                 |
```

---

## 5. 画像サイズの制限と最適化

### アップロード前のリサイズ

大きな画像をそのまま送るとAPIコストが増大するため、フロントエンドでリサイズする。

```typescript
function resizeImage(file: File, maxWidth: number = 1024): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
```

### 制限値

| 項目 | 値 |
|------|-----|
| 最大ファイルサイズ | 10MB（リサイズ前） |
| リサイズ後の最大幅 | 1024px |
| JPEG品質 | 80% |
| 対応フォーマット | JPEG, PNG, WebP |

---

## 6. 実装ステップ

### Phase 1: API（食材認識エンドポイント）

1. `apps/web/app/api/gemini/recognize-ingredients/route.ts` を新設
2. Gemini マルチモーダルAPI呼び出しの実装
3. JSON配列パースとエラーハンドリング

### Phase 2: フロントエンド

4. `components/image-upload-area.tsx` を改修
   - モック実装を実API呼び出しに差し替え
   - props で `onIngredientsRecognized` コールバックを受け取る
   - 画像リサイズロジックの追加
   - モバイル用 `capture="environment"` の追加
5. `apps/web/app/page.tsx` を改修
   - テキスト/カメラ のタブ切り替えUI追加
   - `ImageUploadArea` の組み込み
   - 認識された食材の既存リストへの追加ロジック

### Phase 3: UX改善

6. エラーハンドリングの充実
   - 食材が認識されなかった場合のメッセージ
   - カメラ権限が拒否された場合の案内
   - ネットワークエラー時のリトライUI
7. 「全選択 / 全解除」ボタンの追加

---

## 7. 考慮事項

### プライバシー

- 画像はサーバーに保存しない（認識処理後に破棄）
- Gemini APIに送信される旨をユーザーに通知

### 精度

- 複数の食材が重なっている場合、認識漏れの可能性がある
- 認識結果はあくまで候補であり、ユーザーが選択・修正できるUIにする
- 「認識されなかった食材は手入力で追加してください」のガイド表示

### パフォーマンス

- 画像リサイズをフロントエンドで行い、転送量を削減
- 解析中はローディングUIを表示し、体感速度を改善

### モバイル対応

- `capture="environment"` でモバイルカメラを直接起動
- タッチ操作に適したバッジサイズ（最低44px）
- 縦向き画面でも崩れないレスポンシブレイアウト
