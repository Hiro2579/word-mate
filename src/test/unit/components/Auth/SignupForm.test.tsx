import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";

// ====== モック定義（SignupForm を import する前に）======

// next/navigation の useRouter
const pushMock = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

// authRepository.signUp をモック
const signUpMock = jest.fn();
jest.mock("@/lib/auth", () => ({
  authRepository: {
    signUp: (email: string, password: string) => signUpMock(email, password),
  },
}));

// UI コンポーネント
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ComponentProps<"button">) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("@/components/ui/input", () => ({
  Input: (props: React.ComponentProps<"input">) => <input {...props} />,
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }: React.ComponentProps<"label">) => (
    <label {...props}>{children}</label>
  ),
}));

// AlertDialog 系：open=true のときだけ描画されるように
jest.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({
    open,
    children,
  }: {
    open?: boolean;
    children: React.ReactNode;
  }) => (open ? <div data-testid="alert-dialog">{children}</div> : null),
  AlertDialogContent: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2>{children}</h2>
  ),
  AlertDialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p>{children}</p>
  ),
  AlertDialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  AlertDialogAction: ({
    children,
    ...props
  }: React.ComponentProps<"button"> & { children: React.ReactNode }) => (
    <button {...props}>{children}</button>
  ),
}));

// アイコンはダミー
jest.mock("lucide-react", () => ({
  Mail: () => <span data-icon="mail" />,
  Lock: () => <span data-icon="lock" />,
}));

// ====== テスト対象コンポーネント ======
import SignupForm from "../../../../components/Auth/SignupForm";

describe("SignupForm", () => {
  const setIsLoadingMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("初期状態: 入力欄が表示され、ボタンは disabled で『アカウント作成』", () => {
    render(<SignupForm isLoading={false} setIsLoading={setIsLoadingMock} />);

    const emailInput = screen.getByPlaceholderText("emailを入力してください");
    const passwordInput =
      screen.getByPlaceholderText("パスワードを作成<8文字以上>");
    const button = screen.getByRole("button", { name: "アカウント作成" });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(button).toBeDisabled();
    expect(screen.queryByTestId("alert-dialog")).not.toBeInTheDocument();
  });

  test("email と 8文字以上の password を入力するとボタンが enabled になる", () => {
    render(<SignupForm isLoading={false} setIsLoading={setIsLoadingMock} />);

    const emailInput = screen.getByPlaceholderText("emailを入力してください");
    const passwordInput =
      screen.getByPlaceholderText("パスワードを作成<8文字以上>");
    const button = screen.getByRole("button", { name: "アカウント作成" });

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });

    expect(button).toBeEnabled();
  });

  test("isLoading=true のときはボタンラベルが『アカウント作成中...』になる", () => {
    render(<SignupForm isLoading={true} setIsLoading={setIsLoadingMock} />);

    expect(
      screen.getByRole("button", { name: "アカウント作成中..." })
    ).toBeInTheDocument();
  });

  test("サインアップ成功時: signUp が呼ばれ、ダイアログが表示され、setIsLoading が true→false で呼ばれる", async () => {
    signUpMock.mockResolvedValue({ error: null });

    render(<SignupForm isLoading={false} setIsLoading={setIsLoadingMock} />);

    const emailInput = screen.getByPlaceholderText("emailを入力してください");
    const passwordInput =
      screen.getByPlaceholderText("パスワードを作成<8文字以上>");
    const form = screen
      .getByRole("button", { name: "アカウント作成" })
      .closest("form");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });

    fireEvent.submit(form!);

    await waitFor(() => {
      expect(signUpMock).toHaveBeenCalledWith("test@example.com", "password");
    });

    // setIsLoading(true) → setIsLoading(false)
    expect(setIsLoadingMock).toHaveBeenCalledWith(true);
    expect(setIsLoadingMock).toHaveBeenCalledWith(false);

    // 成功時は確認ダイアログが表示される
    expect(screen.getByTestId("alert-dialog")).toBeInTheDocument();
    expect(screen.getByText("確認メールを送りました")).toBeInTheDocument();
  });

  test("サインアップエラー時: エラーメッセージを表示し、ダイアログは開かない", async () => {
    signUpMock.mockResolvedValue({ error: { message: "duplicate" } });

    render(<SignupForm isLoading={false} setIsLoading={setIsLoadingMock} />);

    const emailInput = screen.getByPlaceholderText("emailを入力してください");
    const passwordInput =
      screen.getByPlaceholderText("パスワードを作成<8文字以上>");
    const form = screen
      .getByRole("button", { name: "アカウント作成" })
      .closest("form");

    fireEvent.change(emailInput, { target: { value: "dup@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });

    fireEvent.submit(form!);

    await waitFor(() => {
      expect(
        screen.getByText(
          "アカウント作成に失敗しました。もう一度お試しください。"
        )
      ).toBeInTheDocument();
    });

    // ダイアログは開かない
    expect(screen.queryByTestId("alert-dialog")).not.toBeInTheDocument();
  });

  test("ネットワーク等の例外時: 汎用エラーメッセージを表示し、ダイアログは開かない", async () => {
    signUpMock.mockRejectedValue(new Error("Network error"));

    render(<SignupForm isLoading={false} setIsLoading={setIsLoadingMock} />);

    const emailInput = screen.getByPlaceholderText("emailを入力してください");
    const passwordInput =
      screen.getByPlaceholderText("パスワードを作成<8文字以上>");
    const form = screen
      .getByRole("button", { name: "アカウント作成" })
      .closest("form");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });

    fireEvent.submit(form!);

    await waitFor(() => {
      expect(
        screen.getByText("予期せぬエラーが発生しました。")
      ).toBeInTheDocument();
    });

    expect(screen.queryByTestId("alert-dialog")).not.toBeInTheDocument();
  });

  test("ダイアログの OK をクリックすると閉じてトップページ('/')へ遷移する", async () => {
    signUpMock.mockResolvedValue({ error: null });

    render(<SignupForm isLoading={false} setIsLoading={setIsLoadingMock} />);

    const emailInput = screen.getByPlaceholderText("emailを入力してください");
    const passwordInput =
      screen.getByPlaceholderText("パスワードを作成<8文字以上>");
    const form = screen
      .getByRole("button", { name: "アカウント作成" })
      .closest("form");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password" } });

    fireEvent.submit(form!);

    // ダイアログが表示されるのを待つ
    await waitFor(() => {
      expect(screen.getByTestId("alert-dialog")).toBeInTheDocument();
    });

    const okButton = screen.getByRole("button", { name: "OK" });
    fireEvent.click(okButton);

    // ルーター遷移
    expect(pushMock).toHaveBeenCalledWith("/");

    // open=false になってダイアログが消える
    await waitFor(() => {
      expect(screen.queryByTestId("alert-dialog")).not.toBeInTheDocument();
    });
  });
});
