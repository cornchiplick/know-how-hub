"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

interface SidebarContextValue {
  currentGuideId: number | null;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const currentGuideId = (() => {
    const match = pathname.match(/^\/guides\/(\d+)$/);
    return match ? Number(match[1]) : null;
  })();

  return (
    <SidebarContext.Provider value={{ currentGuideId }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const ctx = useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within SidebarProvider");
  }
  return ctx;
}
