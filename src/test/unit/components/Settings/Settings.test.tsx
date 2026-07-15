import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import Settings from "../../../../components/Settings/Settings";

// next/navigation の useRouter をモック
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

// Supabase クライアントをモック
const getSessionMock = jest.fn();
jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: getSessionMock,
    },
  }),
}));

describe("Settings", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // 常にログイン済みのセッションを返すモック
    getSessionMock.mockResolvedValue({
      data: {
        session: {
          user: {
            email: "test@example.com",
            user_metadata: {
              full_name: "Test User",
            },
          },
        },
      },
    });
  });

  test("アカウント設定画面の基本的なテキストが表示される", async () => {
    render(<Settings />);

    expect(await screen.findByText("アカウント設定")).toBeInTheDocument();
    expect(
      screen.getByText("Manage your account settings and preferences")
    ).toBeInTheDocument();
    expect(screen.getByText("ユーザー情報")).toBeInTheDocument();
    expect(screen.getByText("Username")).toBeInTheDocument();
    expect(screen.getByText("Email")).toBeInTheDocument();
    expect(screen.getByText("パスワードを変更する")).toBeInTheDocument();
    expect(screen.getByText("アカウントを削除する")).toBeInTheDocument();
  });

  test("Supabase のセッションから取得した username と email が表示される", async () => {
    render(<Settings />);

    expect(await screen.findByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("test@example.com")).toBeInTheDocument();
  });
});
