"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";

interface SidebarContextValue {
  expandedCategories: Set<number>;
  toggleCategory: (id: number) => void;
  expandCategory: (id: number) => void;
  currentGuideId: number | null;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    () => new Set(),
  );

  const currentGuideId = (() => {
    const match = pathname.match(/^\/guides\/(\d+)$/);
    return match ? Number(match[1]) : null;
  })();

  const toggleCategory = useCallback((id: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandCategory = useCallback((id: number) => {
    setExpandedCategories((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  return (
    <SidebarContext.Provider
      value={{ expandedCategories, toggleCategory, expandCategory, currentGuideId }}
    >
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
