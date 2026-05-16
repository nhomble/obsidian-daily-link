# Contributing

Thanks for your interest in Daily Note Linker. This guide covers running the plugin locally and proposing changes.

## Prerequisites

- Node.js 18+
- An Obsidian vault you can use for development (a throwaway vault is recommended)

## Running locally

1. Clone the repo into your vault's plugins folder, or clone anywhere and symlink it:

   ```sh
   git clone https://github.com/nhomble/obsidian-daily-link.git
   cd obsidian-daily-link
   npm install
   ```

2. Build in watch mode:

   ```sh
   npm run dev
   ```

   This produces `main.js` next to `manifest.json`. If you cloned outside the vault, symlink the repo directory into `<vault>/.obsidian/plugins/obsidian-daily-link/`.

3. In Obsidian, enable **Community plugins**, then enable **Daily Note Linker**. Use **Reload app without saving** (or the [Hot Reload](https://github.com/pjeby/hot-reload) plugin) to pick up rebuilds.

## Tests and checks

```sh
npm test         # vitest one-shot
npm run test:watch
npm run lint
npm run build    # type-check + production bundle
```

CI runs the same commands; please make sure they pass before opening a PR.

## Proposing a change

Open a GitHub issue before sending a PR so we can align on scope and approach. Link the issue from your PR description (`Closes #N`).

Small, focused PRs are easier to review than large ones. Include tests when behavior changes.
