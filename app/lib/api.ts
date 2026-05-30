// バックエンド(Cloudflare Workers)の公開URL
export const API_BASE = "https://hxhapi.tully0302.workers.dev";

// 念能力に含まれる個別の技。
export type Technique = {
  name: string;
  reading?: string; // 漢字技名の読み（純カタカナ技など読みが無い場合は省略）
  description: string;
};

// キャラクターの念能力。複数の技を持つ。
export type NenAbility = {
  name: string;
  reading: string;
  description: string;
  techniques: Technique[];
};

// APIが返すキャラクター1件の型。バックエンドの Charactor と同じ形にする。
export type Character = {
  id: number;
  name: string;
  nenType: string;
  affiliation: string;
  description: string;
  imageUrl: string; // 例: "/images/gon.jpg"（APIから見た相対パス）
  debutArc: string;
  // 以下は任意。データが無いキャラでは省略される。
  englishName?: string;
  gender?: string;
  nenAbility?: NenAbility;
};

// SWR に渡す共通の取得関数。レスポンスを JSON に変換して返す。
// 失敗時(404など)は throw する → SWR 側の error で受け取れる。
export const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`リクエストに失敗しました (${res.status})`);
  }
  return res.json();
};

// 相対パスの画像URLを、APIの絶対URLに変換するヘルパー。
// "/images/gon.jpg" -> "https://hxhapi.../images/gon.jpg"
export const toImageUrl = (path: string) => `${API_BASE}${path}`;

// 所属・登場編のような複合文字列を、絞り込み用の「タグ」に分解するヘルパー。
//  - "/" 区切りを分割    ："ハンター協会 / ノストラード組" → ["ハンター協会", "ノストラード組"]
//  - "（…）" の括弧書きは除去："ゾルディック家（執事）"   → ["ゾルディック家"]
// これでプルダウンの選択肢が「組織/編」単位にまとまり、部分一致でメンバーを絞れる。
export const splitTokens = (s: string): string[] =>
  s
    .split("/")
    .map((t) => t.replace(/[（(][^）)]*[）)]/g, "").trim())
    .filter(Boolean);

// 配列から重複を除き、出現順を保ったまま返す（プルダウンの選択肢づくりに使う）。
export const uniq = (arr: string[]): string[] => Array.from(new Set(arr));
