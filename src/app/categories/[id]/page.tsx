import { notFound } from "next/navigation";
import Link from "next/link";
import { getCategoryWithGuides } from "@/entities/category/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategoryWithGuides(Number(id));

  return {
    title: category
      ? `${category.name} | Know-How Hub`
      : "폴더를 찾을 수 없음 | Know-How Hub",
  };
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const category = await getCategoryWithGuides(Number(id));

  if (!category) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {category.name}
      </h1>
      {category.description && (
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          {category.description}
        </p>
      )}

      <hr className="my-6 border-zinc-200 dark:border-zinc-700" />

      {category.guides.length === 0 ? (
        <p className="text-sm text-zinc-400 dark:text-zinc-500">
          등록된 자료가 없습니다
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {category.guides.map((guide) => (
            <li key={guide.id}>
              <Link
                href={`/guides/${guide.id}`}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
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
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                {guide.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
