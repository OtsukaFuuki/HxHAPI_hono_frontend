import { Character, toImageUrl } from "../lib/api";

// 一覧に並べるカード1枚。
// 画像を大きく上に、その下に名前。クリックすると（詳細ページへ遷移せず）
// 親から渡された onSelect を呼んでモーダルを開く。
export default function CharacterCard({
  character,
  onSelect,
}: {
  character: Character;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="group block w-full overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      {/* 画像（大きめ・正方形にトリミング） */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={toImageUrl(character.imageUrl)}
        alt={character.name}
        className="aspect-square w-full object-cover"
      />

      {/* 名前 */}
      <div className="p-3 text-center">
        <p className="font-bold text-gray-800 group-hover:text-blue-600">
          {character.name}
        </p>
      </div>
    </button>
  );
}
