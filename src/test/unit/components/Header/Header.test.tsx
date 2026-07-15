import React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { Session } from "@supabase/supabase-js";
import Header from "../../../../components/Header/Header";

const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockUnsubscribe = jest.fn();

let authStateChangeCallback:
  | ((event: string, session: Session | null) => void)
  | undefined;

jest.mock("../../../../lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
  }),
}));

jest.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

jest.mock("next/link", () => {
  return function MockLink({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    children: React.ReactNode;
  }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock("../../../../components/Header/DesktopNav", () => {
  return function MockDesktopNav({
    session,
  }: {
    session: Session | null;
  }) {
    return (
      <div data-testid="desktop-nav">
        {session ? "logged-in" : "logged-out"}
      </div>
    );
  };
});

jest.mock("../../../../components/Header/MobileNav", () => {
  return function MockMobileNav() {
    return <div data-testid="mobile-nav">Mobile Nav</div>;
  };
});

describe("Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockGetSession.mockResolvedValue({
      data: {
        session: null,
      },
    });

    mockOnAuthStateChange.mockImplementation(
      (
        callback: (event: string, session: Session | null) => void
      ) => {
        authStateChangeCallback = callback;

        return {
          data: {
            subscription: {
              unsubscribe: mockUnsubscribe,
            },
          },
        };
      }
    );
  });

  test("初期セッションを取得してDesktopNavに渡す", async () => {
    const session = {
      user: {
        id: "user-123",
      },
    } as Session;

    mockGetSession.mockResolvedValueOnce({
      data: {
        session,
      },
    });

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByTestId("desktop-nav")).toHaveTextContent(
        "logged-in"
      );
    });

    expect(mockGetSession).toHaveBeenCalledTimes(1);
  });

  test("認証状態が変更されたらセッションを更新する", async () => {
    const session = {
      user: {
        id: "user-123",
      },
    } as Session;

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByTestId("desktop-nav")).toHaveTextContent(
        "logged-out"
      );
    });

    act(() => {
      authStateChangeCallback?.("SIGNED_IN", session);
    });

    await waitFor(() => {
      expect(screen.getByTestId("desktop-nav")).toHaveTextContent(
        "logged-in"
      );
    });
  });

  test("モバイルメニューを開閉できる", async () => {
    const user = userEvent.setup();

    render(<Header />);

    const menuButton = screen.getByRole("button");

    expect(
      screen.queryByTestId("mobile-nav")
    ).not.toBeInTheDocument();

    await user.click(menuButton);

    expect(screen.getByTestId("mobile-nav")).toBeInTheDocument();

    await user.click(menuButton);

    expect(
      screen.queryByTestId("mobile-nav")
    ).not.toBeInTheDocument();
  });

  test("WordMateのリンクがトップページを指している", () => {
    render(<Header />);

    const wordMateLink = screen.getByRole("link", {
      name: /WordMate/i,
    });

    expect(wordMateLink).toHaveAttribute("href", "/");
  });
});