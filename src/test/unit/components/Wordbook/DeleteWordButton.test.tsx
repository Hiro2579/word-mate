// __tests__/DeleteWordButton.test.tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("@/components/ui/alert-dialog", () => {
  const Div = (props: any) => <div {...props} />;
  const Btn = (props: any) => <button {...props} />;
  const H2 = (props: any) => <h2 {...props} />;
  const P = (props: any) => <p {...props} />;

  return {
    AlertDialog: (props: any) => <Div data-testid="alert-dialog" {...props} />,
    AlertDialogTrigger: Div,
    AlertDialogContent: Div,
    AlertDialogHeader: Div,
    AlertDialogTitle: H2,
    AlertDialogDescription: P,
    AlertDialogFooter: Div,
    AlertDialogCancel: Btn,
    AlertDialogAction: Btn,
  };
});
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }: React.ComponentProps<"button">) => (
    <button {...props}>{children}</button>
  ),
}));

jest.mock("lucide-react", () => ({
  Trash2: () => <span data-icon="trash" />,
}));

import DeleteWordButton from "../../../../components/Wordbook/DeleteWordButton";

describe("DeleteWordButton", () => {
  test("ダイアログ内に単語が表示される", () => {
    render(<DeleteWordButton word="hello" onDelete={jest.fn()} />);

    const description = screen.getByText((content) =>
      content.includes('"hello"')
    );
    expect(description).toBeInTheDocument();
    expect(screen.getByText("単語を削除する")).toBeInTheDocument();
  });

  test("『削除』ボタンを押すと onDelete が呼ばれる", () => {
    const onDelete = jest.fn();

    render(<DeleteWordButton word="bye" onDelete={onDelete} />);

    const deleteButton = screen.getByRole("button", { name: "削除" });
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
