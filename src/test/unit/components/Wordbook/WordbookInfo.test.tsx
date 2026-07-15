import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

//ダミーアイコン Badge
jest.mock("@/components/ui/badge", () => ({
  Badge: (props: React.ComponentProps<"span">) => (
    <span data-testid="badge" {...props} />
  ),
}));

// ダミーアイコン BookOpen
jest.mock("lucide-react", () => ({
  BookOpen: () => <span data-icon="book-open" />,
}));

//テスト

import WordbookInfo from "../../../../components/Wordbook/WordbookInfo";

describe("WordbookInfo", () => {
  test("タイトル『単語総数』が表示され、BookOpen アイコンも存在する", () => {
    const { container } = render(<WordbookInfo wordsLength={10} />);

    expect(screen.getByText("単語総数")).toBeInTheDocument();
    expect(
      container.querySelector('[data-icon="book-open"]')
    ).toBeInTheDocument();
  });

  test("wordsLength がバッジに『{n} save words』として表示される", () => {
    render(<WordbookInfo wordsLength={42} />);

    const badge = screen.getByTestId("badge");
    expect(badge).toHaveTextContent("42 save words");
  });

  test("説明テキストが表示される", () => {
    render(<WordbookInfo wordsLength={0} />);

    expect(
      screen.getByText("新しい単語を保存して語彙を増やし続けましょう！")
    ).toBeInTheDocument();
  });
});
