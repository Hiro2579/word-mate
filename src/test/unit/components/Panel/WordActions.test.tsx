// WordActions.test.tsx
import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import WordActions from "../../../../components/Panel/WordActions";

//タグに渡せる props の型を定義
type ButtonProps = React.ComponentProps<"button">;
type CardProps = React.ComponentProps<"div">;
type LabelProps = React.ComponentProps<"label">;
type PlusProps = React.HTMLAttributes<HTMLSpanElement>;

jest.mock("@/components/ui/button", () => ({
  Button: (props: ButtonProps) => <button {...props} />,
}));

jest.mock("@/components/ui/card", () => ({
  Card: (props: CardProps) => <div data-testid="card" {...props} />,
  CardContent: (props: CardProps) => (
    <div data-testid="card-content" {...props} />
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: (props: LabelProps) => <label {...props} />,
}));

jest.mock("lucide-react", () => ({
  Plus: (props: PlusProps) => <span data-testid="plus-icon" {...props} />,
}));

describe("WordActions (unit)", () => {
  const defaultProps = {
    isSaved: false,
    onSave: jest.fn(),
    searchTerm: "apple",
    formWord: "apple",
    hasUser: true,
  };

  //defaultpropsのプロパティを全部?をつけてオプショナルにする)、overridePropsで上書きできるようにする
  const setup = (overrideProps: Partial<typeof defaultProps> = {}) => {
    const props = { ...defaultProps, ...overrideProps };
    render(<WordActions {...props} />);

    const button = screen.getByRole("button");

    return { props, button };
  };

  test("ラベルとボタンが表示されること", () => {
    const { button } = setup();

    expect(screen.getByText("単語帳に保存する")).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("単語帳に保存");
  });

  test("条件が揃っているとき（未保存・ユーザーあり・searchTerm === formWord）はボタンが有効", () => {
    const { button } = setup({
      isSaved: false,
      hasUser: true,
      searchTerm: "apple",
      formWord: "apple",
    });

    expect(button).not.toBeDisabled();
  });

  test("isSaved が true のときボタンが disabled になり、文言が『保存しました！』になること", () => {
    const { button } = setup({ isSaved: true });

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("保存しました！");
  });

  test("ユーザーがいない場合（hasUser=false）はボタンが disabled になること", () => {
    const { button } = setup({
      hasUser: false,
      isSaved: false,
      searchTerm: "apple",
      formWord: "apple",
    });

    expect(button).toBeDisabled();
  });

  test("searchTerm と formWord が一致しない場合はボタンが disabled になること", () => {
    const { button } = setup({
      searchTerm: "apple",
      formWord: "banana",
      isSaved: false,
      hasUser: true,
    });

    expect(button).toBeDisabled();
  });

  test("ボタンが有効なときクリックすると onSave が呼ばれること", () => {
    const onSave = jest.fn();
    const { button } = setup({
      onSave,
      isSaved: false,
      hasUser: true,
      searchTerm: "apple",
      formWord: "apple",
    });

    fireEvent.click(button);

    expect(onSave).toHaveBeenCalledTimes(1);
  });

  test("ボタンが disabled のときはクリックしても onSave が呼ばれないこと", () => {
    const onSave = jest.fn();
    const { button } = setup({
      onSave,
      isSaved: true, // disabled 条件
    });

    fireEvent.click(button);

    expect(onSave).not.toHaveBeenCalled();
  });
});
