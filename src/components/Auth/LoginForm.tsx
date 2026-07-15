"use client";

import { useState } from "react";
import { authRepository } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";

const LoginForm = ({
  isLoading,
  setIsLoading,
}: {
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(""); // エラーリセット

    try {
      const result = await authRepository.signIn(email, password);
      if (result.error) {
        // Supabaseで照合してエラー
        setErrorMessage("メールアドレスあるいはパスワードに誤りがあります");
      } else {
        window.location.href = "/";
      }
    } catch (e) {
      // ネットワークエラー
      console.log(e);
      setErrorMessage(
        "ログインに失敗しました。しばらくしてからお試しください。"
      );
    } finally {
      setIsLoading(false);

    }
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      {/* Email */}
      <div className="space-y-2">
        <Label>Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="emailを入力してください"
            required
            className="pl-10"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label>Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワードを入力してください<8文字以上>"
            required
            className="pl-10"
          />
        </div>
      </div>

      {/* エラーメッセージ表示 */}
      {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

      {/* ログインボタン */}
      <Button
        type="submit"
        className="w-full"
        disabled={!email || password.length < 8}
      >
        {isLoading ? "ログイン中..." : "ログイン"}
      </Button>
    </form>
  );
};

export default LoginForm;
