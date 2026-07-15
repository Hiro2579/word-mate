"use client";

import { Button } from "@/components/ui/button";
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
import { User } from "lucide-react";
import { useRouter } from "next/navigation";
import { authRepository } from "@/lib/auth";

const LogoutButton = ({ isMobile = false }: { isMobile?: boolean }) => {
  const router = useRouter();

  // ログアウト処理
  const signout = async () => {
    await authRepository.signOut();
    router.push("/");
    window.location.reload();
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          className={`flex items-center gap-2 text-red-600 hover:text-red-700 ${
            isMobile ? "w-full justify-start" : ""
          }`}
        >
          <User className="w-4 h-4" />
          ログアウト　
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ログアウトを確定する</AlertDialogTitle>
          <AlertDialogDescription>
            ログアウトしてもよろしいですか？ログアウトすると、単語帳や保存した単語にアクセスするために、再度ログインする必要があります。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction
            onClick={signout}
            className="bg-red-600 hover:bg-red-700"
          >
            ログアウトする
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default LogoutButton;
