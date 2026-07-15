// __tests__/AuthTabs.test.tsx
import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// ===== モック定義（AuthTabs を import する前に） =====

// Tabs 系は単純なラッパーにモック
jest.mock("@/components/ui/tabs", () => ({
  Tabs: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs">{children}</div>
  ),
  TabsList: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tabs-list">{children}</div>
  ),
  TabsTrigger: ({
    children,
    ...props
  }: React.ComponentProps<"button"> & { children: React.ReactNode }) => (
    <button data-testid="tabs-trigger" {...props}>
      {children}
    </button>
  ),
  TabsContent: ({
    children,
    ...props
  }: React.ComponentProps<"div"> & { children: React.ReactNode }) => (
    <div data-testid="tabs-content" {...props}>
      {children}
    </div>
  ),
}));

// Card 系も単純なラッパー
jest.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    ...props
  }: React.ComponentProps<"div"> & { children: React.ReactNode }) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({
    children,
    ...props
  }: React.ComponentProps<"div"> & { children: React.ReactNode }) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
}));

// LoginForm / SignupForm をモックして props を検証できるようにする
const mockLoginForm = jest.fn(({ isLoading }: { isLoading: boolean }) => (
  <div data-testid="login-form">LoginForm isLoading={String(isLoading)}</div>
));
const mockSignupForm = jest.fn(({ isLoading }: { isLoading: boolean }) => (
  <div data-testid="signup-form">SignupForm isLoading={String(isLoading)}</div>
));

jest.mock("../../../../components/Auth/LoginForm", () => ({
  __esModule: true,
  default: (props: {
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
  }) => mockLoginForm(props),
}));

jest.mock("../../../../components/Auth/SignupForm", () => ({
  __esModule: true,
  default: (props: {
    isLoading: boolean;
    setIsLoading: (value: boolean) => void;
  }) => mockSignupForm(props),
}));

// ===== テスト対象コンポーネント =====
import AuthTabs from "../../../../components/Auth/AuthTabs";

describe("AuthTabs", () => {
  const setIsLoadingMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("カードとタブの基本構造が表示される", () => {
    render(<AuthTabs isLoading={false} setIsLoading={setIsLoadingMock} />);

    // Card / CardContent が存在する
    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByTestId("card-content")).toBeInTheDocument();

    // Tabs と TabsList が存在する
    expect(screen.getByTestId("tabs")).toBeInTheDocument();
    expect(screen.getByTestId("tabs-list")).toBeInTheDocument();

    // タブのトリガーが 2 つ（Login / Sign Up）ある
    const triggers = screen.getAllByTestId("tabs-trigger");
    expect(triggers).toHaveLength(2);
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });
});
