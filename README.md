# 🧩 ArtShare Admin Panel – Folder Structure Guide

This is a simple and clean folder structure for the **ArtShare Admin Panel**, built using **React + Vite**. This structure is optimized for clarity and ease of collaboration across a small team.

---

## 📁 Folders Overview

### `assets/`

Static assets like images and icons (e.g., logos, SVGs).

---

### `components/`

Reusable **presentational components** shared across pages.

- `common/` – Small generic components.
- `layout/` – App-wide layout components like `Header`, `Sidebar`, etc.

---

### `features/`

Organized by domain logic. Each folder contains:

- React components specific to that feature (e.g., `UsersPage.tsx`)
- API calls (e.g., `userAPI.ts`)
- State management (e.g., `userSlice.ts` for Redux or Zustand)

Includes:

- `auth/` – Login, logout logic
- `users/` – User management
- `posts/` – Posts CRUD
- `comments/` – Moderation and listing
- `reports/` – Abuse report handling
- `categories/` – Post/category classification
- `statistics/` – Charts, metrics, dashboard widgets

---

### `hooks/`

Custom React hooks shared across features (e.g., `useAuth`, `useDebounce`, etc.)

---

### `pages/`

(Optionally) holds route-level components, mainly used if you want to keep route logic centralized. You can remove this if you're colocating pages inside `features/`.

---

### `utils/`

Pure utility functions and helpers (e.g., `formatDate.ts`, `apiClient.ts`).

---

### Root Files

- `App.tsx` – Root component that sets up routing and layout.
- `main.tsx` – React entry point (used by Vite).
- `index.css` – Global styles.

---

## 📌 Summary

- **Domain-first:** All logic is grouped under `features/` by topic.
- **Reusable UI:** Generic components live in `components/`.
- **Custom logic:** Put reusable hooks in `hooks/`, and shared functions in `utils/`.
- **Minimal routing setup** with `App.tsx` and centralized routes.

---

This structure is designed to be simple, readable, and flexible as we add more admin features.
