"use client";

import Link from "next/link";
import { SidebarAddButton } from "./SidebarAddButton";
import { CategoryTreeItem } from "./CategoryTreeItem";

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface SidebarContentProps {
  categories: Category[];
}

export function SidebarContent({ categories }: SidebarContentProps) {
  return (
    <aside className="flex w-60 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 p-3 dark:border-zinc-800">
        <SidebarAddButton categories={categories} />
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-auto p-3">
        <Link
          href="/"
          className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          홈
        </Link>
        {categories.length > 0 && (
          <div className="mt-3">
            <div className="mb-1 px-3 text-xs font-semibold tracking-wider text-zinc-400 uppercase dark:text-zinc-500">
              폴더
            </div>
            {categories.map((category) => (
              <CategoryTreeItem
                key={category.id}
                id={category.id}
                name={category.name}
                description={category.description}
              />
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}
