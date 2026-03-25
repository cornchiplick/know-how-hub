# Know-How Hub API

AI 등 외부 클라이언트가 가이드 문서를 입/출력할 수 있는 REST API입니다.

## 인증

쓰기 엔드포인트(POST, PUT, DELETE)는 API 키 인증이 필요합니다.
읽기 엔드포인트(GET)는 인증 없이 사용할 수 있습니다.

```
Authorization: Bearer <API_SECRET_KEY>
```

API 키는 `.env` 파일의 `API_SECRET_KEY`에 설정합니다.

---

## 엔드포인트

### 가이드 목록 조회

```
GET /api/guides
GET /api/guides?format=markdown
```

**인증**: 불필요

**쿼리 파라미터**:

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `format` | string | `markdown`으로 설정하면 본문을 마크다운으로 변환하여 반환 |

**응답 예시** (기본):

```json
[
  {
    "id": 1,
    "title": "Git 브랜치 전략",
    "createdAt": "2026-03-20T09:00:00.000Z",
    "updatedAt": "2026-03-21T14:30:00.000Z",
    "tags": [
      { "id": 1, "name": "git" },
      { "id": 2, "name": "devops" }
    ]
  }
]
```

**응답 예시** (`?format=markdown`):

```json
[
  {
    "id": 1,
    "title": "Git 브랜치 전략",
    "content": "## 개요\n\n브랜치 전략에 대한 설명...",
    "createdAt": "2026-03-20T09:00:00.000Z",
    "updatedAt": "2026-03-21T14:30:00.000Z",
    "tags": [...]
  }
]
```

---

### 가이드 상세 조회

```
GET /api/guides/:id
GET /api/guides/:id?format=markdown
```

**인증**: 불필요

**쿼리 파라미터**:

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `format` | string | `markdown`으로 설정하면 본문을 마크다운으로 변환하여 반환. 미지정 시 Tiptap JSON 원본 반환 |

**응답 예시** (`?format=markdown`):

```json
{
  "id": 1,
  "title": "Git 브랜치 전략",
  "content": "## 개요\n\n브랜치 전략에 대한 설명...",
  "createdAt": "2026-03-20T09:00:00.000Z",
  "updatedAt": "2026-03-21T14:30:00.000Z",
  "tags": [
    { "id": 1, "name": "git" }
  ],
  "attachments": [
    {
      "id": 1,
      "filename": "abc123.png",
      "originalName": "diagram.png",
      "mimeType": "image/png",
      "size": 45678
    }
  ]
}
```

**에러**:
- `404` — 가이드가 존재하지 않음

---

### 가이드 생성

```
POST /api/guides
```

**인증**: 필수

**요청 본문**:

```json
{
  "title": "새 가이드 제목",
  "content": "## 소개\n\n마크다운 본문을 작성합니다.\n\n- 리스트\n- 항목",
  "tags": ["git", "tutorial"]
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `title` | string | O | 가이드 제목 |
| `content` | string | O | 마크다운 형식의 본문 |
| `tags` | string[] | X | 태그 이름 배열 (없으면 자동 생성) |

**응답** (`201 Created`):

```json
{
  "id": 5,
  "title": "새 가이드 제목",
  "createdAt": "2026-03-25T10:00:00.000Z",
  "updatedAt": "2026-03-25T10:00:00.000Z",
  "tags": [
    { "id": 3, "name": "git" },
    { "id": 4, "name": "tutorial" }
  ]
}
```

**에러**:
- `400` — title 또는 content 누락
- `401` — 인증 실패

---

### 가이드 수정

```
PUT /api/guides/:id
```

**인증**: 필수

**요청 본문**:

```json
{
  "title": "수정된 제목",
  "content": "## 수정된 내용\n\n마크다운 본문...",
  "tags": ["git", "advanced"]
}
```

| 필드 | 타입 | 필수 | 설명 |
|------|------|------|------|
| `title` | string | O | 가이드 제목 |
| `content` | string | O | 마크다운 형식의 본문 |
| `tags` | string[] | X | 태그 배열 (기존 태그를 완전히 대체) |

**응답** (`200 OK`):

```json
{
  "id": 5,
  "title": "수정된 제목",
  "createdAt": "2026-03-25T10:00:00.000Z",
  "updatedAt": "2026-03-25T11:00:00.000Z",
  "tags": [
    { "id": 3, "name": "git" },
    { "id": 5, "name": "advanced" }
  ]
}
```

**에러**:
- `400` — title 또는 content 누락
- `401` — 인증 실패
- `404` — 가이드가 존재하지 않음

---

### 가이드 삭제

```
DELETE /api/guides/:id
```

**인증**: 필수

**응답** (`200 OK`):

```json
{
  "success": true
}
```

**에러**:
- `401` — 인증 실패
- `404` — 가이드가 존재하지 않음

---

### 가이드 검색

```
GET /api/guides/search?q=검색어
```

**인증**: 불필요

**쿼리 파라미터**:

| 파라미터 | 타입 | 설명 |
|---------|------|------|
| `q` | string | 검색어 (제목 기준, 최대 100자) |
| `excludeId` | number | 제외할 가이드 ID |

**응답**: 최대 10개 가이드 배열 (id, title)

---

### 태그 검색

```
GET /api/tags?q=검색어
```

**인증**: 불필요

**응답**: 최대 20개 태그 배열 (id, name)

---

## curl 예제

```bash
# 목록 조회 (마크다운)
curl http://localhost:3000/api/guides?format=markdown

# 개별 조회
curl http://localhost:3000/api/guides/1?format=markdown

# 가이드 생성
curl -X POST http://localhost:3000/api/guides \
  -H "Authorization: Bearer khub_sk_YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Docker 기초",
    "content": "## Docker란?\n\n컨테이너 기반 가상화 기술입니다.\n\n### 기본 명령어\n\n- `docker build` - 이미지 빌드\n- `docker run` - 컨테이너 실행",
    "tags": ["docker", "devops"]
  }'

# 가이드 수정
curl -X PUT http://localhost:3000/api/guides/1 \
  -H "Authorization: Bearer khub_sk_YOUR_KEY_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Docker 기초 (업데이트)",
    "content": "## Docker란?\n\n수정된 내용...",
    "tags": ["docker", "devops", "container"]
  }'

# 가이드 삭제
curl -X DELETE http://localhost:3000/api/guides/1 \
  -H "Authorization: Bearer khub_sk_YOUR_KEY_HERE"
```

---

## 참고

- 입력은 **마크다운**으로 받아 서버에서 Tiptap JSON으로 변환하여 저장합니다.
- 출력 시 `?format=markdown`을 지정하면 Tiptap JSON을 마크다운으로 변환하여 반환합니다.
- 태그는 존재하지 않으면 자동 생성됩니다.
- PUT 요청의 `tags`는 기존 태그를 **완전히 교체**합니다 (merge가 아닌 set).
