import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="flex w-60 flex-col border-r border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <nav className="flex flex-col gap-1">
        <Link
          href="/"
          className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          홈
        </Link>
        <Link
          href="/guides"
          className="rounded-md px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          가이드
        </Link>
      </nav>
    </aside>
  );
}
