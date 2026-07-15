// SearchInput.test.tsx
import "@testing-library/jest-dom";
import { render, screen, fireEvent } from "@testing-library/react";
import SearchInput from "../../../../components/Panel/SearchInput";

describe("SearchInput (unit test)", () => {
  //defaultpropsのプロパティを全部?をつけてオプショナルにする)、overridePropsで上書きできるようにする
  const setup = (
    overrideProps: Partial<React.ComponentProps<typeof SearchInput>> = {}
  ) => {
    const defaultProps = {
      searchTerm: "",
      setSearchTerm: jest.fn(),
      isLoading: false,
      onSearch: jest.fn(),
    };

    const props = { ...defaultProps, ...overrideProps };

    render(<SearchInput {...props} />);

    return {
      ...props,
      input: screen.getByPlaceholderText(
        "英単語を入力してください..."
      ) as HTMLInputElement,
      button: screen.getByRole("button", { name: /検索する|検索中.../ }),
    };
  };

  test("入力欄とボタンが表示されること", () => {
    const { input, button } = setup();

    expect(input).toBeInTheDocument();
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("検索する");
  });

  test("入力値が変わったとき setSearchTerm が呼ばれること", () => {
    const setSearchTerm = jest.fn();
    const { input } = setup({ setSearchTerm });

    fireEvent.change(input, { target: { value: "apple" } });

    expect(setSearchTerm).toHaveBeenCalledTimes(1);
    expect(setSearchTerm).toHaveBeenCalledWith("apple");
  });

  test("Enter キー押下で onSearch が呼ばれること", () => {
    const onSearch = jest.fn();
    const { input } = setup({ onSearch });

    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });

    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  test("ボタンをクリックすると onSearch が呼ばれること", () => {
    const onSearch = jest.fn();
    const { button } = setup({ onSearch });

    fireEvent.click(button);

    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  test("isLoading=true のときボタンが disabled になり、文言が『検索中...』になること", () => {
    const { button } = setup({ isLoading: true });

    expect(button).toBeDisabled();
    expect(button).toHaveTextContent("検索中...");
  });

  test("isLoading=false のときボタンは有効で、文言が『検索する』になること", () => {
    const { button } = setup({ isLoading: false });

    expect(button).not.toBeDisabled();
    expect(button).toHaveTextContent("検索する");
  });
});
