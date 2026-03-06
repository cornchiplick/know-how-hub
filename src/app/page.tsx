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

      <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="mb-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          주요 기능
        </h3>
        <ul className="flex flex-col gap-2">
          <li className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="text-zinc-400 dark:text-zinc-500">&#10003;</span>
            코드블럭을 클릭하면 클립보드에 바로 복사됩니다.
          </li>
          <li className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="text-zinc-400 dark:text-zinc-500">&#10003;</span>
            인라인 코드도 클릭 한 번으로 복사할 수 있습니다.
          </li>
          <li className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="text-zinc-400 dark:text-zinc-500">&#10003;</span>
            @를 입력하면 다른 가이드를 검색하고 링크할 수 있습니다.
          </li>
          <li className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="text-zinc-400 dark:text-zinc-500">&#10003;</span>
            태그로 가이드를 분류하고, 사이드바에서 태그별로 필터링할 수 있습니다.
          </li>
          <li className="flex items-start gap-2 text-sm text-zinc-600 dark:text-zinc-400">
            <span className="text-zinc-400 dark:text-zinc-500">&#10003;</span>
            태그 입력 시 기존 태그를 자동으로 제안합니다.
          </li>
        </ul>
      </div>
    </div>
  );
}
