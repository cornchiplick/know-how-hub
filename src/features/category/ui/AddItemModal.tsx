"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/shared/ui/Modal";
import { CreateCategoryModal } from "./CreateCategoryModal";

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddItemModal({ open, onClose }: AddItemModalProps) {
  const router = useRouter();
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  const handleFolderClick = () => {
    onClose();
    setShowCreateCategory(true);
  };

  const handleGuideClick = () => {
    onClose();
    router.push("/guides/new");
  };

  const handleCategoryModalClose = () => {
    setShowCreateCategory(false);
  };

  return (
    <>
      <Modal open={open} onClose={onClose} title="추가하기">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={handleFolderClick}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <svg
              className="h-5 w-5 text-zinc-500 dark:text-zinc-400"
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
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                폴더 추가
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                카테고리를 생성하여 자료를 분류합니다.
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={handleGuideClick}
            className="flex items-center gap-3 rounded-lg border border-zinc-200 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            <svg
              className="h-5 w-5 text-zinc-500 dark:text-zinc-400"
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
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                자료 추가
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                새로운 가이드 문서를 작성합니다.
              </div>
            </div>
          </button>
        </div>
      </Modal>
      <CreateCategoryModal
        open={showCreateCategory}
        onClose={handleCategoryModalClose}
      />
    </>
  );
}
