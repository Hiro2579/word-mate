import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ word: string }> }
) {
  const { word } = await params;

  const apiKey = process.env.WORDS_API_KEY;
  if (!apiKey) {
    console.error("WORDS_API_KEY is not set");
    return NextResponse.json(
      { message: "Server configuration error" },
      { status: 500 }
    );
  }

  try {
    const res = await fetch(
      `https://wordsapiv1.p.rapidapi.com/words/${encodeURIComponent(word)}`,
      {
        headers: {
          "X-RapidAPI-Host": "wordsapiv1.p.rapidapi.com",
          "X-RapidAPI-Key": apiKey,
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("WordsAPI error:", res.status, text);

      return NextResponse.json(
        { message: "WordsAPI request failed" },
        { status: res.status }
      );
    }

    //WordsAPIからデータを取得
    const data = await res.json();

    return NextResponse.json(data, { status: 200 });
  } catch (e) {
    console.error("WordsAPI fetch error:", e);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
