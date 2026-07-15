// DesktopNav.test.tsx

import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import type { Session } from "@supabase/supabase-js";
import DesktopNav from "../../../../components/Header/DesktopNav";

const mockPush = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

jest.mock("next/link", () => {
  return function MockLink({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) {
    return <a href={href}>{children}</a>;
  };
});

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    variant,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "ghost";
  }) => (
    <button data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

jest.mock("../../../../components/Header/LogoutButton", () => ({
  __esModule: true,
  default: () => <button type="button">ログアウト</button>,
}));

const mockSession: Session = {
  access_token: "test-access-token",
  refresh_token: "test-refresh-token",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
  user: {
    id: "test-user-id",
    app_metadata: {},
    user_metadata: {
      full_name: "テストユーザー",
    },
    aud: "authenticated",
    email: "test@example.com",
    created_at: new Date().toISOString(),
  },
};

describe("DesktopNav", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("共通ナビゲーション", () => {
    test("検索と単語帳のリンクが表示される", () => {
      render(<DesktopNav session={null} isActive={() => false} />);

      expect(
        screen.getByRole("link", { name: /検索/ }),
      ).toHaveAttribute("href", "/");

      expect(
        screen.getByRole("link", { name: /単語帳/ }),
      ).toHaveAttribute("href", "/wordbook");
    });
  });

  describe("アクティブ状態", () => {
    test("検索ページがアクティブな場合、検索ボタンのvariantがdefaultになる", () => {
      const isActive = jest.fn((path: string) => path === "/");

      render(<DesktopNav session={null} isActive={isActive} />);

      expect(
        screen.getByRole("button", { name: /検索/ }),
      ).toHaveAttribute("data-variant", "default");

      expect(
        screen.getByRole("button", { name: /単語帳/ }),
      ).toHaveAttribute("data-variant", "ghost");
    });

    test("単語帳ページがアクティブな場合、単語帳ボタンのvariantがdefaultになる", () => {
      const isActive = jest.fn((path: string) => path === "/wordbook");

      render(<DesktopNav session={null} isActive={isActive} />);

      expect(
        screen.getByRole("button", { name: /検索/ }),
      ).toHaveAttribute("data-variant", "ghost");

      expect(
        screen.getByRole("button", { name: /単語帳/ }),
      ).toHaveAttribute("data-variant", "default");
    });

    test("未ログイン時に認証ページがアクティブならログインボタンがdefaultになる", () => {
      const isActive = jest.fn((path: string) => path === "/auth");

      render(<DesktopNav session={null} isActive={isActive} />);

      expect(
        screen.getByRole("button", { name: /ログイン/ }),
      ).toHaveAttribute("data-variant", "default");
    });
  });

  describe("未ログイン時", () => {
    test("ログインリンクが表示される", () => {
      render(<DesktopNav session={null} isActive={() => false} />);

      expect(
        screen.getByRole("link", { name: /ログイン/ }),
      ).toHaveAttribute("href", "/auth");
    });

    test("ユーザーメニューが表示されない", () => {
      render(<DesktopNav session={null} isActive={() => false} />);

      expect(
        screen.queryByRole("button", { name: /テストユーザー/ }),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByText("パスワードを変更する"),
      ).not.toBeInTheDocument();

      expect(
        screen.queryByRole("button", { name: "ログアウト" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("ログイン時", () => {
    test("ユーザー名が表示され、ログインリンクは表示されない", () => {
      render(
        <DesktopNav session={mockSession} isActive={() => false} />,
      );

      expect(
        screen.getByRole("button", { name: /テストユーザー/ }),
      ).toBeInTheDocument();

      expect(
        screen.queryByRole("link", { name: /ログイン/ }),
      ).not.toBeInTheDocument();
    });

    test("ユーザーメニューを開くとメールアドレスとパスワード変更メニューが表示される", async () => {
      const user = userEvent.setup();

      render(
        <DesktopNav session={mockSession} isActive={() => false} />,
      );

      await user.click(
        screen.getByRole("button", { name: /テストユーザー/ }),
      );

      expect(screen.getByText("test@example.com")).toBeInTheDocument();

      expect(
        screen.getByText("パスワードを変更する"),
      ).toBeInTheDocument();
    });
  });

  describe("パスワード変更", () => {
    test("パスワードを変更するをクリックすると/settingsに遷移する", async () => {
      const user = userEvent.setup();

      render(
        <DesktopNav session={mockSession} isActive={() => false} />,
      );

      await user.click(
        screen.getByRole("button", { name: /テストユーザー/ }),
      );

      await user.click(
        screen.getByText("パスワードを変更する"),
      );

      expect(mockPush).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/settings");
    });
  });

  describe("ログアウトボタン", () => {
    test("ログイン時にユーザーメニューを開くとログアウトボタンが表示される", async () => {
      const user = userEvent.setup();

      render(
        <DesktopNav session={mockSession} isActive={() => false} />,
      );

      await user.click(
        screen.getByRole("button", { name: /テストユーザー/ }),
      );

      expect(
        screen.getByRole("button", { name: "ログアウト" }),
      ).toBeInTheDocument();
    });
  });
});