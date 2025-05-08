<<<<<<< Updated upstream
# 🚀 Getting started with Strapi

Strapi comes with a full featured [Command Line Interface](https://docs.strapi.io/dev-docs/cli) (CLI) which lets you scaffold and manage your project in seconds.

### `develop`

Start your Strapi application with autoReload enabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-develop)

```
npm run develop
# or
yarn develop
```

### `start`

Start your Strapi application with autoReload disabled. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-start)

```
npm run start
# or
yarn start
```

### `build`

Build your admin panel. [Learn more](https://docs.strapi.io/dev-docs/cli#strapi-build)

```
npm run build
# or
yarn build
```

## ⚙️ Deployment

Strapi gives you many possible deployment options for your project including [Strapi Cloud](https://cloud.strapi.io). Browse the [deployment section of the documentation](https://docs.strapi.io/dev-docs/deployment) to find the best solution for your use case.

```
yarn strapi deploy
```

## 📚 Learn more

- [Resource center](https://strapi.io/resource-center) - Strapi resource center.
- [Strapi documentation](https://docs.strapi.io) - Official Strapi documentation.
- [Strapi tutorials](https://strapi.io/tutorials) - List of tutorials made by the core team and the community.
- [Strapi blog](https://strapi.io/blog) - Official Strapi blog containing articles made by the Strapi team and the community.
- [Changelog](https://strapi.io/changelog) - Find out about the Strapi product updates, new features and general improvements.

Feel free to check out the [Strapi GitHub repository](https://github.com/strapi/strapi). Your feedback and contributions are welcome!

## ✨ Community

- [Discord](https://discord.strapi.io) - Come chat with the Strapi community including the core team.
- [Forum](https://forum.strapi.io/) - Place to discuss, ask questions and find answers, show your Strapi project and get feedback or just talk with other Community members.
- [Awesome Strapi](https://github.com/strapi/awesome-strapi) - A curated list of awesome things related to Strapi.

---

<sub>🤫 Psst! [Strapi is hiring](https://strapi.io/careers).</sub>
=======
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
>>>>>>> Stashed changes
