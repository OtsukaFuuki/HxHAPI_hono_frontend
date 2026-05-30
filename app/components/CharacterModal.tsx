"use client"; // useEffect（スクロール制御）と onClick を使うのでクライアントコンポーネント

import { useEffect, useState } from "react";
import { Character, toImageUrl } from "../lib/api";

// 一覧の上にかぶせて表示する詳細モーダル。
// 一覧APIが全項目を返すので、クリックされた character をそのまま受け取って表示する
// （詳細APIを叩き直す必要はない）。
// onPrev / onNext が渡されたときだけ、左右の矢印で前後のキャラに移動できる。
export default function CharacterModal({
  character,
  onClose,
  onPrev,
  onNext,
}: {
  character: Character;
  onClose: () => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  // 直前の移動方向。アニメを「右から／左から」出し分けるのに使う。
  const [dir, setDir] = useState<"next" | "prev">("next");

  // 移動方向を記録してから、親に前後の切り替えを依頼する。
  const handlePrev = () => {
    setDir("prev");
    onPrev?.();
  };
  const handleNext = () => {
    setDir("next");
    onNext?.();
  };

  // モーダル表示中は背面（一覧）のスクロールを止める。
  // 閉じたら必ず元に戻す（クリーンアップ）。
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // キーボード操作：← 前へ / → 次へ / Esc 閉じる。
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") handlePrev();
      else if (e.key === "ArrowRight") handleNext();
      else if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // handlePrev/handleNext は毎レンダー作り直されるが、実体の依存は下記の3つ。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onPrev, onNext, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景を少し暗くするオーバーレイ。クリックで閉じる。 */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden="true"
      />

      {/*
        詳細本体。SP/PC共通で縦並び（上段＝画像＋基本情報の横並び → 説明 → 念能力）。
        - 横スクロールは出さない（overflow-hidden）
        - 高さを固定（h-[640px]）してキャラごとにダイアログの大きさが変わらないようにする。
          画面が小さい端末でははみ出さないよう max-h-[90vh] で保険をかける。
        - 文章が長いキャラは中身だけがスクロールするので、外枠のサイズは一定。
      */}
      <article className="relative z-10 flex h-[640px] max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        {/* 閉じるボタン（×） */}
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70"
        >
          ✕
        </button>

        {/* 詳細。内容が長いキャラはここがスクロールする。
            key を character.id にすることで、キャラが変わるたびに作り直され、
            anim-slide-* のアニメが再生される（スクロール位置も先頭に戻る）。 */}
        <div
          key={character.id}
          className={`min-h-0 flex-1 space-y-4 overflow-y-auto p-6 ${
            dir === "next" ? "anim-slide-next" : "anim-slide-prev"
          }`}
        >
          {/* 上段：「画像｜名前・念系統など」を横並び（SP/PC共通）。 */}
          <div className="flex gap-4">
            {/* 正方形の画像（PCでは少し大きく） */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={toImageUrl(character.imageUrl)}
              alt={character.name}
              className="h-40 w-40 shrink-0 rounded-lg object-cover object-top md:h-56 md:w-56"
            />

            {/* 名前・念系統・説明（SPでは画像の右側に回り込む） */}
            <div className="min-w-0 flex-1 space-y-4">
              <div>
                <h2 className="pr-8 text-lg font-bold text-gray-800 md:text-xl">
                  {character.name}
                </h2>
                {/* 英語名（あれば名前の下に小さく） */}
                {character.englishName && (
                  <p className="text-xs text-gray-400">{character.englishName}</p>
                )}
              </div>

              <dl className="grid grid-cols-3 gap-y-2 text-xs md:text-sm">
                <dt className="font-semibold text-gray-500">念系統</dt>
                <dd className="col-span-2 text-gray-800">{character.nenType}</dd>

                {/* 性別（あるときだけ表示） */}
                {character.gender && (
                  <>
                    <dt className="font-semibold text-gray-500">性別</dt>
                    <dd className="col-span-2 text-gray-800">{character.gender}</dd>
                  </>
                )}

                <dt className="font-semibold text-gray-500">所属</dt>
                <dd className="col-span-2 text-gray-800">{character.affiliation}</dd>

                <dt className="font-semibold text-gray-500">登場編</dt>
                <dd className="col-span-2 text-gray-800">{character.debutArc}</dd>
              </dl>
            </div>
          </div>

          {/* 説明文は横並びブロックの下に全幅で配置（SP/md共通） */}
          <p className="border-t border-gray-100 pt-4 text-sm leading-relaxed text-gray-700">
            {character.description}
          </p>

          {/* 念能力（持っているキャラだけ表示） */}
          {character.nenAbility && (
            <section className="border-t border-gray-100 pt-4">
              <h3 className="mb-1 text-xs font-semibold text-gray-400">念能力</h3>
              <p className="text-base font-bold text-gray-800">
                {character.nenAbility.name}
                {character.nenAbility.reading && (
                  <span className="ml-2 text-xs font-normal text-gray-400">
                    （{character.nenAbility.reading}）
                  </span>
                )}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-gray-700">
                {character.nenAbility.description}
              </p>

              {/* 技一覧（あれば） */}
              {character.nenAbility.techniques.length > 0 && (
                <ul className="mt-4 space-y-3">
                  {character.nenAbility.techniques.map((tech) => (
                    <li key={tech.name} className="rounded-lg bg-gray-50 p-3">
                      <p className="text-sm font-semibold text-gray-800">
                        {tech.name}
                        {tech.reading && (
                          <span className="ml-2 text-xs font-normal text-gray-400">
                            （{tech.reading}）
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-600">
                        {tech.description}
                      </p>
                    </li>
                  )              )}
            </ul>
          )}
            </section>
          )}
        </div>

        {/* フッター：前へ／次へ のナビゲーション（onPrev/onNext があるときだけ表示）。
            カード内に固定で置くので、中身をスクロールしても常に見える。 */}
        {(onPrev || onNext) && (
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-gray-100 bg-white/80 px-4 py-3 backdrop-blur">
            <button
              type="button"
              onClick={handlePrev}
              disabled={!onPrev}
              aria-label="前のキャラクター"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="text-lg leading-none">‹</span>
              前へ
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={!onNext}
              aria-label="次のキャラクター"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              次へ
              <span className="text-lg leading-none">›</span>
            </button>
          </div>
        )}
      </article>
    </div>
  );
}
