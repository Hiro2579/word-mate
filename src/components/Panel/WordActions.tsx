"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Plus } from "lucide-react";

// 単語帳に保存するボタン
const WordActions = ({
  isSaved,
  onSave,
  searchTerm,
  formWord,
  hasUser,
}: {
  isSaved: boolean;
  onSave: () => void;
  searchTerm: string;
  formWord: string;
  hasUser: boolean;
}) => (
  <Card className="mt-6">
    <CardContent className="p-4">
      <Label className="text-sm font-medium text-gray-700">
        単語帳に保存する
      </Label>
      <Button
        onClick={onSave}
        disabled={isSaved || !hasUser || searchTerm !== formWord}
        className="w-full mt-3"
        variant={isSaved ? "outline" : "default"}
      >
        <Plus className="w-4 h-4 mr-2" />
        {isSaved ? "保存しました！" : "単語帳に保存"}
      </Button>
    </CardContent>
  </Card>
);

export default WordActions;
