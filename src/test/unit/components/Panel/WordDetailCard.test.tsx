import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import WordDetailCard from "@/components/Panel/WordDetailCard";
import { speakEnglish } from "@/lib/speakEnglish";

const mockResult = {
  definition: "a domesticated animal that says meow",
  partOfSpeech: "noun",
  synonyms: ["feline", "kitty"],
  typeOf: ["animal", "mammal"],
  derivation: ["catlike"],
  examples: ["The cat is sleeping.", "I have a black cat."],
};

jest.mock("@/lib/speakEnglish", () => ({
  speakEnglish: jest.fn(),
}));


describe("WordDetailCard", () => {
   beforeEach(() => {
    jest.clearAllMocks();
  });

  test("単語の基本情報が表示される", () => {
    render(
      <WordDetailCard
        word="cat"
        pronunciation="kæt"
        result={mockResult}
        translatedDefinition="ニャーと鳴く家畜化された動物"
        isTranslating={false}
      />,
    );

    expect(screen.getByText("cat")).toBeInTheDocument();
    expect(screen.getByText("noun")).toBeInTheDocument();
    expect(screen.getByText("/kæt/")).toBeInTheDocument();
    expect(
      screen.getByText("a domesticated animal that says meow"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("ニャーと鳴く家畜化された動物"),
    ).toBeInTheDocument();
  });

   test("例文、類義語、上位語、派生語が表示される", () => {
    render(
      <WordDetailCard
        word="cat"
        pronunciation="kæt"
        result={mockResult}
        translatedDefinition="猫"
        isTranslating={false}
      />,
    );

    expect(screen.getByText("例文:")).toBeInTheDocument();
    expect(
      screen.getByText("The cat is sleeping., I have a black cat."),
    ).toBeInTheDocument();

    expect(screen.getByText("類義語:")).toBeInTheDocument();
    expect(screen.getByText("feline, kitty")).toBeInTheDocument();

    expect(screen.getByText("上位語:")).toBeInTheDocument();
    expect(screen.getByText("animal, mammal")).toBeInTheDocument();

    expect(screen.getByText("派生語:")).toBeInTheDocument();
    expect(screen.getByText("catlike")).toBeInTheDocument();
  });

   test("翻訳中の場合は翻訳中メッセージが表示される", () => {
    render(
      <WordDetailCard
        word="cat"
        pronunciation="kæt"
        result={mockResult}
        translatedDefinition=""
        isTranslating={true}
      />,
    );

    expect(screen.getByText("翻訳中...")).toBeInTheDocument();

    expect(
      screen.queryByText("日本語訳を取得できませんでした。"),
    ).not.toBeInTheDocument();
  });

  test("翻訳結果が空の場合はエラーメッセージが表示される", () => {
    render(
      <WordDetailCard
        word="cat"
        pronunciation="kæt"
        result={mockResult}
        translatedDefinition=""
        isTranslating={false}
      />,
    );

    expect(
      screen.getByText("日本語訳を取得できませんでした。"),
    ).toBeInTheDocument();
  });

    test("配列データが空の場合は各項目を表示しない", () => {
    const emptyResult = {
      ...mockResult,
      examples: [],
      synonyms: [],
      typeOf: [],
      derivation: [],
    };

    render(
      <WordDetailCard
        word="cat"
        pronunciation="kæt"
        result={emptyResult}
        translatedDefinition="猫"
        isTranslating={false}
      />,
    );

    expect(screen.queryByText("例文:")).not.toBeInTheDocument();
    expect(screen.queryByText("類義語:")).not.toBeInTheDocument();
    expect(screen.queryByText("上位語:")).not.toBeInTheDocument();
    expect(screen.queryByText("派生語:")).not.toBeInTheDocument();
  });

    test("Listenボタンが表示される", () => {
    render(
      <WordDetailCard
        word="cat"
        pronunciation="kæt"
        result={mockResult}
        translatedDefinition="猫"
        isTranslating={false}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Listen" }),
    ).toBeInTheDocument();
  });

  test("Listenボタンを押すとspeakEnglishが単語を引数に呼ばれる", () => {
    render(
      <WordDetailCard
        word="cat"
        pronunciation="kæt"
        result={mockResult}
        translatedDefinition="猫"
        isTranslating={false}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Listen" }));

    expect(speakEnglish).toHaveBeenCalledTimes(1);
    expect(speakEnglish).toHaveBeenCalledWith("cat");
  });

});