import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "자료 상세 | Know-How Hub",
};

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <svg
            className="h-8 w-8 text-zinc-400 dark:text-zinc-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          자료 상세
        </h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          자료 #{id} 상세 페이지가 준비 중입니다.
        </p>
      </div>
    </div>
  );
}
