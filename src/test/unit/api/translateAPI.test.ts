/**
 * @jest-environment node
 */

import { NextRequest } from "next/server";
import { POST } from "@/app/api/translate/route"; // 実際のパスに合わせて変更

describe("POST /api/translate - error handling", () => {
  const originalApiKey = process.env.DEEPL_API_KEY;
  const originalFetch = global.fetch;

  const createRequest = (body: unknown): NextRequest => {
    return new NextRequest("http://localhost:3000/api/translate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DEEPL_API_KEY = "test-api-key";
    global.fetch = jest.fn();
  });

  afterAll(() => {
    process.env.DEEPL_API_KEY = originalApiKey;
    global.fetch = originalFetch;
  });

  it("texts が配列でない場合は 400 を返す", async () => {
    const request = createRequest({
      texts: "hello",
      targetLang: "JA",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "texts must be a non-empty array",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("texts が空配列の場合は 400 を返す", async () => {
    const request = createRequest({
      texts: [],
      targetLang: "JA",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "texts must be a non-empty array",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("texts が存在しない場合は 400 を返す", async () => {
    const request = createRequest({
      targetLang: "JA",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "texts must be a non-empty array",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("texts が 50件を超える場合は 400 を返す", async () => {
    const request = createRequest({
      texts: Array.from({ length: 51 }, (_, index) => `text-${index}`),
      targetLang: "JA",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "Up to 50 texts can be translated at once",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("targetLang が存在しない場合は 400 を返す", async () => {
    const request = createRequest({
      texts: ["hello"],
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "targetLang is required",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("targetLang が空文字の場合は 400 を返す", async () => {
    const request = createRequest({
      texts: ["hello"],
      targetLang: "",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: "targetLang is required",
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("DEEPL_API_KEY が設定されていない場合は 500 を返す", async () => {
    delete process.env.DEEPL_API_KEY;

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    const request = createRequest({
      texts: ["hello"],
      targetLang: "JA",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: "DeepL API key is not configured",
    });
    expect(global.fetch).not.toHaveBeenCalled();

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "DEEPL_API_KEY is not configured"
    );

    consoleErrorSpy.mockRestore();
  });

  it("DeepL API がエラーを返した場合は、そのステータスコードを返す", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
      text: jest.fn().mockResolvedValue("Authorization failed"),
    });

    const request = createRequest({
      texts: ["hello"],
      targetLang: "JA",
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data).toEqual({
      error: "Failed to fetch from DeepL",
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith("DeepL API error:", {
      status: 403,
      body: "Authorization failed",
    });

    consoleErrorSpy.mockRestore();
  });
});