import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BookOpen } from "lucide-react";
import { Badge } from "../ui/badge";

// 単語帳に保存された単語の総数を表示
type WordbookInfoProps = {
  wordsLength: number;
};

const WordbookInfo = ({ wordsLength }: WordbookInfoProps) => {
  return (
    <div className="mb-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600" />
            単語総数
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="secondary" className="text-sm">
              {wordsLength} save words
            </Badge>
            <p className="text-gray-600 text-sm">
              新しい単語を保存して語彙を増やし続けましょう！
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WordbookInfo;
