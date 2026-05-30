# HUNTER×HUNTER キャラクター図鑑 — フロントエンド

[HxHAPI](../hxhAPI)（Hono + Cloudflare Workers 製の API）から取得した HUNTER×HUNTER のキャラクター情報を一覧・検索・詳細表示する Web アプリです。Next.js（App Router）+ TypeScript + Tailwind CSS で構築しています。

## 主な機能

- **キャラクター一覧**: API から取得したキャラをカード形式でグリッド表示
- **検索・絞り込み**: 名前のテキスト検索に加え、`念系統` / `所属` / `登場編` のプルダウンで AND 絞り込み（選択肢はデータから動的生成）
- **もっと見る**: 初期表示は 20 件。ボタンで 20 件ずつ追加表示
- **詳細モーダル**: カードをクリックすると、画像・基本情報・説明・念能力（技一覧）をダイアログで表示
- **前後ナビゲーション**: モーダル下部の `‹ 前へ` / `次へ ›` ボタン、またはキーボードの `←` / `→` で、絞り込み後の一覧内を循環移動（`Esc` で閉じる）
- **詳細ページ**: `/characters/[id]` で個別キャラの詳細ページにも対応

## 技術スタック

| 種類 | 採用技術 |
| --- | --- |
| フレームワーク | Next.js 16（App Router） |
| 言語 | TypeScript |
| UI | React 19 / Tailwind CSS 4 |
| データ取得 | [SWR](https://swr.vercel.app/) |
| フォント | Geist（`next/font`） |

## ディレクトリ構成

```
frontend/
├── app/
│   ├── page.tsx                  # トップ（一覧・検索・絞り込み・モーダル制御）
│   ├── layout.tsx                # 全体レイアウト・メタデータ・フォント
│   ├── globals.css               # グローバルスタイル（Tailwind・アニメーション）
│   ├── characters/
│   │   └── [id]/page.tsx         # キャラクター詳細ページ
│   ├── components/
│   │   ├── CharacterCard.tsx     # 一覧用のカード1枚
│   │   └── CharacterModal.tsx    # 詳細モーダル（前後ナビ付き）
│   └── lib/
│       └── api.ts                # API_BASE・型定義・fetcher・各種ヘルパー
├── next.config.ts
├── package.json
└── README.md
```

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開くと表示されます。

### 3. ビルド / 本番起動

```bash
npm run build
npm run start
```

### Lint

```bash
npm run lint
```

## API との連携

接続先のバックエンド URL は `app/lib/api.ts` の `API_BASE` で定義しています。

```ts
export const API_BASE = "https://hxhapi.tully0302.workers.dev";
```

| 用途 | エンドポイント |
| --- | --- |
| 一覧取得 | `GET ${API_BASE}/api/v1/characters` |
| 詳細取得 | `GET ${API_BASE}/api/v1/characters/:id` |

画像は API 側の `public/images` 配下に格納されており、各キャラの `imageUrl` は `/images/xxx.jpg` のような相対パスで返ります。フロントでは `toImageUrl()` ヘルパーで `API_BASE` を前置し、絶対 URL に変換して表示します。

接続先を切り替えたい場合（例: ローカルの API を見る）は `API_BASE` の値を変更してください。

## 補足

- 一覧 API がキャラの全項目を返すため、詳細モーダルは取得済みデータをそのまま表示し、詳細 API を再取得しません。
- 絞り込みの選択肢は、`所属` / `登場編` を `/` 区切りや括弧書きで分解（`splitTokens`）して「組織・編」単位にまとめています。
