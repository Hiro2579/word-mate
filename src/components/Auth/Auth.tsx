"use client";

import { BookOpen } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";
import AuthTabs from "./AuthTabs";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* ロゴ */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">WordMate</h1>
          <p className="text-gray-600 mt-2">
            単語帳を利用するためにはログインしてください
          </p>
        </div>

        {/* タブとフォーム */}
        <AuthTabs isLoading={isLoading} setIsLoading={setIsLoading} />

        {/* ホームに戻る */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Homeに戻る
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Auth;
