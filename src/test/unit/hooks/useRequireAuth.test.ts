import { renderHook, waitFor } from "@testing-library/react";
import { useRequireAuth } from "../../../hooks/useRequireAuth";

// useRouterのpushをpushMockに差し替え
const pushMock = jest.fn();
const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
}));

// supabaseのgetSessionをgetSessionMockに差し替え
const getSessionMock = jest.fn();

jest.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getSession: getSessionMock,
    },
  }),
}));

describe("useRequireAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("未ログインなら /auth に push される", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: null },
    });
    //renderHookはカスタムフックをテストするため関数
    renderHook(() => useRequireAuth());

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/auth");
    });
  });

  test("ログイン済みなら push されない", async () => {
    getSessionMock.mockResolvedValue({
      data: { session: { user: { id: "abc" } } },
    });

    renderHook(() => useRequireAuth());

    await waitFor(() => {
      expect(replaceMock).not.toHaveBeenCalled();
    });
  });
});
