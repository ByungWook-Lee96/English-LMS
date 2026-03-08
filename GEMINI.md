# English LMS 프로젝트

## 프로젝트 개요
화상 영어 과외 서비스를 위한 웹 기반 LMS (학습 관리 시스템).
**영어 선생님**과 **마스터(관리자)**가 학생 정보, 수업 횟수, 시간표를 관리한다.
UI 텍스트(라벨, 버튼, 플레이스홀더, 메시지 등)는 모두 **영어**로 작성한다.

---

## 기술 스택

### 공통
- **Package Manager: Yarn** (npm 금지, 모든 명령어는 `yarn` 사용)
- **Shared Types**: `shared/types/index.ts`에서 공통 타입 관리

### 프론트엔드 (`/client`)
- React 18 + TypeScript, Vite
- React Router v7 (라우팅)
- TanStack Query v5 (서버 상태 / API 호출, useEffect로 fetch 금지)
- Zustand + persist 미들웨어 (인증 전역 상태, `src/stores/authStore.ts`)
- React Hook Form + Zod (모든 폼 유효성 검사)
- FullCalendar (`@fullcalendar/react`, `daygrid`, `timegrid`, `interaction`)
- Tailwind CSS + shadcn/ui (스타일링)
- Axios (HTTP 클라이언트, 반드시 `src/lib/axios.ts` 인스턴스만 사용)

### 백엔드 (`/server`)
- Node.js + Express + TypeScript (ESM 환경)
- Prisma ORM (MySQL)
- JWT — 액세스 토큰: `Authorization: Bearer <token>` 헤더
- bcrypt (비밀번호 해싱)
- Nodemailer (시간표 변경 시 마스터에게 이메일 알림)

---

## 사용자 역할 및 권한 규칙

### 1. 역할 정의
| 역할 | 설명 |
|---|---|
| `MASTER` | 시스템 전체 리소스 접근 가능 (선생님 추가/목록, 전체 학생/스케줄) |
| `TEACHER` | 본인 담당 리소스만 접근 가능 (본인 프로필, 담당 학생, 담당 스케줄) |

### 2. 권한 보안 수칙
- **JWT Payload**: 토큰 생성 시 `id`, `role`, `teacherId`가 반드시 포함되어야 함.
- **Access Control**: 
    - `TEACHER`는 `/api/teachers/:id` 호출 시 본인의 `teacherId`만 조회 가능.
    - 프론트엔드 라우팅(`/teachers/:id`)은 `MASTER`와 `TEACHER` 모두 허용하되, 데이터는 백엔드에서 필터링.
- **Data Filtering**: 모든 조회 API는 `req.user.teacherId`를 기반으로 필터링을 강제해야 함.

---

## 핵심 비즈니스 로직: 세션-일정 동기화 (Strict Session Sync)

### 1. 세션 총량 보전 법칙
- **원칙**: "전체 수업 횟수(`totalSessions`) = 과거 수업 수 + 미래 예약 수업 수"를 항상 유지한다.
- **동기화 시점**: 세션 수 변경, 학생 요일/시간 변경, 일정 수동 추가/삭제 시 발동.

### 2. 일정 보호 (isManual 필드)
- **isManual: true**: 사용자가 직접 생성하거나, 기존 일정을 드래그/수정하여 날짜/시간을 바꾼 경우. 자동 동기화 로직이 절대 삭제하지 않음.
- **isManual: false**: 시스템이 요일 규칙에 따라 자동 생성한 일정. 세션 수 조절 시 가장 먼 미래부터 삭제되거나 새로 생성됨.

### 3. SUBSTITUTE (보충 수업) 로직
- 상태를 `SUBSTITUTE`로 변경하면 해당 일정은 "고정(Fixed)"된 것으로 간주하며, 캘린더 타이틀 앞에 `(sub)` 접두어가 붙음.
- 일정 이동 시 `isManual`이 `true`가 되어 시스템 자동 삭제로부터 보호됨.

## UI Style Guide

### 1. Page Headers (Standard Page Titles)
- **Component**: `PageHeader` (`client/src/components/common/PageHeader.tsx`)
- **Usage**: Every main page (Dashboard, Students, Schedule, Teachers) must use this component at the top.
- **Icons**:
    - Dashboard: `LayoutDashboard`
    - Students: `Users`
    - Class Schedule: `Calendar`
    - Teachers: `ShieldCheck`
- **Style**: `text-3xl font-extrabold text-slate-900 tracking-tight`. No `italic` in page titles.

### 2. Modal Headers
- **Component**: `ModalHeader` (`client/src/components/common/ModalHeader.tsx`)
- **Usage**: All modals must use this for consistency.
- **Style**: `text-2xl font-black text-slate-900 tracking-tight`. No `italic`.

### 3. Visual Consistency
- All interactive elements (buttons, inputs) should use `rounded-2xl` or `rounded-xl` for a modern, soft look.
- Use `slate-900` for primary text and `indigo-600` for primary actions/accents.
- UI animations: Use `animate-in fade-in duration-500` for page transitions.

---

## 코딩 및 작업 규칙
- **UI 텍스트는 모두 영어**로 작성.
- **Type Safety**: Express 타입은 `import type { Request, Response, NextFunction } from 'express'`와 같이 `type` 키워드를 명시하여 ESM 런타임 에러 방지.
- **에러 보고**: 동일한 에러가 2회 이상 반복되면 즉시 중단 후 원인 보고 (한국어).
