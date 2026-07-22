# The Messi Archive

A lightweight, Barça-themed dashboard for exploring Lionel Messi's career season by season and tracking films, documentaries and docuseries about him.

## Features

- 23 career chapters with statistics, stories, team honours and individual awards
- Distinct vector artwork for each trophy family
- International media library with posters, IMDb ratings and viewing links
- Account-based watched, read, listened and explored progress
- Small Cloudflare Worker API with D1 persistence and cookie sessions
- PBKDF2 password hashing; session tokens stay in secure HttpOnly cookies
- Responsive layout

## Live app

[messi-archive.ukaushik37.workers.dev](https://messi-archive.ukaushik37.workers.dev)

## Run locally

```bash
git clone https://github.com/u-kaushik/messi-career-vault.git
cd messi-career-vault
npm install
npm start
```

Open the localhost address printed by Wrangler. The local D1 schema is created automatically.

## Persistence

Production uses one D1 database bound to one Worker. Apply schema changes and deploy with:

```bash
npm run db:apply
npm run deploy
```

## Readwise Reader delivery

Every deployment finishes by idempotently syncing new or changed long reads to Reader. Set `READWISE_TOKEN` in the shell or store it in macOS Keychain under service `messi-archive-readwise-token`; the token is never committed. Verified delivery receipts live in the ignored `.reader-sync.json` file.

```bash
npm run reader:sync
npm run reader:sync -- --season=2016–17
```

## Notes

Streaming availability varies by country. IMDb ratings are snapshots and can change. Poster artwork is loaded from third-party metadata endpoints and is not bundled in this repository.

## License

MIT
