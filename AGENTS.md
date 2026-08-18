# Repository Guidelines

## Project Structure & Module Organization

This is a Next.js/TypeScript app for the Elemendle periodic-table guessing game. App Router pages and layouts live in `app/`, with localized routes under `app/[locale]/`. Reusable React components are in `components/` and UI primitives in `components/ui/`. Game logic and storage helpers live in `lib/`, shared types in `types/`, React context in `contexts/`, and static element data in `data/atom.json`. Translation files are organized by locale in `messages/`; public assets are in `public/`.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the local Next.js development server.
- `npm run build`: create a production build and run Next.js compile-time checks.
- `npm run build:cloudflare`: generate the deployable OpenNext Worker bundle.
- `npm run start`: serve the production build locally after `npm run build`.
- `npm run lint`: run the Next.js ESLint configuration.
- `npm test`: run the Vitest suite once.

## Coding Style & Naming Conventions

Use TypeScript and React functional components. Keep strict type safety intact (`tsconfig.json` has `strict: true`) and prefer the `@/` import alias for internal modules. Component files use kebab-case names such as `game-board.tsx`, while exported React components use PascalCase. Keep hooks named with the `use*` pattern. Follow the existing Tailwind-first styling approach and reuse `components/ui/` primitives before adding new UI building blocks. Preserve the current formatting style: two-space JSON indentation, semicolon-free TS/TSX, and concise imports.

## Testing Guidelines

Vitest covers the game rules, challenges, persistence, analytics, progression, and data transfer. Keep focused specs beside their modules with the `.test.ts` suffix. Run `npm test`, `npm run lint`, and `npm run build` for normal changes; deployment changes must also pass `npm run build:cloudflare`.

## Commit & Pull Request Guidelines

Recent commits use short, direct messages such as `fix type error` and `add more analytics`; keep commits concise and action-oriented. Pull requests should include a brief summary, verification commands run, screenshots or screen recordings for UI changes, and notes for any translation, data, or Cloudflare-related changes. Link issues when applicable and call out any follow-up work explicitly.

## Security & Configuration Tips

Keep secrets out of git. Local environment values belong in `.env`, and deployment-specific settings should stay in the hosting platform. Use the Node version pinned in `.node-version`. Treat `wrangler.jsonc`, `open-next.config.ts`, `middleware.ts`, and locale routes as deployment-sensitive because they affect Cloudflare routing and public URLs.
