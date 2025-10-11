# Tennis POV Web App

Full-stack TypeScript web app scaffold with Express (server) and Vite + React (client).

## Quick start

```bash
# install deps
npm install

# start both server and client in dev
npm run dev

# build both
npm run build

# start server (after build)
npm start
```

## Structure

```
.
├── client/       # Vite + React app
├── server/       # Express + TypeScript API
├── package.json  # root scripts for both workspaces
└── README.md
```

## Environment

Copy `.env.example` to `.env` in the root (and optionally in `server/` and `client/`).

Root variables:

```
PORT=5173
API_PORT=4000
```


