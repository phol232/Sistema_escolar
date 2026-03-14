"use client";

import { useState } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface SearchInputProps {
  placeholder?: string;
}

export function SearchInput({ placeholder = "Buscar..." }: SearchInputProps) {
  const [value, setValue] = useState("");

  return (
    <div className="flex h-10 items-center gap-3 rounded-lg border border-input bg-card px-3 shadow-xs">
      <Search className="h-4 w-4 text-muted-foreground" />
      <Input
        className="h-auto border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
        placeholder={placeholder}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <span className="hidden rounded-sm border border-border bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground sm:inline-flex">
        Ctrl K
      </span>
    </div>
  );
}
