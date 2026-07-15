"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const SearchInput = ({
  searchTerm,
  setSearchTerm,
  isLoading,
  onSearch,
}: {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  isLoading: boolean;
  onSearch: () => void;
}) => {
  // 検索入力フォーム
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <Input
          type="text"
          placeholder="英単語を入力してください..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSearch()}
          className="pl-10 h-12 text-lg bg-white"
        />
      </div>
      <Button onClick={onSearch} disabled={isLoading} className="w-full h-12">
        {isLoading ? "検索中..." : "検索する"}
      </Button>
    </div>
  );
};

export default SearchInput;
