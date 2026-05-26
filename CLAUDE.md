# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Vite, hot reload)
npm run build     # Type-check + production build (tsc -b && vite build)
npm run lint      # ESLint
npm run preview   # Preview production build locally
```

There is no test suite configured.

## Architecture

This is a **React 19 + TypeScript + Vite** single-page application for managing a Catholic catechesis program ("Gestão de Catequese"). All data is persisted exclusively in **`localStorage`** — there is no backend or API.

### State management (`src/store/useStore.ts`)

All state lives in a single generic `useCollection<T>` hook that wraps `useState` + `useEffect` to sync each collection to `localStorage`. Five named hooks are exported:

- `useCatequizandos` — students (catequizandos)
- `useCatequistas` — teachers/catechists
- `useTurmas` — class groups (turmas)
- `usePresencas` — attendance records
- `useLancamentos` — cash flow entries

Each hook returns `{ items, add, update, remove }`. Pages call these hooks directly — there is no global store/context.

### Types (`src/types/index.ts`)

Canonical domain types: `Catequizando`, `Catequista`, `Turma`, `RegistroPresenca`, `LancamentoCaixa`. The `Nivel` union type lists all catechesis levels from "Iniciação Cristã 1" through "Crisma 2".

### Routing (`src/App.tsx`)

React Router v7 with a single nested layout. All pages render inside `<Layout />` via `<Outlet />`.

| Route | Page |
|---|---|
| `/` | Dashboard |
| `/turmas` | Turmas |
| `/catequizandos` | Catequizandos |
| `/catequistas` | Catequistas |
| `/presenca` | Presença |
| `/caixa` | Fluxo de Caixa |

### Styling

Tailwind CSS v3 + PostCSS. The sidebar uses `bg-blue-900` as the primary brand color. Icons are from `lucide-react`.

### Shared components (`src/components/`)

- `Layout.tsx` — responsive sidebar (desktop) + slide-over drawer (mobile) with navigation
- `Modal.tsx` — reusable modal wrapper
- `ConfirmDialog.tsx` — confirmation dialog for destructive actions

### Custom hooks (`src/hooks/`)

- `useLocalStorage.ts` — low-level hook used internally by `useCollection`
