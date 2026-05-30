"use client"; // SWR・状態・イベントを使うため、このページはクライアントコンポーネントにする

import { useMemo, useState } from "react";
import useSWR from "swr";
import {
  API_BASE,
  Character,
  fetcher,
  splitTokens,
  uniq,
} from "./lib/api";
import CharacterCard from "./components/CharacterCard";
import CharacterModal from "./components/CharacterModal";

export default function Home() {
  // 一覧APIを叩く。data=キャラの配列, error=失敗, isLoading=取得中
  const { data, error, isLoading } = useSWR<Character[]>(
    `${API_BASE}/api/v1/characters`,
    fetcher
  );

  // 検索・絞り込みの状態（""＝指定なし＝すべて）
  const [query, setQuery] = useState("");
  const [nen, setNen] = useState("");
  const [affiliation, setAffiliation] = useState("");
  const [arc, setArc] = useState("");

  // クリックされたキャラ。null ならモーダルは閉じている。
  const [selected, setSelected] = useState<Character | null>(null);

  // 「もっと見る」用。最初は20件だけ表示し、押すたびに20件ずつ増やす。
  const PAGE_SIZE = 20;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // 検索語・絞り込みを変えたら、表示は先頭の20件に戻す。
  // （状態を更新するときに毎回リセットを挟むためのラッパー）
  const updateFilter = (set: (v: string) => void) => (v: string) => {
    set(v);
    setVisibleCount(PAGE_SIZE);
  };

  // プルダウンの選択肢を、取得したデータから動的に作る。
  // 念系統はそのまま、所属・登場編は splitTokens で「組織/編」単位にまとめる。
  const nenOptions = useMemo(
    () => uniq((data ?? []).map((c) => c.nenType)),
    [data]
  );
  const affiliationOptions = useMemo(
    () => uniq((data ?? []).flatMap((c) => splitTokens(c.affiliation))),
    [data]
  );
  const arcOptions = useMemo(
    () => uniq((data ?? []).flatMap((c) => splitTokens(c.debutArc))),
    [data]
  );

  // 検索語＋3つのプルダウンを AND で適用した結果。
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((c) => {
      const byName = c.name.toLowerCase().includes(q);
      const byNen = nen === "" || c.nenType === nen;
      const byAff =
        affiliation === "" || splitTokens(c.affiliation).includes(affiliation);
      const byArc = arc === "" || splitTokens(c.debutArc).includes(arc);
      return byName && byNen && byAff && byArc;
    });
  }, [data, query, nen, affiliation, arc]);

  // 実際に画面へ出すぶん（先頭から visibleCount 件だけ）。
  const visible = filtered.slice(0, visibleCount);
  const hasMore = filtered.length > visibleCount;

  // 何か絞り込みが掛かっているか（クリアボタンの活性判定に使う）
  const isFiltering =
    query !== "" || nen !== "" || affiliation !== "" || arc !== "";

  const clearAll = () => {
    setQuery("");
    setNen("");
    setAffiliation("");
    setArc("");
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
          HUNTER×HUNTER キャラクター一覧
        </h1>

        {/* 検索＆絞り込みバー */}
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => updateFilter(setQuery)(e.target.value)}
            placeholder="名前で検索..."
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none sm:w-56"
          />

          <FilterSelect
            label="念系統"
            value={nen}
            onChange={updateFilter(setNen)}
            options={nenOptions}
          />
          <FilterSelect
            label="所属"
            value={affiliation}
            onChange={updateFilter(setAffiliation)}
            options={affiliationOptions}
          />
          <FilterSelect
            label="登場編"
            value={arc}
            onChange={updateFilter(setArc)}
            options={arcOptions}
          />

          <button
            type="button"
            onClick={clearAll}
            disabled={!isFiltering}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ✕ クリア
          </button>
        </div>

        {/* 件数表示（取得できているときだけ）。一部表示中はその旨も出す。 */}
        {data && (
          <p className="mb-4 text-sm text-gray-500">
            {hasMore
              ? `全 ${filtered.length} 件中 ${visible.length} 件を表示`
              : `${filtered.length} 件`}
          </p>
        )}

        {/* 取得中 */}
        {isLoading && <p className="text-center text-gray-500">読み込み中...</p>}

        {/* 失敗時 */}
        {error && (
          <p className="text-center text-red-500">データの取得に失敗しました</p>
        )}

        {/* 取得成功 → カードを並べる（先頭から visibleCount 件だけ） */}
        {data && filtered.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {visible.map((character) => (
              <CharacterCard
                key={character.id}
                character={character}
                onSelect={() => setSelected(character)}
              />
            ))}
          </div>
        )}

        {/* もっと見る（まだ続きがあるときだけ） */}
        {data && hasMore && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((n) => n + PAGE_SIZE)}
              className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
            >
              もっと見る（残り {filtered.length - visibleCount} 件）
            </button>
          </div>
        )}

        {/* 0件メッセージ */}
        {data && filtered.length === 0 && (
          <p className="py-16 text-center text-gray-500">
            該当するキャラクターはいません
          </p>
        )}
      </div>

      {/* 詳細モーダル（選択中のときだけ表示） */}
      {selected && (
        <CharacterModal
          character={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </main>
  );
}

// 絞り込み用プルダウン。先頭に「○○（すべて）」を置き、選ぶと value が変わる。
function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-blue-500 focus:outline-none"
    >
      <option value="">{label}（すべて）</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}
