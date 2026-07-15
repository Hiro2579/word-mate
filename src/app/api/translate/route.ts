import { NextRequest, NextResponse } from "next/server";

interface TranslationRequest {
  texts: string[];
  targetLang: string;
  sourceLang?: string;
}

interface DeepLResponse {
  translations: {
    detected_source_language: string;
    text: string;
  }[];
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as TranslationRequest;
    const { texts, targetLang, sourceLang } = body;

    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { error: "texts must be a non-empty array" },
        { status: 400 }
      );
    }

    if (texts.length > 50) {
      return NextResponse.json(
        { error: "Up to 50 texts can be translated at once" },
        { status: 400 }
      );
    }

    if (!targetLang) {
      return NextResponse.json(
        { error: "targetLang is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPL_API_KEY;

    if (!apiKey) {
      console.error("DEEPL_API_KEY is not configured");

      return NextResponse.json(
        { error: "DeepL API key is not configured" },
        { status: 500 }
      );
    }

    const params = new URLSearchParams();

    texts.forEach((text) => {
      params.append("text", text);
    });

    params.append("target_lang", targetLang);

    if (sourceLang) {
      params.append("source_lang", sourceLang);
    }

    const res = await fetch("https://api-free.deepl.com/v2/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `DeepL-Auth-Key ${apiKey}`,
      },
      body: params.toString(),
      cache: "no-store",
    });

    if (!res.ok) {
      const errorText = await res.text();

      console.error("DeepL API error:", {
        status: res.status,
        body: errorText,
      });

      return NextResponse.json(
        { error: "Failed to fetch from DeepL" },
        { status: res.status }
      );
    }

    const data = (await res.json()) as DeepLResponse;

    const translations = data.translations.map(
      (translation) => translation.text
    );

    return NextResponse.json({ translations });
  } catch (error) {
    console.error("API 例外:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}