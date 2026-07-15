import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import WordItem from "../../../../components/Wordbook/WordItem";

// Buttonをシンプルなbuttonに差し替え
jest.mock("@/components/ui/button", () => ({
  Button: (props: React.ComponentProps<"button">) => <button {...props} />,
}));

jest.mock("@/components/ui/card", () => ({
  Card: (props: React.ComponentProps<"div">) => <div {...props} />,
  CardContent: (props: React.ComponentProps<"div">) => <div {...props} />,
}));

// DeleteWordButtonをシンプルなbuttonに差し替え
jest.mock("../../../../components/Wordbook/DeleteWordButton", () => ({
  __esModule: true,
  default: ({ onDelete, word }: { onDelete: () => void; word: string }) => (
    <button onClick={onDelete}>Delete {word}</button>
  ),
}));

// wordRepository をモックして Supabase 依存を切る
jest.mock("../../../../lib/wordbook", () => ({
  wordRepository: {
    delete: jest.fn(),
  },
}));

const { wordRepository } = jest.requireMock("../../../../lib/wordbook") as {
  wordRepository: {
    delete: jest.Mock;
  };
};
const deleteMock = wordRepository.delete;

type Word = {
  id: number;
  word: string;
  created_at: string;
};

const mockWord: Word = {
  id: 1,
  word: "example",
  created_at: "2024-01-01T00:00:00.000Z",
};

describe("WordItem", () => {
  beforeEach(() => {
    deleteMock.mockResolvedValue(undefined);
  });

  test("カードと単語の情報が表示される", () => {
    const setWords: React.Dispatch<React.SetStateAction<Word[]>> =
      jest.fn() as React.Dispatch<React.SetStateAction<Word[]>>;

    render(<WordItem word={mockWord} setWords={setWords} />);

    expect(screen.getByText(mockWord.word)).toBeInTheDocument();

    expect(screen.getByText(/Added on/i)).toBeInTheDocument();

    expect(screen.getByText(`Delete ${mockWord.word}`)).toBeInTheDocument();
  });
});
