"use client";

import { Volume2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import DeleteWordButton from "./DeleteWordButton";
import { wordRepository } from "../../lib/wordbook";
import { speakEnglish } from "../../lib/speakEnglish";

type Word = {
  id: number;
  word: string;
  created_at: string;
};

// 単語帳に保存された単語を表示
const WordItem = ({
  word,
  setWords,
}: {
  //React.Dispatch<React.SetStateAction<Word[]>>はuseStateのsetStateの型
  word: Word;
  setWords: React.Dispatch<React.SetStateAction<Word[]>>;
}) => {
  // 単語を削除する処理
  const handleDeleteWord = async () => {
    await wordRepository.delete(word.id);
    setWords((prev) => prev.filter((w) => w.id !== word.id));
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-gray-800">{word.word}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => speakEnglish(word.word)}
              >
                <Volume2 className="w-4 h-4" />
              </Button>
            </div>
            {/* 単語を保存した日時を表示 */}
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              Added on {new Date(word.created_at).toLocaleDateString()}
            </div>
          </div>
          <DeleteWordButton onDelete={handleDeleteWord} word={word.word} />
        </div>
      </CardContent>
    </Card>
  );
};

export default WordItem;
