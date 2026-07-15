interface TranslationResponse {
  translations: string[];
}

export const translateWithDeepL = async (
  texts: string[],
  targetLang: string,
  sourceLang?: string
): Promise<string[]> => {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      texts,
      targetLang,
      sourceLang,
    }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);

    throw new Error(body?.error ?? "翻訳に失敗しました");
  }

  const data = (await res.json()) as TranslationResponse;

  return data.translations;
};