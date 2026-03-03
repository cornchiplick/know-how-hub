"use client";

import { useState } from "react";
import { AddItemModal } from "@/features/category";

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface SidebarAddButtonProps {
  categories: Category[];
}

export function SidebarAddButton({ categories }: SidebarAddButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4.5v15m7.5-7.5h-15"
          />
        </svg>
        추가
      </button>
      <AddItemModal
        open={open}
        onClose={() => setOpen(false)}
        categories={categories}
      />
    </>
  );
}
