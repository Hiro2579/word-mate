"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { authRepository } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useState } from "react";

export default function ChangePassword() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  //ログインしているか確認
  useRequireAuth();

  //パスワード変更処理
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("パスワードが一致していません");
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage("パスワードは最低８文字です");
      return;
    }

    setIsChangingPassword(true);

    try {
      await authRepository.changeMyPassword(currentPassword, newPassword);
      setShowSuccessDialog(true);
    } catch (error: unknown) {
      if (error instanceof Error) {
        if (error.message === "INCORRECT_PASSWORD") {
          setErrorMessage("現在のパスワードが違います");
        } else if (error.message === "USER_EMAIL_NOT_FOUND") {
          setErrorMessage(
            "ユーザー情報の取得に失敗しました。再ログインしてください。"
          );
        } else {
          setErrorMessage("予期せぬエラーが発生しました。");
        }
      } else {
        setErrorMessage("予期せぬエラーが発生しました。");
      }
      return;
    } finally {
      setIsChangingPassword(false);
    }
  };
  //成功ダイアログを閉じる
  const handleSuccessClose = () => {
    setShowSuccessDialog(false);
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          {/* Back Button */}
          <Link href="/settings">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="w-4 h-4" />
              設定に戻る
            </Button>
          </Link>

          <h1 className="text-3xl font-bold mb-2">パスワードを変更する</h1>

          <form onSubmit={handlePasswordChange} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="current-password">
                現在のパスワードを入力してください
              </Label>
              <Input
                id="current-password"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">
                新しいパスワードを入力してください
              </Label>
              <Input
                id="new-password"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">
                {" "}
                新しいパスワードを入力してください（確認用）
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {errorMessage && (
              <p className="text-red-600 text-sm">{errorMessage}</p>
            )}

            <Button
              type="submit"
              disabled={isChangingPassword}
              className="w-full"
            >
              {isChangingPassword ? "変更中..." : "変更する"}
            </Button>
          </form>
        </div>
      </div>

      {/* Success Dialog */}
      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>パスワードの変更に成功しました</AlertDialogTitle>
            <AlertDialogDescription>
              パスワードの更新が完了しました。ホームページにリダイレクトされます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleSuccessClose}>
            続ける
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
