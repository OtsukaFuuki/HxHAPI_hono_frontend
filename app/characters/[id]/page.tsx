"use client"; // SWR とルートパラメータ(useParams)を使うのでクライアントコンポーネント

import Link from "next/link";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { API_BASE, Character, fetcher, toImageUrl } from "../../lib/api";

export default function CharacterDetail() {
  // URLの [id] 部分を取り出す。例: /characters/1 → { id: "1" }
  const params = useParams<{ id: string }>();
  const id = params.id;

  // 詳細APIを叩く。id が無い間は null を渡して取得を止める
  const { data, error, isLoading } = useSWR<Character>(
    id ? `${API_BASE}/api/v1/characters/${id}` : null,
    fetcher
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* 一覧へ戻るリンク */}
        <Link
          href="/"
          className="mb-6 inline-block text-blue-600 hover:underline"
        >
          ← 一覧に戻る
        </Link>

        {/* 取得中 */}
        {isLoading && <p className="text-gray-500">読み込み中...</p>}

        {/* 失敗時(存在しないID=404 もここに来る) */}
        {error && (
          <p className="text-red-500">キャラクターが見つかりませんでした</p>
        )}

        {/* 取得成功 → 詳細を表示 */}
        {data && (
          <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={toImageUrl(data.imageUrl)}
              alt={data.name}
              className="aspect-square w-full object-cover"
            />

            <div className="space-y-4 p-6">
              <h1 className="text-2xl font-bold text-gray-800">{data.name}</h1>

              <dl className="grid grid-cols-3 gap-y-2 text-sm">
                <dt className="font-semibold text-gray-500">念系統</dt>
                <dd className="col-span-2 text-gray-800">{data.nenType}</dd>

                <dt className="font-semibold text-gray-500">所属</dt>
                <dd className="col-span-2 text-gray-800">{data.affiliation}</dd>

                <dt className="font-semibold text-gray-500">登場編</dt>
                <dd className="col-span-2 text-gray-800">{data.debutArc}</dd>
              </dl>

              <p className="border-t border-gray-100 pt-4 leading-relaxed text-gray-700">
                {data.description}
              </p>
            </div>
          </article>
        )}
      </div>
    </main>
  );
}
