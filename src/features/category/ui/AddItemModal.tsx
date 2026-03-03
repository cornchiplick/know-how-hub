"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/shared/ui/Modal";
import { CreateCategoryModal } from "./CreateCategoryModal";

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface AddItemModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
}

type Step = "menu" | "selectFolder";

export function AddItemModal({ open, onClose, categories }: AddItemModalProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("menu");
  const [showCreateCategory, setShowCreateCategory] = useState(false);

  const handleClose = () => {
    onClose();
    setStep("menu");
  };

  const handleFolderClick = () => {
    handleClose();
    setShowCreateCategory(true);
  };

  const handleGuideClick = () => {
    setStep("selectFolder");
  };

  const handleSelectFolder = (categoryId: number) => {
    handleClose();
    router.push(`/guides/new?categoryId=${categoryId}`);
  };

  const handleBack = () => {
    setStep("menu");
  };

  const handleCreateFolderFromEmpty = () => {
    handleClose();
    setShowCreateCategory(true);
  };

  const handleCategoryModalClose = () => {
    setShowCreateCategory(false);
  };

  const title = step === "menu" ? "추가하기" : "폴더 선택";

  return (
    <>
      <Modal open={open} onClose={handleClose} title={title}>
        {step === "menu" ? (
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
        ) : (
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex items-center gap-1 self-start text-sm text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
              뒤로
            </button>
            {categories.length > 0 ? (
              <div className="flex flex-col gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleSelectFolder(category.id)}
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
                    <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      {category.name}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <svg
                    className="h-6 w-6 text-zinc-400 dark:text-zinc-500"
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
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  폴더가 없습니다. 먼저 폴더를 추가해주세요.
                </p>
                <button
                  type="button"
                  onClick={handleCreateFolderFromEmpty}
                  className="mt-3 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
                >
                  폴더 추가
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
      <CreateCategoryModal
        open={showCreateCategory}
        onClose={handleCategoryModalClose}
      />
    </>
  );
}
