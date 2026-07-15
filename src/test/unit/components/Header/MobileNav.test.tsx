// __tests__/MobileNav.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { Session } from "@supabase/supabase-js";

// ====== モック定義（MobileNav import より前） ======

// next/link をシンプルな <a> にモック
jest.mock("next/link", () => ({
  __esModule: true,
  default: ({
    href,
    children,
    ...props
  }: React.ComponentProps<"a"> & { href?: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Button は <button> にして variant を data 属性に持たせる
jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    variant,
    ...props
  }: React.ComponentProps<"button"> & { variant?: string }) => (
    <button data-variant={variant} {...props}>
      {children}
    </button>
  ),
}));

// LogoutButton は存在確認用のダミー
jest.mock("../../../../components/Header/LogoutButton", () => ({
  __esModule: true,
  default: ({ isMobile }: { isMobile?: boolean }) => (
    <button data-testid="logout-button">
      Logout {isMobile ? "(mobile)" : ""}
    </button>
  ),
}));

// アイコンもダミー
jest.mock("lucide-react", () => ({
  Home: () => <span data-icon="home" />,
  BookOpen: () => <span data-icon="book-open" />,
  User: () => <span data-icon="user" />,
  Settings: () => <span data-icon="settings" />,
}));

// ====== ここでコンポーネントを import ======
import MobileNav from "../../../../components/Header/MobileNav";

// ====== テスト本体 ======

describe("MobileNav", () => {
  const createSession = (email: string | null): Session | null =>
    email
      ? ({
          user: {
            id: "user-id",
            email,
          },
        } as unknown as Session)
      : null;

  test("ログインしていない場合は Login が表示され、設定/Logout は表示されない", () => {
    const closeMenu = jest.fn();
    const isActive = (path: string) => path === "/";

    render(
      <MobileNav
        session={createSession(null)}
        isActive={isActive}
        closeMenu={closeMenu}
      />
    );

    // 共通のナビ
    expect(screen.getByText("検索")).toBeInTheDocument();
    expect(screen.getByText("単語帳")).toBeInTheDocument();

    // 未ログイン時は Login が出る
    expect(screen.getByText("Login")).toBeInTheDocument();

    // 設定と Logout は出ない
    expect(screen.queryByText("設定")).not.toBeInTheDocument();
    expect(screen.queryByTestId("logout-button")).not.toBeInTheDocument();
  });

  test("ログインしている場合は 設定 と Logout が表示され、Login は表示されない", () => {
    const closeMenu = jest.fn();
    const isActive = (path: string) => path === "/";

    render(
      <MobileNav
        session={createSession("test@example.com")}
        isActive={isActive}
        closeMenu={closeMenu}
      />
    );

    // 共通のナビ
    expect(screen.getByText("検索")).toBeInTheDocument();
    expect(screen.getByText("単語帳")).toBeInTheDocument();

    // ログイン時は 設定 と Logout が表示
    expect(screen.getByText("設定")).toBeInTheDocument();
    expect(screen.getByTestId("logout-button")).toBeInTheDocument();

    // Login は出ない
    expect(screen.queryByText("Login")).not.toBeInTheDocument();
  });

  test("isActive に応じて variant が切り替わる", () => {
    const closeMenu = jest.fn();
    const isActive = (path: string) => path === "/wordbook";

    render(
      <MobileNav
        session={createSession(null)}
        isActive={isActive}
        closeMenu={closeMenu}
      />
    );

    const searchButton = screen.getByText("検索").closest("button");
    const wordbookButton = screen.getByText("単語帳").closest("button");

    expect(searchButton).toHaveAttribute("data-variant", "ghost");
    expect(wordbookButton).toHaveAttribute("data-variant", "default");
  });

  test("各リンクをクリックすると closeMenu が呼ばれる（未ログイン時）", () => {
    const closeMenu = jest.fn();
    const isActive = () => false;

    render(
      <MobileNav
        session={createSession(null)}
        isActive={isActive}
        closeMenu={closeMenu}
      />
    );

    // 検索リンク
    const searchLink = screen.getByRole("link", { name: /検索/ });
    fireEvent.click(searchLink);

    // 単語帳リンク
    const wordbookLink = screen.getByRole("link", { name: /単語帳/ });
    fireEvent.click(wordbookLink);

    // Login リンク
    const loginLink = screen.getByRole("link", { name: /Login/ });
    fireEvent.click(loginLink);

    expect(closeMenu).toHaveBeenCalledTimes(3);
  });

  test("各リンクをクリックすると closeMenu が呼ばれる（ログイン時）", () => {
    const closeMenu = jest.fn();
    const isActive = () => false;

    render(
      <MobileNav
        session={createSession("test@example.com")}
        isActive={isActive}
        closeMenu={closeMenu}
      />
    );

    // 検索リンク
    const searchLink = screen.getByRole("link", { name: /検索/ });
    fireEvent.click(searchLink);

    // 単語帳リンク
    const wordbookLink = screen.getByRole("link", { name: /単語帳/ });
    fireEvent.click(wordbookLink);

    // 設定リンク
    const settingsLink = screen.getByRole("link", { name: /設定/ });
    fireEvent.click(settingsLink);

    expect(closeMenu).toHaveBeenCalledTimes(3);
  });
});
