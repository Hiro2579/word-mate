import { render, screen } from "@testing-library/react";
import Panel from "../../../../components/Panel/Panel";



describe("Panel", () => {
  it("初期表示のテキストが表示される", () => {
    render(<Panel />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "英語の単語を検索する",
      })
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(
        "英語の単語を入力すると、詳細な定義と例文が表示されます。"
      )
    ).toHaveLength(2);

    expect(
      screen.getByPlaceholderText("英単語を入力してください...")
    ).toBeInTheDocument();
  });
});