export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          사내가이드및지식관리시스템설계헬퍼서비스
        </h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          사내 가이드와 지식을 체계적으로 관리하고 공유하는 공간입니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            가이드 문서
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            업무 프로세스와 기술 가이드를 확인하세요.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            태그
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            태그로 분류된 가이드를 탐색하세요.
          </p>
        </div>

        <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            검색
          </h3>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            필요한 정보를 빠르게 찾아보세요.
          </p>
        </div>
      </div>
    </div>
  );
}
