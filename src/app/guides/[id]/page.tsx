import { notFound } from "next/navigation";
import { getGuideById } from "@/entities/guide/queries";
import { GuideDetailView } from "@/features/guide";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = await getGuideById(Number(id));

  return {
    title: guide
      ? `${guide.title} | Know-How Hub`
      : "자료를 찾을 수 없음 | Know-How Hub",
  };
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = await getGuideById(Number(id));

  if (!guide) {
    notFound();
  }

  return (
    <GuideDetailView
      guide={{
        ...guide,
        createdAt: guide.createdAt.toISOString(),
        updatedAt: guide.updatedAt.toISOString(),
      }}
    />
  );
}
