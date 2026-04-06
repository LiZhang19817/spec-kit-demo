/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional absolute or site-relative URL for movies.json (default `/data/movies.json`) */
  readonly VITE_MOVIE_DATA_URL?: string;
  readonly VITE_TMDB_API_KEY?: string;
  /**
   * When `true`, the Update button (in dev) first POSTs to `/api/refresh-catalog` to re-run the TMDB import script, then reloads JSON.
   * Requires `npm run dev`, `TMDB_API_KEY` or `VITE_TMDB_API_KEY` in `.env`, and can take many minutes.
   */
  readonly VITE_ENABLE_IMPORT_API?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
