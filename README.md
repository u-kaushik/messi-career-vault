# The Messi Archive

A lightweight, Barça-themed dashboard for exploring Lionel Messi's career season by season and tracking films, documentaries and docuseries about him.

## Features

- 23 career chapters with statistics, stories, team honours and individual awards
- Distinct vector artwork for each trophy family
- International media library with posters, IMDb ratings and viewing links
- Watched and explored progress tracking
- Tiny zero-dependency Node persistence API with automatic `localStorage` fallback
- Responsive layout with no account or external database required

## Run locally

```bash
git clone https://github.com/u-kaushik/messi-career-vault.git
cd messi-career-vault
npm install
npm run build
npm start
```

Open [http://localhost:4173](http://localhost:4173).

For frontend development, run `npm run dev` and open `http://localhost:5173`. Progress falls back to browser storage when the API is unavailable.

## Persistence

The server assigns no accounts and collects no personal details. Each browser creates a random profile identifier, stored locally, and syncs progress to `data/progress.json`. That file is ignored by Git. Delete it to reset all server-side profiles.

Set `PORT` to run on another port:

```bash
PORT=8080 npm start
```

## Notes

Streaming availability varies by country. IMDb ratings are snapshots and can change. Poster artwork is loaded from third-party metadata endpoints and is not bundled in this repository.

## License

MIT
