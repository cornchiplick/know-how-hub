import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategoryById } from "@/entities/category/queries";
import { GuideForm } from "@/features/guide";

export const metadata: Metadata = {
  title: "새 자료 작성 | Know-How Hub",
};

export default async function NewGuidePage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string }>;
}) {
  const { categoryId } = await searchParams;

  if (!categoryId) {
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
                d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
              />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            카테고리를 선택해주세요
          </h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            사이드바에서 폴더를 선택하거나 카테고리 페이지에서 자료를
            추가해주세요.
          </p>
        </div>
      </div>
    );
  }

  const parsedId = Number(categoryId);
  if (Number.isNaN(parsedId) || parsedId <= 0) {
    notFound();
  }

  const category = await getCategoryById(parsedId);

  if (!category) {
    notFound();
  }

  return <GuideForm categoryId={category.id} categoryName={category.name} />;
}
