"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Separator } from "@/components/ui/separator";
import { authRepository } from "@/lib/auth";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function DeleteAccount() {
  const router = useRouter();
  const [deleteConfirmPassword, setDeleteConfirmPassword] = useState("");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  //ログインしているか確認
  useRequireAuth();

  //アカウント削除処理
  const handleAccountDeletion = async () => {

    setIsDeletingAccount(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: deleteConfirmPassword,
        }),
      });

      if (!res.ok) {
        // パースが失敗してもnullを返す（メッセージを返す）
        const body = await res.json().catch(() => null);
        const message =
          body?.message ??
          "アカウント削除に失敗しました。パスワードをご確認のうえ、もう一度お試しください。";
        setErrorMessage(message);
        return;
      }

      //アカウント削除成功ダイアログを表示
      alert("アカウント削除しました");

      //ログアウト
      await authRepository.signOut();
      //ホームページにリダイレクト
      router.push("/");
    } catch (err) {
      console.error(err);
      setErrorMessage(
        "予期せぬエラーが発生しました。時間をおいて再度お試しください。"
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 md:p-8">
          <Link href="/settings">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="w-4 h-4" />
              設定に戻る
            </Button>
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
            <h1 className="text-3xl font-bold text-red-600">
              アカウントを削除する
            </h1>
          </div>
          <p>この操作は元に戻せません。関連するデータも全て削除されます。</p>
          <Separator className="my-4" />

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <h3 className="font-semibold text-red-800 mb-2">注意</h3>
            <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
              <li>保存した単語はすべて永久に削除されます</li>
              <li>アカウントとログイン認証情報は削除されます</li>
              <li>いかなるデータも回復できません</li>
            </ul>
          </div>

          <div className="space-y-4 mb-8">
            <div className="space-y-2">
              <Label htmlFor="delete-password" className="text-base">
                パスワードを入力してください
              </Label>
              <Input
                id="delete-password"
                type="password"
                placeholder="Enter your password"
                value={deleteConfirmPassword}
                onChange={(e) => setDeleteConfirmPassword(e.target.value)}
              />
            </div>

            {errorMessage && (
              <p className="text-sm text-red-600">{errorMessage}</p>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full"
                  disabled={!deleteConfirmPassword || isDeletingAccount}
                >
                  {isDeletingAccount ? "削除中..." : "アカウントを削除する"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>アカウントを削除する</AlertDialogTitle>
                  <AlertDialogDescription>
                    本当にアカウントを削除してもよろしいですか？
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isDeletingAccount}>
                    キャンセル
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleAccountDeletion}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={isDeletingAccount}
                  >
                    {isDeletingAccount ? "削除中..." : "削除する"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Cancel Button */}
          <Link href="/settings" className="block">
            <Button variant="outline" className="w-full bg-transparent">
              キャンセル
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
