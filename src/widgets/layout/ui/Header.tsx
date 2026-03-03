"use client";

import { resetAllData } from "@/entities";
import { useTransition } from "react";

export function Header() {
  const [isPending, startTransition] = useTransition();

  const handleLogoClick = () => {
    if (process.env.NODE_ENV === "production") return;

    const confirmed = window.confirm(
      "모든 데이터를 초기화합니다. 계속하시겠습니까?",
    );
    if (!confirmed) return;

    startTransition(async () => {
      const result = await resetAllData();
      if (!result.success) {
        alert(result.error);
      }
    });
  };

  return (
    <header className="flex h-14 items-center border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h1
        className="cursor-pointer select-none text-lg font-semibold text-zinc-900 dark:text-zinc-100"
        onClick={handleLogoClick}
      >
        {isPending
          ? "초기화 중..."
          : "사내가이드및지식관리시스템설계헬퍼서비스"}
      </h1>
    </header>
  );
}
