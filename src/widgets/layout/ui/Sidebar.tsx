import Link from "next/link";
import { getCategories } from "@/entities/category/queries";
import { SidebarAddButton } from "./SidebarAddButton";

export async function Sidebar() {
  const categories = await getCategories();

  return (
    <aside className="flex w-60 flex-col border-r border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="border-b border-zinc-200 p-3 dark:border-zinc-800">
        <SidebarAddButton />
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
              <Link
                key={category.id}
                href={`/categories/${category.id}`}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
                title={category.description ?? undefined}
              >
                <svg
                  className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
                  />
                </svg>
                <span className="truncate">{category.name}</span>
              </Link>
            ))}
          </div>
        )}
      </nav>
    </aside>
  );
}
