# Know-How Hub — 프로젝트 소개 및 아키텍처 설명서

## 1. 프로젝트 개요

### 1.1 프로젝트명

**Know-How Hub** — 사내 가이드 및 지식 관리 시스템 설계 헬퍼 서비스

### 1.2 프로젝트 목적

사내 업무 프로세스, 기술 가이드, 노하우 등의 지식 자산을 **체계적으로 작성·관리·공유**하기 위한 웹 애플리케이션입니다.

### 1.3 해결하고자 하는 문제

| 기존 문제 | Know-How Hub 해결 방안 |
|-----------|----------------------|
| 사내 지식이 개인 PC, 메신저, 메일에 분산 | 하나의 웹 서비스에 중앙 집중 |
| 문서 검색이 어렵고 분류 체계 부재 | 태그 기반 분류 + OR/AND 필터링 |
| 코드 스니펫 공유 시 서식 깨짐 | Rich Text Editor + 코드블럭 원클릭 복사 |
| 문서 간 연관 관계 파악 불가 | @mention으로 문서 간 상호 링크 |
| 기존 마크다운 문서 재활용 불가 | 마크다운 파일 임포트 기능 |
| 작성된 문서를 외부에서 활용 불가 | 마크다운 내보내기로 .md 파일 다운로드 |

### 1.4 주요 기능

| 기능 | 설명 |
|------|------|
| Rich Text Editor | Tiptap 기반 WYSIWYG 에디터. 제목, 굵게/이탤릭, 코드블럭, 리스트, 링크, 이미지 삽입 등 |
| 코드블럭 원클릭 복사 | 코드블럭 또는 인라인 코드 클릭 시 클립보드에 즉시 복사 |
| @mention 문서 링크 | `@` 입력으로 다른 가이드를 검색·링크, Ctrl+Click으로 바로 이동 |
| 태그 시스템 | 태그 자동 완성, OR/AND 필터링, "태그 없음" 필터 |
| 첨부파일 관리 | 드래그앤드롭 업로드, 이미지 라이트박스 미리보기, 파일 다운로드 |
| 마크다운 임포트 | .md 파일에서 제목 자동 추출 및 HTML 변환 |
| 마크다운 내보내기 | Tiptap JSON을 마크다운으로 변환하여 .md 파일 다운로드 (YAML 프론트매터 + 태그/날짜 포함) |
| 이미지 업로드 | 에디터 내 드래그앤드롭, 붙여넣기, 파일 선택 + magic bytes 검증 |
| 다크모드 | 시스템 설정에 따른 자동 전환 |

---

## 2. 기술 스택

### 2.1 핵심 기술

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend                             │
│  Next.js 16 (App Router) + React 19 + TypeScript 5          │
│  TailwindCSS 4 + Tiptap 3 (Rich Text Editor)               │
│  React Query 5 + React Hook Form + Zod                      │
│  marked (마크다운 파싱/임포트)                                 │
├─────────────────────────────────────────────────────────────┤
│                        Backend                              │
│  Next.js API Routes (Route Handlers)                        │
│  Server Actions + Server Components                         │
├─────────────────────────────────────────────────────────────┤
│                        Database                             │
│  Prisma 7 ORM + SQLite (Better SQLite3)                     │
│  파일 스토리지: 로컬 파일시스템 (datas/)                      │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 기술 선정 근거

| 기술 | 선정 사유 |
|------|----------|
| **Next.js 16 App Router** | 서버/클라이언트 컴포넌트 분리, Server Actions으로 별도 API 없이 DB 접근, 레이아웃 중첩 |
| **React 19** | use() 훅, 서버 컴포넌트 등 최신 기능 활용 |
| **Prisma + SQLite** | 별도 DB 서버 불필요, 파일 기반으로 배포 간소화, 타입 안전한 쿼리 |
| **Tiptap** | 확장성 높은 에디터 프레임워크, Mention·Image·Link 등 플러그인 생태계 |
| **React Query** | 서버 상태 캐싱, 백그라운드 리페치, staleTime 기반 최적화 |
| **TailwindCSS 4** | 유틸리티 기반 스타일링, 다크모드 기본 지원, 빠른 UI 개발 |
| **marked** | 마크다운 파싱 라이브러리, .md 파일 임포트 시 HTML 변환에 사용 |

---

## 3. 아키텍처

### 3.1 FSD (Feature-Sliced Design) 아키텍처

프로젝트는 **FSD(Feature-Sliced Design)** 아키텍처를 채택하여 관심사를 계층별로 명확히 분리합니다.

```
src/
├── app/              ← Pages & Routing (Next.js App Router)
│   ├── page.tsx               # 홈
│   ├── guides/new/page.tsx    # 새 자료 작성
│   ├── guides/[id]/page.tsx   # 자료 상세/편집
│   └── api/                   # REST API 엔드포인트
│
├── widgets/          ← 독립적인 UI 블록 (레이아웃 단위)
│   └── layout/
│       └── ui/
│           ├── Header.tsx
│           ├── Sidebar.tsx          # 서버 컴포넌트
│           ├── SidebarContent.tsx   # 클라이언트 컴포넌트
│           └── TagFilterModal.tsx
│
├── features/         ← 사용자 대면 기능 (UI + 인터랙션)
│   └── guide/
│       ├── ui/
│       │   ├── GuideForm.tsx
│       │   ├── GuideEditor.tsx      # Tiptap 에디터
│       │   ├── GuideDetailView.tsx
│       │   ├── GuideViewer.tsx      # 읽기 전용 뷰어
│       │   ├── TagInput.tsx
│       │   ├── AttachmentUploader.tsx
│       │   ├── AttachmentList.tsx      # 첨부파일 목록
│       │   ├── ImageLightbox.tsx       # 이미지 전체 화면 미리보기
│       │   ├── MentionList.tsx         # @mention 자동 완성 UI
│       │   ├── MarkdownImportButton.tsx  # .md 파일 임포트
│       │   └── MarkdownExportButton.tsx  # .md 파일 내보내기
│       └── lib/                     # 기능별 유틸리티
│           ├── mentionConfig.ts       # mention 렌더링 설정
│           ├── mentionSuggestion.ts   # @mention 자동 완성 로직
│           ├── parseContent.ts        # Tiptap JSON/HTML 파싱
│           └── toMarkdown.ts          # Tiptap JSON → Markdown 변환
│
├── entities/         ← 비즈니스 도메인 로직
│   ├── guide/
│   │   ├── actions.ts    # Server Actions (CUD)
│   │   └── queries.ts    # 데이터 조회 (React cache)
│   └── tag/
│       ├── actions.ts
│       └── queries.ts
│
├── shared/           ← 공용 유틸리티, 설정, UI
│   ├── lib/prisma.ts        # Prisma 클라이언트 싱글톤
│   ├── ui/Modal.tsx
│   └── types/
│
└── generated/        ← Prisma 자동 생성 타입
```

**FSD 채택 이유:**
- **단방향 의존성**: app → widgets → features → entities → shared (역방향 참조 금지)
- **높은 응집도**: 기능별로 관련 코드가 한 곳에 모임
- **명확한 경계**: 비즈니스 로직(entities)과 UI(features)의 분리
- **확장성**: 새 기능 추가 시 기존 코드에 영향 최소화

### 3.2 서버/클라이언트 컴포넌트 전략

Next.js App Router의 서버/클라이언트 컴포넌트를 다음과 같이 구분합니다:

```
                    ┌─────────────────────────┐
                    │   Server Components     │
                    │   (page.tsx, layout.tsx) │
                    │                         │
                    │  • DB 직접 조회          │
                    │  • 초기 데이터 제공       │
                    │  • SEO, 빠른 초기 로드    │
                    └────────┬────────────────┘
                             │ props (직렬화)
                             ▼
                    ┌─────────────────────────┐
                    │   Client Components     │
                    │   ("use client")        │
                    │                         │
                    │  • 사용자 인터랙션       │
                    │  • 상태 관리             │
                    │  • React Query 캐싱     │
                    │  • 이벤트 핸들링         │
                    └─────────────────────────┘
```

| 구분 | 컴포넌트 | 역할 |
|------|---------|------|
| Server | page.tsx | DB에서 initialData 조회 후 클라이언트에 전달 |
| Server | Sidebar.tsx | getAllGuides(), getAllTags() 호출 |
| Client | GuideDetailView | React Query로 캐싱 + 편집/조회 모드 전환 |
| Client | GuideEditor | Tiptap 에디터 인스턴스 관리 |
| Client | SidebarContent | 필터링, 정렬, 현재 자료 하이라이트 |

### 3.3 데이터 모델 (ERD)

```
┌──────────────────────┐       ┌──────────────────┐
│        Guide         │       │       Tag        │
├──────────────────────┤       ├──────────────────┤
│ id          Int  PK  │◄─────►│ id     Int  PK   │
│ title       String   │  M:N  │ name   String UQ │
│ content     String   │       └──────────────────┘
│ sortOrder   Int      │
│ createdAt   DateTime │
│ updatedAt   DateTime │
├──────────────────────┤
│                      │       ┌──────────────────────┐
│                      │──────►│     Attachment        │
│                      │  1:N  ├──────────────────────┤
└──────────────────────┘       │ id           Int  PK  │
                               │ filename     String   │
                               │ originalName String   │
                               │ mimeType     String   │
                               │ size         Int      │
                               │ guideId      Int? FK  │
                               │ createdAt    DateTime │
                               └──────────────────────┘
                                  (CASCADE 삭제)
```

- **Guide ↔ Tag**: 다대다(M:N) — 하나의 가이드에 여러 태그, 하나의 태그에 여러 가이드
- **Guide → Attachment**: 일대다(1:N) — Guide 삭제 시 첨부파일도 CASCADE 삭제

### 3.4 데이터 흐름

#### 조회 흐름 (서버 → 클라이언트)

```
[사용자 요청]
     │
     ▼
[Server Component: page.tsx]
     │  getGuideById(id)  ← React.cache()로 요청당 중복 제거
     │
     ▼
[Prisma ORM] ──→ [SQLite DB]
     │
     │  initialData (직렬화)
     ▼
[Client Component: GuideDetailView]
     │  React Query useQuery({
     │    initialData,
     │    staleTime: 5분
     │  })
     │
     ▼
[UI 렌더링]
     │
     │  5분 후 재방문 시
     ▼
[Background Refetch] ──→ GET /api/guides/:id ──→ [최신 데이터로 갱신]
```

#### 저장 흐름 (클라이언트 → 서버)

```
[사용자: "저장" 클릭]
     │
     ▼
[Server Action: createGuide / updateGuide]
     │
     ├─ findOrCreateTags(tagNames)  ← 태그 생성 또는 재사용
     ├─ Prisma create/update        ← DB 저장
     ├─ Attachment guideId 연결     ← 첨부파일 연결
     └─ revalidatePath("/", "layout")  ← 전체 캐시 무효화
     │
     ▼
[redirect → /guides/:id]
     │
     ▼
[React Query invalidateQueries] ──→ 최신 데이터 리페치
```

### 3.5 API 엔드포인트 설계

| Method | Endpoint | 용도 |
|--------|----------|------|
| GET | `/api/guides/[id]` | 개별 가이드 조회 (React Query 리페치) |
| GET | `/api/guides/search?q=&excludeId=` | @mention 자료 검색 (최대 10건) |
| GET | `/api/tags?q=` | 태그 자동 완성 (최대 20건) |
| POST | `/api/uploads` | 에디터 이미지 업로드 (5MB, magic bytes 검증) |
| GET | `/api/uploads/[filename]` | 이미지 서빙 (1년 캐시) |
| POST | `/api/attachments` | 첨부파일 업로드 (10MB) |
| GET | `/api/attachments/[filename]` | 첨부파일 다운로드/미리보기 |
| DELETE | `/api/attachments/[filename]` | 첨부파일 삭제 |

### 3.6 캐싱 전략 (3계층)

```
┌─────────────────────────────────────────────────────────┐
│  Layer 1: React.cache()  (서버 측, 요청당)               │
│  └─ 같은 요청 내 동일 쿼리 중복 제거                      │
├─────────────────────────────────────────────────────────┤
│  Layer 2: React Query  (클라이언트 측)                    │
│  └─ staleTime: 5분, initialData로 즉시 표시             │
│  └─ 저장 후 invalidateQueries로 리페치                   │
├─────────────────────────────────────────────────────────┤
│  Layer 3: HTTP Cache-Control  (정적 자산)                │
│  └─ 이미지/첨부파일: max-age=31536000, immutable (1년)   │
└─────────────────────────────────────────────────────────┘
```

---

## 4. 프로젝트 구조 상세

### 4.1 디렉토리 구조

```
know-how-hub/
├── prisma/
│   ├── schema.prisma        # 데이터 모델 정의 (3개 모델)
│   └── migrations/          # DB 스키마 마이그레이션 이력
│
├── src/                     # 소스 코드 (FSD 아키텍처)
│   ├── app/                 # Next.js 라우팅 + API
│   ├── entities/            # 비즈니스 로직 (Server Actions, Queries)
│   ├── features/            # UI 기능 컴포넌트
│   ├── widgets/             # 레이아웃 위젯
│   ├── shared/              # 공용 유틸리티
│   └── generated/           # Prisma 자동 생성 타입
│
├── datas/                   # 데이터 저장소
│   ├── know-how-hub.db      # SQLite 데이터베이스
│   ├── uploads/             # 에디터 이미지 (UUID 파일명)
│   └── attachments/         # 첨부파일 (UUID 파일명)
│
├── package.json
├── next.config.ts
├── tailwind.config.ts
└── prisma.config.ts
```

### 4.2 주요 컴포넌트 (약 50개 파일, 13개 UI 컴포넌트)

| 컴포넌트 | 위치 | 역할 |
|---------|------|------|
| GuideForm | features/guide/ui/ | 새 자료 작성 폼 (마크다운 임포트 기능 포함) |
| GuideEditor | features/guide/ui/ | Tiptap WYSIWYG 에디터 (imperative handle로 외부 제어) |
| GuideDetailView | features/guide/ui/ | 조회/편집 통합 뷰 (React Query 캐시 + 삭제) |
| GuideViewer | features/guide/ui/ | 읽기 전용 뷰어 (코드 복사 등) |
| TagInput | features/guide/ui/ | 태그 입력 + 자동 완성 |
| AttachmentUploader | features/guide/ui/ | 첨부파일 드래그앤드롭 업로더 |
| AttachmentList | features/guide/ui/ | 첨부파일 목록 (다운로드/미리보기) |
| ImageLightbox | features/guide/ui/ | 이미지 전체 화면 미리보기 |
| MentionList | features/guide/ui/ | @mention 자동 완성 드롭다운 UI |
| MarkdownImportButton | features/guide/ui/ | .md 파일 임포트 |
| MarkdownExportButton | features/guide/ui/ | .md 파일 내보내기 (YAML 프론트매터 포함) |
| TagFilterModal | widgets/layout/ui/ | 태그 OR/AND 필터 모달 |
| SidebarContent | widgets/layout/ui/ | 자료 목록 + 정렬 + 필터 |

---

## 5. 보안 고려사항

| 영역 | 대응 |
|------|------|
| SQL Injection | Prisma ORM이 파라미터 바인딩으로 자동 방어 |
| 경로 탐색 공격 | 파일명에 `..` 또는 `/` 포함 시 요청 거부 |
| 파일 위변조 | 이미지 업로드 시 magic bytes 검증 (JPEG, PNG, GIF, WebP만 허용) |
| 파일 크기 제한 | 이미지 5MB, 첨부파일 10MB, 가이드당 최대 10개 |
| UUID 파일명 | 원본 파일명 노출 방지, 충돌 방지 |

---

## 6. 배포 및 운영

### 6.1 설치 및 실행

```bash
# 의존성 설치 (postinstall로 prisma generate 자동 실행)
npm install

# 개발 서버
npm run dev        # http://localhost:3000

# 프로덕션 빌드 및 실행
npm run build
npm run start
```

### 6.2 배포 특성

- **별도 DB 서버 불필요**: SQLite 파일 기반 → 단일 서버로 운영 가능
- **외부 서비스 의존성 없음**: 이미지 CDN, 클라우드 스토리지 없이 로컬 파일시스템 사용
- **마이그레이션 관리**: Prisma Migrate로 스키마 변경 이력 추적

### 6.3 데이터 백업

```
datas/
├── know-how-hub.db    # 이 파일 하나로 전체 데이터 백업 가능
├── uploads/           # 에디터 이미지 파일
└── attachments/       # 첨부파일
```

`datas/` 디렉토리만 백업하면 전체 데이터(DB + 파일)를 복원할 수 있습니다.

---

## 7. 확장 가능성

현재 구현된 기반 위에 다음과 같은 기능 확장이 용이합니다:

| 확장 기능 | 기반 |
|----------|------|
| 사용자 인증/권한 | NextAuth.js 추가, 기존 Server Actions에 인증 미들웨어 적용 |
| 전문 검색 | SQLite FTS5 또는 외부 검색 엔진 연동 |
| 버전 관리 | Guide 모델에 revision 테이블 추가 |
| DB 확장 | Prisma 어댑터 교체로 PostgreSQL/MySQL 전환 가능 |
| 댓글/피드백 | Comment 모델 추가, 기존 FSD 구조에 entities/comment 추가 |

---

## 8. 기술적 차별점 요약

1. **FSD 아키텍처**: 단방향 의존성으로 유지보수성과 확장성 확보
2. **서버/클라이언트 분리**: 서버 컴포넌트로 초기 데이터 로드, 클라이언트 컴포넌트로 인터랙션 처리
3. **3계층 캐싱**: React.cache + React Query + HTTP Cache-Control 조합으로 성능 최적화
4. **Zero 외부 의존성**: DB·파일 저장 모두 로컬로 동작하여 인프라 비용 및 장애 포인트 최소화
5. **타입 안전**: TypeScript + Prisma 자동 생성 타입 + Zod 스키마 검증으로 런타임 에러 최소화
