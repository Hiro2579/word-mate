import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Wordbook from "../../../../components/Wordbook/Wordbook";

const getSessionMock = jest.fn();

jest.mock("../../../../lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: getSessionMock,
    },
  }),
}));

const findMock = jest.fn();

jest.mock("../../../../lib/wordbook", () => ({
  wordRepository: {
    find: (...args: unknown[]) => findMock(...args),
  },
}));

jest.mock("@/hooks/useRequireAuth", () => ({
  useRequireAuth: () => {},
}));

jest.mock("../../../../components/Wordbook/WordList", () => ({
  __esModule: true,
  default: ({ words }: { words: { id: number; word: string }[] }) => (
    <div data-testid="word-list">
      {words.map((w) => (
        <div key={w.id}>{w.word}</div>
      ))}
    </div>
  ),
}));

//export defaultのばあいesModule: true をつける defaultをつける
jest.mock("../../../../components/Wordbook/WordbookInfo", () => ({
  __esModule: true,
  default: ({ wordsLength }: { wordsLength: number }) => (
    <div data-testid="wordbook-info">words: {wordsLength}</div>
  ),
}));

beforeEach(() => {
  jest.clearAllMocks();
  getSessionMock.mockResolvedValue({
    data: { session: { user: { id: "user-1" } } },
  });
});

test("単語がある場合、WordList が表示され、空メッセージは表示されない", async () => {
  // 単語が1件
  findMock.mockResolvedValue([
    { id: 1, word: "apple", created_at: "2025-11-17T00:00:00Z" },
  ]);

  render(<Wordbook />);

  // useEffect 内の fetchWords が終わるまで待つ
  const list = await screen.findByTestId("word-list");

  expect(list).toBeInTheDocument();
  expect(list).toHaveTextContent("apple");

  // 空状態メッセージは表示されていないはず
  expect(
    screen.queryByText("あなたの単語帳にまだ単語がありません。")
  ).not.toBeInTheDocument();
});

test("単語がない場合、空状態のメッセージが表示され、WordList は表示されない", async () => {
  // 単語が0件
  findMock.mockResolvedValue([]);

  render(<Wordbook />);

  // 空状態メッセージが表示されるのを待つ
  const emptyMessage = await screen.findByText(
    "あなたの単語帳にまだ単語がありません。"
  );
  expect(emptyMessage).toBeInTheDocument();

  // WordList は描画されない
  expect(screen.queryByTestId("word-list")).not.toBeInTheDocument();
});
