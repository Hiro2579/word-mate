import nextJest from "next/jest";

const createJestConfig = nextJest({
  dir: "./", // Next.js プロジェクトのルートディレクトリ
});

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom", // jsdomを使ったブラウザ環境をシミュレート
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"], // カスタムマッチャーをセットアップ
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1", // エイリアスの設定
  },

  transform: {
    "^.+\\.tsx?$": "ts-jest",
    "^.+\\.(js|jsx|ts|tsx)$": "babel-jest",
  },
};

export default createJestConfig(customJestConfig);
