"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authRepository } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock } from "lucide-react";

// 確認メッセージ用のAlertDialogコンポーネント
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const SignupForm = ({
  isLoading,
  setIsLoading,
}: {
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false); // 確認メッセージ表示制御
  const [errorMessage, setErrorMessage] = useState("");

  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const { error } = await authRepository.signUp(email, password);

      if (error) {
        console.error("[signUp error]", error);
        setErrorMessage(
          "アカウント作成に失敗しました。もう一度お試しください。"
        );
      } else {
        //メール確認メッセージを表示
        setIsDialogOpen(true);
      }
    } catch (e) {
      console.log(e);
      setErrorMessage("予期せぬエラーが発生しました。");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSignup} className="space-y-4">
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
              placeholder="パスワードを作成<8文字以上>"
              required
              className="pl-10"
            />
          </div>
        </div>

        {/* エラーメッセージ */}
        {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

        <Button
          type="submit"
          className="w-full"
          disabled={!email || password.length < 8}
        >
          {isLoading ? "アカウント作成中..." : "アカウント作成"}
        </Button>
      </form>

      {/* ✅ メール確認モーダル */}
      <AlertDialog open={isDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>確認メールを送りました</AlertDialogTitle>
            <AlertDialogDescription>
              アカウント作成を確定させるため、メールのリンクをクリックしてください。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                setIsDialogOpen(false);
                router.push("/"); // ✅ OKでトップページへ
              }}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SignupForm;
