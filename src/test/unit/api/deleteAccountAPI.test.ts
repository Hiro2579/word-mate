// route.test.ts
import { POST } from "../../../app/api/account/delete/route";
import { NextResponse } from "next/server";
import { cookies as cookiesOriginal } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient as createAdmin } from "@supabase/supabase-js";

jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn(),
  },
}));

jest.mock("next/headers", () => ({
  cookies: jest.fn(),
}));

jest.mock("@supabase/ssr", () => ({
  createServerClient: jest.fn(),
}));

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

// 型エイリアス
const jsonMock = NextResponse.json as unknown as jest.Mock;
const cookiesMock = cookiesOriginal as unknown as jest.Mock;
const createServerClientMock = createServerClient as unknown as jest.Mock;
const createAdminMock = createAdmin as unknown as jest.Mock;

// 共通で使うモックオブジェクト
const getUserMock = jest.fn();
const signInWithPasswordMock = jest.fn();
const deleteUserMock = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();

  // cookies() が返す CookieStore 的なものをモック
  cookiesMock.mockResolvedValue({
    getAll: jest.fn().mockReturnValue([]),
    set: jest.fn(),
  });

  // supabase server client のモック
  createServerClientMock.mockReturnValue({
    auth: {
      getUser: getUserMock,
      signInWithPassword: signInWithPasswordMock,
    },
  });

  // admin client のモック
  createAdminMock.mockReturnValue({
    auth: {
      admin: {
        deleteUser: deleteUserMock,
      },
    },
  });
});

// request.json をモックしやすくするヘルパー
const makeRequest = (body: any): Request =>
  ({
    json: jest.fn().mockResolvedValue(body),
  } as any);

describe("POST /api/delete-account", () => {
  test("不正なJSONなら 400 が返る", async () => {
    // json() が throw するパターン
    const badRequest = {
      json: jest.fn().mockRejectedValue(new Error("invalid json")),
    } as any;

    await POST(badRequest);

    expect(jsonMock).toHaveBeenCalledWith(
      { ok: false, message: "不正なリクエストです。" },
      { status: 400 }
    );
  });

  test("パスワードが空なら 400 が返る", async () => {
    const request = makeRequest({ password: "" });

    await POST(request);

    expect(jsonMock).toHaveBeenCalledWith(
      { ok: false, message: "パスワードが入力されていません。" },
      { status: 400 }
    );
  });

  test("ユーザーに email が無ければ 400 が返る", async () => {
    const request = makeRequest({ password: "secret" });

    getUserMock.mockResolvedValue({
      data: { user: { id: "user-id", email: null } },
      error: null,
    });

    await POST(request);

    expect(jsonMock).toHaveBeenCalledWith(
      { ok: false, message: "ユーザー情報の取得に失敗しました。" },
      { status: 400 }
    );
  });

  test("パスワードが違うと 400 が返る", async () => {
    const request = makeRequest({ password: "wrong-pass" });

    getUserMock.mockResolvedValue({
      data: { user: { id: "user-id", email: "test@example.com" } },
      error: null,
    });

    signInWithPasswordMock.mockResolvedValue({
      data: {},
      error: { message: "Invalid password" },
    });

    await POST(request);

    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "wrong-pass",
    });

    expect(jsonMock).toHaveBeenCalledWith(
      { ok: false, message: "パスワードが違います。" },
      { status: 400 }
    );
  });

  test("削除に失敗したら 400 が返る", async () => {
    const request = makeRequest({ password: "correct-pass" });

    getUserMock.mockResolvedValue({
      data: { user: { id: "user-id", email: "test@example.com" } },
      error: null,
    });

    signInWithPasswordMock.mockResolvedValue({
      data: {},
      error: null,
    });

    deleteUserMock.mockResolvedValue({
      data: null,
      error: { message: "delete error" },
    });

    await POST(request);

    expect(deleteUserMock).toHaveBeenCalledWith("user-id");

    expect(jsonMock).toHaveBeenCalledWith(
      {
        ok: false,
        message: "delete error",
      },
      { status: 400 }
    );
  });

  test("正常系：ok: true が返る", async () => {
    const request = makeRequest({ password: "correct-pass" });

    getUserMock.mockResolvedValue({
      data: { user: { id: "user-id", email: "test@example.com" } },
      error: null,
    });

    signInWithPasswordMock.mockResolvedValue({
      data: {},
      error: null,
    });

    deleteUserMock.mockResolvedValue({
      data: {},
      error: null,
    });

    await POST(request);

    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: "test@example.com",
      password: "correct-pass",
    });
    expect(deleteUserMock).toHaveBeenCalledWith("user-id");

    expect(jsonMock).toHaveBeenCalledWith({ ok: true });
  });
});
