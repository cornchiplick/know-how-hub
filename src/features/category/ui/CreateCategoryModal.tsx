"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Modal } from "@/shared/ui/Modal";
import {
  categoryFormSchema,
  type CategoryFormValues,
  createCategory,
} from "@/entities/category";

interface CreateCategoryModalProps {
  open: boolean;
  onClose: () => void;
}

export function CreateCategoryModal({
  open,
  onClose,
}: CreateCategoryModalProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleClose = () => {
    reset();
    setServerError(null);
    onClose();
  };

  const onSubmit = (data: CategoryFormValues) => {
    setServerError(null);

    startTransition(async () => {
      const result = await createCategory(data);

      if (result.success) {
        handleClose();
      } else {
        setServerError(result.error ?? "폴더 생성에 실패했습니다.");
      }
    });
  };

  return (
    <Modal open={open} onClose={handleClose} title="폴더 추가">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="category-name"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            폴더명 <span className="text-red-500">*</span>
          </label>
          <input
            id="category-name"
            type="text"
            maxLength={30}
            placeholder="폴더명을 입력하세요"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? "category-name-error" : undefined}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            {...register("name")}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.name ? (
              <p
                id="category-name-error"
                role="alert"
                className="text-xs text-red-500"
              >
                {errors.name.message}
              </p>
            ) : (
              <span />
            )}
            <span className="text-xs text-zinc-400">최대 30자</span>
          </div>
        </div>

        <div>
          <label
            htmlFor="category-description"
            className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
          >
            설명
          </label>
          <textarea
            id="category-description"
            rows={3}
            maxLength={500}
            placeholder="폴더에 대한 설명을 입력하세요 (선택)"
            aria-invalid={!!errors.description}
            aria-describedby={
              errors.description ? "category-desc-error" : undefined
            }
            className="w-full resize-none rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
            {...register("description")}
          />
          <div className="mt-1 flex items-center justify-between">
            {errors.description ? (
              <p
                id="category-desc-error"
                role="alert"
                className="text-xs text-red-500"
              >
                {errors.description.message}
              </p>
            ) : (
              <span />
            )}
            <span className="text-xs text-zinc-400">최대 500자</span>
          </div>
        </div>

        {serverError && (
          <p
            role="alert"
            className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400"
          >
            {serverError}
          </p>
        )}

        <div className="flex justify-end gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-700">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-md px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {isPending ? "생성 중..." : "생성"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
