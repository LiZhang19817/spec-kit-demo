# Quickstart Guide: Netflix Movie Dashboard

**Feature**: Netflix Movie Dashboard
**Created**: 2026-02-24
**Purpose**: Get developers up and running quickly with the Netflix Movie Dashboard project

---

## Prerequisites

Before starting, ensure you have:

- **Node.js** 20.x or higher ([Download](https://nodejs.org/))
- **pnpm** 8.x or higher (`npm install -g pnpm`)
- **Git** 2.x or higher
- **Modern browser** (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- **Code editor** with TypeScript support (VS Code recommended)

**Check versions**:

```bash
node --version   # Should be v20.x or higher
pnpm --version   # Should be 8.x or higher
git --version    # Should be 2.x or higher
```

---

## Quick Start (5 minutes)

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd dashboard-demo

# Checkout the feature branch
git checkout 001-netflix-movie-dashboard

# Install dependencies (pnpm is faster than npm)
pnpm install
```

**Expected output**:
```
Progress: resolved 142, reused 142, downloaded 0, added 142, done
Done in 12.3s
```

---

### 2. Start Development Server

```bash
# Start Vite dev server with hot module replacement
pnpm dev
```

**Expected output**:
```
  VITE v5.0.12  ready in 423 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: http://192.168.1.100:5173/
  ➜  press h to show help
```

---

### 3. Open in Browser

Navigate to [http://localhost:5173](http://localhost:5173)

You should see the Netflix Movie Dashboard with:
- ✅ Header with search bar
- ✅ Movie grid displaying sample movies
- ✅ Smooth animations on scroll and hover
- ✅ Apple-style design with clean typography

---

## Project Structure

```
dashboard-demo/
├── src/
│   ├── components/          # React components
│   │   ├── movie/           # Movie-related components
│   │   │   ├── MovieCard.tsx
│   │   │   └── MovieGrid.tsx
│   │   ├── search/          # Search components
│   │   │   └── SearchBar.tsx
│   │   └── filters/         # Filter components
│   │       └── FilterPanel.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useMovieSearch.ts
│   │   └── useFavorites.ts
│   ├── store/               # Zustand state stores
│   │   ├── movieStore.ts
│   │   ├── searchStore.ts
│   │   └── uiStore.ts
│   ├── lib/                 # Utilities and helpers
│   │   ├── fuzzySearch.ts
│   │   └── animations.ts
│   ├── types/               # TypeScript types
│   │   └── movie.ts
│   ├── data/                # Static data
│   │   └── movies.json      # Sample movie collection
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
├── tests/                   # Test files
│   ├── unit/
│   ├── integration/
│   └── components/
├── public/                  # Static assets
│   └── movies/              # Movie thumbnails
├── specs/                   # Feature specifications
│   └── 001-netflix-movie-dashboard/
│       ├── spec.md
│       ├── plan.md
│       └── data-model.md
├── package.json             # Dependencies and scripts
├── vite.config.ts           # Vite configuration
├── tsconfig.json            # TypeScript configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── README.md                # Project documentation
```

---

## Available Scripts

All scripts are defined in `package.json`:

```bash
# Development
pnpm dev                     # Start dev server (HMR enabled)
pnpm dev:host                # Start dev server with network access

# Build
pnpm build                   # Build for production (outputs to dist/)
pnpm preview                 # Preview production build locally

# Testing
pnpm test                    # Run all tests (Jest + React Testing Library)
pnpm test:watch              # Run tests in watch mode
pnpm test:coverage           # Generate coverage report
pnpm test:ui                 # Open Vitest UI (if configured)

# Code Quality
pnpm lint                    # Run ESLint
pnpm lint:fix                # Fix auto-fixable ESLint errors
pnpm format                  # Format code with Prettier
pnpm format:check            # Check formatting without changes
pnpm typecheck               # Run TypeScript compiler check

# CI/CD
pnpm ci                      # Run full CI check (lint + typecheck + test + build)
```

---

## Development Workflow

### 1. Create a New Component

```bash
# Create component file
touch src/components/movie/MovieCard.tsx

# Create test file (colocated)
touch src/components/movie/MovieCard.test.tsx
```

**Component Template**:

```tsx
// src/components/movie/MovieCard.tsx
import { type Movie } from '@/types/movie';

interface MovieCardProps {
  movie: Movie;
  isFavorite: boolean;
  onFavoriteToggle: (movieId: string) => void;
}

export function MovieCard({
  movie,
  isFavorite,
  onFavoriteToggle,
}: MovieCardProps) {
  return (
    <article className="movie-card">
      <img src={movie.thumbnailUrl} alt={movie.title} />
      <h2>{movie.title}</h2>
      <button onClick={() => onFavoriteToggle(movie.id)}>
        {isFavorite ? '❤️' : '🤍'}
      </button>
    </article>
  );
}
```

---

### 2. Add a Custom Hook

```bash
touch src/hooks/useMovieSearch.ts
```

**Hook Template**:

```typescript
// src/hooks/useMovieSearch.ts
import { useState, useEffect } from 'react';
import { searchMovies } from '@/lib/fuzzySearch';
import { useMovieStore } from '@/store/movieStore';

export function useMovieSearch(query: string) {
  const movies = useMovieStore((state) => state.movies);
  const [results, setResults] = useState<Movie[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults(movies);
      return;
    }

    const filtered = searchMovies(movies, query);
    setResults(filtered);
  }, [query, movies]);

  return results;
}
```

---

### 3. Run Tests (TDD Workflow)

```bash
# Write failing test first
pnpm test:watch

# Implement component/hook
# Watch tests pass
# Refactor if needed
```

**Test Template**:

```tsx
// src/components/movie/MovieCard.test.tsx
import { render, screen } from '@testing-library/react';
import { MovieCard } from './MovieCard';

describe('MovieCard', () => {
  const mockMovie = {
    id: '1',
    title: 'Inception',
    genres: ['Sci-Fi'],
    releaseYear: 2010,
    rating: 4.5,
    thumbnailUrl: 'https://example.com/poster.jpg',
    description: 'A thief who steals secrets...',
  };

  it('renders movie title', () => {
    render(
      <MovieCard
        movie={mockMovie}
        isFavorite={false}
        onFavoriteToggle={() => {}}
      />
    );

    expect(screen.getByText('Inception')).toBeInTheDocument();
  });
});
```

---

### 4. Commit Your Changes

```bash
# Stage files
git add src/components/movie/MovieCard.tsx

# Commit with conventional commit message
git commit -m "feat(movie): add MovieCard component with favorite toggle"

# Husky pre-commit hooks will run:
# ✓ ESLint (no errors/warnings)
# ✓ Prettier (format check)
# ✓ TypeScript (type check)
```

---

## Configuration Files

### TypeScript (tsconfig.json)

```json
{
  "compilerOptions": {
    "strict": true,                    // ✅ Strict mode enforced
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]               // Path alias for imports
    }
  }
}
```

**Usage**:
```typescript
import { Movie } from '@/types/movie';  // Instead of '../../types/movie'
```

---

### Tailwind CSS (tailwind.config.js)

```javascript
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',                   // Enable dark mode
  theme: {
    extend: {
      colors: {
        // Apple-style color palette
        'apple-bg': '#FFFFFF',
        'apple-text': '#000000',
        // ... more colors
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
};
```

---

### ESLint (.eslintrc.json)

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended"
  ],
  "rules": {
    "max-lines": ["error", { "max": 250 }],  // 250-line limit
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
```

---

## Environment Variables

Create `.env.local` for local overrides:

```bash
# Copy template
cp .env.example .env.local

# Edit with your values
VITE_MOVIE_DATA_URL=/data/movies.json
VITE_ENABLE_ANALYTICS=false
```

**Access in code**:
```typescript
const movieDataUrl = import.meta.env.VITE_MOVIE_DATA_URL;
```

---

## Troubleshooting

### Port Already in Use

If port 5173 is occupied:

```bash
# Option 1: Kill process on port 5173
lsof -ti:5173 | xargs kill

# Option 2: Use different port
pnpm dev --port 3000
```

---

### Module Not Found Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

---

### TypeScript Errors After Merge

```bash
# Regenerate TypeScript cache
pnpm typecheck --clean
```

---

### Slow Build Times

```bash
# Clear Vite cache
rm -rf node_modules/.vite
pnpm dev
```

---

## Debugging

### VS Code Launch Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}/src"
    }
  ]
}
```

### React DevTools

Install browser extension:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Zustand DevTools

```typescript
import { devtools } from 'zustand/middleware';

const useMovieStore = create(
  devtools((set, get) => ({
    // Store definition
  }))
);
```

Open Redux DevTools extension to inspect Zustand state.

---

## Performance Monitoring

### Lighthouse CI

Run Lighthouse audit locally:

```bash
# Build production bundle
pnpm build

# Serve production build
pnpm preview

# Run Lighthouse (in new terminal)
npx lighthouse http://localhost:4173 --view
```

**Performance Budgets**:
- Initial load: ≤2s
- Time to Interactive: ≤3.5s
- Bundle size: ≤500KB JS (gzipped)

---

### Bundle Size Analysis

```bash
# Generate bundle visualization
pnpm build --analyze

# Opens report.html in browser
```

---

## Next Steps

After completing the quickstart:

1. **Read the spec**: `specs/001-netflix-movie-dashboard/spec.md`
2. **Review data model**: `specs/001-netflix-movie-dashboard/data-model.md`
3. **Check component contracts**: `specs/001-netflix-movie-dashboard/contracts/components.md`
4. **Run the test suite**: `pnpm test`
5. **Start implementing**: See `specs/001-netflix-movie-dashboard/tasks.md` (generated by `/speckit.tasks`)

---

## Getting Help

- **Internal Docs**: `specs/001-netflix-movie-dashboard/`
- **Constitution**: `.specify/memory/constitution.md`
- **GitHub Issues**: Report bugs or request features
- **Team Chat**: Ask questions in #netflix-dashboard channel

---

## Common Tasks

### Add a New Movie to Sample Data

Edit `src/data/movies.json`:

```json
{
  "id": "new-movie-2025",
  "title": "New Movie",
  "genres": ["Action", "Thriller"],
  "releaseYear": 2025,
  "rating": 4.0,
  "thumbnailUrl": "https://example.com/poster.jpg",
  "description": "An exciting new film..."
}
```

Refresh browser to see changes (HMR enabled).

---

### Change Theme Colors

Edit `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#0071E3',      // Apple blue
      'primary-dark': '#0A84FF',
    },
  },
},
```

---

### Add a New Filter Type

1. Update `FilterCriteria` in `src/types/filters.ts`
2. Add filter UI in `src/components/filters/`
3. Update `SearchStore` actions in `src/store/searchStore.ts`
4. Update filter logic in `src/hooks/useMovieFilter.ts`
5. Write tests for new filter behavior

---

## Production Deployment

### Build

```bash
pnpm build
```

**Output**: `dist/` directory with optimized static files

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

---

## References

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Zustand](https://docs.pmnd.rs/zustand)
- [React Testing Library](https://testing-library.com/react)
