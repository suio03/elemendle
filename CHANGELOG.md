# Changelog

## [0.1.0] - 2026-08-18

### Added

- Added varied practice challenges for element identification, property extremes, and odd-one-out questions, alongside a replayable classic mode.
- Added a personal element collection, discovery progression, candidate filtering, richer analytics, and versioned import/export support.
- Added automated coverage for game rules, challenges, practice selection, progression, storage, analytics, and data transfer.

### Changed

- Polished the daily-game flow with clearer progress, responsive guess cards, optional hints, improved results, and connected navigation between Daily, Practice, and Collection.
- Upgraded the application to Next.js 16, React 19, next-intl 4, ESLint 9, TypeScript 5.9, and the current test/build toolchain.
- Expanded the refreshed experience and gameplay copy across all supported locales.

### Fixed

- Reworked statistics and discovery persistence around merge-safe event ledgers so imports remain additive and idempotent across devices.
- Fixed Next.js 16 routing, async layout APIs, duplicate root markup, and hydration compatibility.
- Removed known dependency vulnerabilities and restored clean production builds.

### Removed

- Removed obsolete duplicate UI components, unused chart/calendar dependencies, legacy middleware, and redundant root layout code.
