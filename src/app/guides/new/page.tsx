import { GuideForm } from "@/features/guide";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "새 자료 작성 | 사내가이드및지식관리시스템설계헬퍼서비스",
};

export default function NewGuidePage() {
  return <GuideForm />;
}
