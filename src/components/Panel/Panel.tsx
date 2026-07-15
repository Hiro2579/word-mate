"use client";

import React, { useEffect, useState } from "react";
import { createClient } from "../../lib/supabase/client";
import { wordRepository } from "../../lib/wordbook";
import SearchInput from "./SearchInput";
import WordActions from "./WordActions";
import WordDetailCard from "./WordDetailCard";
import { Search } from "lucide-react";
import { translateWithDeepL } from "../../lib/deepl";

interface WordResult {
  definition: string;
  partOfSpeech: string;
  synonyms: string[];
  typeOf: string[];
  hasTypes: string[];
  derivation: string[];
  examples: string[];
}

interface SearchResult {
  word: string;
  pronunciation: {
    all: string;
  };
  frequency: number;
  syllables: {
    count: number;
    list: string[];
  };
  results: WordResult[];
}

const supabase = createClient();

const Panel = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [formWord, setFormWord] = useState("");
  const [translations, setTranslations] = useState<string[]>([]);
  const [isTranslating, setIsTranslating] = useState(false);

  // ログイン状態であればユーザーIDを取得
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data.session?.user?.id ?? null);
    });
  }, []);

  // 単語の詳細を取得
  const getWordDetails = async () => {
    const normalizedSearchTerm = searchTerm.trim();

    if (!normalizedSearchTerm) return;

    setIsLoading(true);
    setIsTranslating(false);
    setTranslations([]);
    setSearchResult(null);
    setIsSaved(false);

    try {
      const res = await fetch(
        `/api/words/${encodeURIComponent(normalizedSearchTerm)}`
      );

      if (!res.ok) {
        const body = await res.json().catch(() => null);

        console.error(
          "Search API error:",
          body?.message ?? body?.error ?? res.status
        );

        return;
      }

      const data: SearchResult = await res.json();

      setFormWord(normalizedSearchTerm);
      setSearchResult(data);

      // 定義をすべて取り出し、翻訳APIを1回だけ呼ぶ
      const definitions = data.results.map((result) => result.definition);

      if (definitions.length > 0) {
        setIsTranslating(true);

        try {
          const translatedDefinitions = await translateWithDeepL(
            definitions,
            "JA",
            "EN"
          );

          setTranslations(translatedDefinitions);
        } catch (error) {
          console.error("Translation error:", error);

          // 翻訳に失敗しても英語の検索結果は表示する
          setTranslations([]);
        } finally {
          setIsTranslating(false);
        }
      }

      if (userId) {
        const { data: existingWords, error } = await supabase
          .from("words")
          .select("id")
          .eq("user_id", userId)
          .eq("word", normalizedSearchTerm)
          .limit(1);

        if (error) {
          console.error(error);
        }

        setIsSaved(Boolean(existingWords?.length));
      }
    } catch (error) {
      console.error(error);
      setSearchResult(null);
      setTranslations([]);
      setIsSaved(false);
    } finally {
      setIsLoading(false);
    }
  };

  // 単語を単語帳に保存
  const handleSaveWord = async () => {
    if (!userId) return;
    await wordRepository.create(searchTerm, userId);
    setIsSaved(true);
  };

  return (
    <>
      {/* 左パネル */}
      <div className="w-full lg:w-1/2 bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            英語の単語を検索する
          </h1>
          <p className="text-gray-600 mb-8">
            英語の単語を入力すると、詳細な定義と例文が表示されます。
          </p>

          <SearchInput
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            isLoading={isLoading}
            onSearch={getWordDetails}
          />

          {searchResult && userId != null && (
            <WordActions
              isSaved={isSaved}
              onSave={handleSaveWord}
              searchTerm={searchTerm}
              formWord={formWord}
              hasUser={!!userId}
            />
          )}
        </div>
      </div>

      {/* 右パネル */}
      <div className="w-full lg:w-1/2 bg-white p-6 overflow-y-auto">
        {searchResult ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {searchResult.results.map((result, index) => (
              <WordDetailCard
                key={`${searchResult.word}-${index}`}
                word={searchResult.word}
                pronunciation={searchResult.pronunciation.all}
                result={result}
                translatedDefinition={translations[index] ?? ""}
                isTranslating={isTranslating}
              />
            ))}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">
                英語の単語を検索する
              </h3>
              <p className="text-gray-500">
                英語の単語を入力すると、詳細な定義と例文が表示されます。
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Panel;
