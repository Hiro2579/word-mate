"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BookOpen, Loader2, Volume2 } from "lucide-react";
import { speakEnglish } from "../../lib/speakEnglish";

interface WordResult {
  definition: string;
  partOfSpeech: string;
  synonyms: string[];
  typeOf: string[];
  derivation: string[];
  examples: string[];
}

interface WordDetailCardProps {
  word: string;
  pronunciation: string;
  result: WordResult;
  translatedDefinition: string;
  isTranslating: boolean;
}

const WordDetailCard = ({
  word,
  pronunciation,
  result,
  translatedDefinition,
  isTranslating,
}: WordDetailCardProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl">
          <BookOpen className="w-6 h-6 text-blue-600" />

          {word}

          <Badge variant="secondary" className="text-sm">
            {result.partOfSpeech}
          </Badge>
        </CardTitle>

        <p className="text-gray-500 text-lg">/{pronunciation}/</p>
      </CardHeader>

      <CardContent className="space-y-4 text-gray-700">
        <div>
          <h3 className="font-semibold">意味:</h3>
          <p>{result.definition}</p>

          {isTranslating ? (
            <div className="flex items-center gap-2 mt-2">
              <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
              <span className="text-sm text-gray-500">翻訳中...</span>
            </div>
          ) : translatedDefinition ? (
            <p className="mt-2">{translatedDefinition}</p>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              日本語訳を取得できませんでした。
            </p>
          )}
        </div>

        {result.examples?.length > 0 && (
          <div>
            <h3 className="font-semibold">例文:</h3>
            <p className="italic">{result.examples.join(", ")}</p>
          </div>
        )}

        {result.synonyms?.length > 0 && (
          <div>
            <h3 className="font-semibold">類義語:</h3>
            <p className="italic">{result.synonyms.join(", ")}</p>
          </div>
        )}

        {result.typeOf?.length > 0 && (
          <div>
            <h3 className="font-semibold">上位語:</h3>
            <p className="italic">{result.typeOf.join(", ")}</p>
          </div>
        )}

        {result.derivation?.length > 0 && (
          <div>
            <h3 className="font-semibold">派生語:</h3>
            <p className="italic">{result.derivation.join(", ")}</p>
          </div>
        )}

        <Button
          onClick={() => speakEnglish(word)}
          variant="outline"
          size="sm"
          className="flex gap-2"
        >
          <Volume2 className="w-4 h-4" />
          Listen
        </Button>
      </CardContent>
    </Card>
  );
};

export default WordDetailCard;