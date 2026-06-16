# XAI-IDS Frontend

React + Vite cybersecurity dashboard UI.

## Requirements

- Node.js LTS (18 or 20)
- npm

## Setup & Run

```
npm install
npm run dev
```

Opens at: http://localhost:3000

**Default login:** `admin` / `xai@2024`

## Pages

| Route | Description |
|-------|-------------|
| / (Login) | Secure login screen |
| /dashboard | Real-time stats, charts, and recent alerts |
| /alerts | Sortable/filterable alert table with SHAP detail |
| /traffic | Live traffic charts and top-talker analysis |
| /scan | Manual packet scan with XAI explanation |
| /reports | Generate and download security reports |
| /settings | ML config, alert thresholds, model training |

## Tech Stack

- React 18
- Vite 5
- Tailwind CSS 3
- Recharts (charts)
- Axios (API calls)
- React Router v6
- Lucide React (icons)

## Connecting to Backend

The Vite dev server proxies `/api` to `http://localhost:5000`.
Start the Flask backend first, or the UI will use built-in demo data.
