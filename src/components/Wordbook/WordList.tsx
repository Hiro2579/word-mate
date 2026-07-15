"use client";

import WordItem from "./WordItem";

type Word = {
  id: number;
  word: string;
  created_at: string;
};

// 単語帳に保存された単語を表示
const WordList = ({
  words,
  setWords,
}: {
  //React.Dispatch<React.SetStateAction<Word[]>>はuseStateのsetStateの型
  words: Word[];
  setWords: React.Dispatch<React.SetStateAction<Word[]>>;
}) => {
  return (
    <div className="space-y-4">
      {words.map((word) => (
        <WordItem key={word.id} word={word} setWords={setWords} />
      ))}
    </div>
  );
};

export default WordList;
