import { getGuideById } from "@/entities/guide/queries";
import { GuideDetailView } from "@/features/guide";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const guide = await getGuideById(Number(id));

  return {
    title: guide
      ? `${guide.title} | 사내가이드및지식관리시스템설계헬퍼서비스`
      : "자료를 찾을 수 없음 | 사내가이드및지식관리시스템설계헬퍼서비스",
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
