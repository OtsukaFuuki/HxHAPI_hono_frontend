"use client"; // useEffect（スクロール制御）と onClick を使うのでクライアントコンポーネント

import { useEffect } from "react";
import { Character, toImageUrl } from "../lib/api";

// 一覧の上にかぶせて表示する詳細モーダル。
// 一覧APIが全項目を返すので、クリックされた character をそのまま受け取って表示する
// （詳細APIを叩き直す必要はない）。
export default function CharacterModal({
  character,
  onClose,
}: {
  character: Character;
  onClose: () => void;
}) {
  // モーダル表示中は背面（一覧）のスクロールを止める。
  // 閉じたら必ず元に戻す（クリーンアップ）。
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景を少し暗くするオーバーレイ。クリックで閉じる。 */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 詳細本体。画面より大きいときは中だけスクロール。 */}
      <article className="relative z-10 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white shadow-xl">
        {/* 閉じるボタン（×） */}
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
        >
          ✕
        </button>

        {/* 画像 */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={toImageUrl(character.imageUrl)}
          alt={character.name}
          className="aspect-square w-full object-cover"
        />

        <div className="space-y-4 p-6">
          <h2 className="text-2xl font-bold text-gray-800">{character.name}</h2>

          <dl className="grid grid-cols-3 gap-y-2 text-sm">
            <dt className="font-semibold text-gray-500">念系統</dt>
            <dd className="col-span-2 text-gray-800">{character.nenType}</dd>

            <dt className="font-semibold text-gray-500">所属</dt>
            <dd className="col-span-2 text-gray-800">{character.affiliation}</dd>

            <dt className="font-semibold text-gray-500">登場編</dt>
            <dd className="col-span-2 text-gray-800">{character.debutArc}</dd>
          </dl>

          <p className="border-t border-gray-100 pt-4 leading-relaxed text-gray-700">
            {character.description}
          </p>
        </div>
      </article>
    </div>
  );
}
