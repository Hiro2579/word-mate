// DeleteAccount.test.tsx

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DeleteAccount from "../../../../components/Settings/DeleteAccount";

const mockPush = jest.fn();
const mockSignOut = jest.fn();
const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: replaceMock,
  }),
}));

jest.mock("@/hooks/useRequireAuth", () => ({
  useRequireAuth: jest.fn(),
}));


jest.mock("@/lib/auth", () => ({
  authRepository: {
    signOut: () => mockSignOut(),
  },
}));

describe("DeleteAccount", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn();

    window.alert = jest.fn();
  });

  it("アカウント削除に関する説明が表示されている", () => {
    render(<DeleteAccount />);

    expect(
      screen.getByText(
        "この操作は元に戻せません。関連するデータも全て削除されます。"
      )
    ).toBeInTheDocument();

    expect(screen.getByText("注意")).toBeInTheDocument();

    expect(
      screen.getByText("保存した単語はすべて永久に削除されます")
    ).toBeInTheDocument();

    expect(
      screen.getByText("アカウントとログイン認証情報は削除されます")
    ).toBeInTheDocument();

    expect(
      screen.getByText("いかなるデータも回復できません")
    ).toBeInTheDocument();
  });

  it("パスワード入力欄が表示されている", () => {
    render(<DeleteAccount />);

    expect(
      screen.getByText("パスワードを入力してください")
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText("Enter your password")
    ).toBeInTheDocument();
  });

  it("アカウントを削除するボタンが表示されている", () => {
    render(<DeleteAccount />);

    expect(
      screen.getByRole("button", {
        name: "アカウントを削除する",
      })
    ).toBeInTheDocument();
  });

  it("キャンセルボタンが表示されている", () => {
    render(<DeleteAccount />);

    expect(
      screen.getByRole("button", {
        name: "キャンセル",
      })
    ).toBeInTheDocument();
  });

  it("キャンセルを押すと/settingsへ遷移する", () => {
  render(<DeleteAccount />);

  const cancelLink = screen.getByRole("link", {
    name: "キャンセル",
  });

  expect(cancelLink).toHaveAttribute("href", "/settings");
});

  it("アカウントを削除するを押すと確認ダイアログが表示される", async () => {
    const user = userEvent.setup();

    render(<DeleteAccount />);

    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "password123"
    );

    await user.click(
      screen.getByRole("button", {
        name: "アカウントを削除する",
      })
    );

    expect(
      await screen.findByRole("alertdialog")
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", {
        name: "アカウントを削除する",
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "本当にアカウントを削除してもよろしいですか？"
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "削除する",
      })
    ).toBeInTheDocument();
  });

  it("APIがエラーを返した場合はエラーメッセージが表示される", async () => {
    const user = userEvent.setup();
    const errorMessage = "パスワードが正しくありません。";

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({
        message: errorMessage,
      }),
    });

    render(<DeleteAccount />);

    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "wrong-password"
    );

    await user.click(
      screen.getByRole("button", {
        name: "アカウントを削除する",
      })
    );

    await user.click(
      await screen.findByRole("button", {
        name: "削除する",
      })
    );

    expect(
      await screen.findByText(errorMessage)
    ).toBeInTheDocument();

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/account/delete",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: "wrong-password",
        }),
      }
    );

    expect(mockSignOut).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalledWith("/");
  });

  it("エラーレスポンスにmessageがない場合は既定のエラーが表示される", async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: jest.fn().mockResolvedValue({}),
    });

    render(<DeleteAccount />);

    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "wrong-password"
    );

    await user.click(
      screen.getByRole("button", {
        name: "アカウントを削除する",
      })
    );

    await user.click(
      await screen.findByRole("button", {
        name: "削除する",
      })
    );

    expect(
      await screen.findByText(
        "アカウント削除に失敗しました。パスワードをご確認のうえ、もう一度お試しください。"
      )
    ).toBeInTheDocument();
  });

  it("通信中に例外が発生した場合は予期せぬエラーが表示される", async () => {
    const user = userEvent.setup();

    jest.spyOn(console, "error").mockImplementation(() => {});

    (global.fetch as jest.Mock).mockRejectedValue(
      new Error("Network error")
    );

    render(<DeleteAccount />);

    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "password123"
    );

    await user.click(
      screen.getByRole("button", {
        name: "アカウントを削除する",
      })
    );

    await user.click(
      await screen.findByRole("button", {
        name: "削除する",
      })
    );

    expect(
      await screen.findByText(
        "予期せぬエラーが発生しました。時間をおいて再度お試しください。"
      )
    ).toBeInTheDocument();

    expect(mockSignOut).not.toHaveBeenCalled();
  });

  it("アカウント削除に成功したらログアウトしてトップページへ遷移する", async () => {
    const user = userEvent.setup();

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn(),
    });

    mockSignOut.mockResolvedValue(undefined);

    render(<DeleteAccount />);

    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "password123"
    );

    await user.click(
      screen.getByRole("button", {
        name: "アカウントを削除する",
      })
    );

    await user.click(
      await screen.findByRole("button", {
        name: "削除する",
      })
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/account/delete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password: "password123",
          }),
        }
      );
    });

    expect(window.alert).toHaveBeenCalledWith(
      "アカウント削除しました"
    );

    expect(mockSignOut).toHaveBeenCalledTimes(1);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });

  it("パスワードが未入力の場合は削除ボタンが無効になっている", () => {
    render(<DeleteAccount />);

    expect(
      screen.getByRole("button", {
        name: "アカウントを削除する",
      })
    ).toBeDisabled();
  });

  it("パスワードを入力すると削除ボタンが有効になる", async () => {
    const user = userEvent.setup();

    render(<DeleteAccount />);

    const deleteButton = screen.getByRole("button", {
      name: "アカウントを削除する",
    });

    expect(deleteButton).toBeDisabled();

    await user.type(
      screen.getByPlaceholderText("Enter your password"),
      "password123"
    );

    expect(deleteButton).toBeEnabled();
  });
});