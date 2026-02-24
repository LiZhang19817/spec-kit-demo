# Component Contracts: Netflix Movie Dashboard

**Feature**: Netflix Movie Dashboard
**Created**: 2026-02-24
**Purpose**: Define public interfaces (props, events, behaviors) for all React components

## Contract Principles

1. **Prop Stability**: Props should be minimal and stable. Breaking changes require major version bump.
2. **Type Safety**: All props defined with TypeScript interfaces exported from component file.
3. **Composition**: Components should compose via children/render props, not complex prop APIs.
4. **Accessibility**: All interactive components must support keyboard navigation and ARIA labels.
5. **Performance**: Components must use React.memo where appropriate and avoid prop drilling.

---

## Core Components

### MovieCard

**Purpose**: Display a single movie with thumbnail, metadata, and favorite toggle.

**Props Interface**:

```typescript
interface MovieCardProps {
  movie: Movie;                          // Movie data
  isFavorite: boolean;                   // Favorite state
  onFavoriteToggle: (movieId: string) => void; // Favorite click handler
  onClick?: (movieId: string) => void;   // Card click handler (optional)
  variant?: 'compact' | 'expanded';      // Display variant (default: 'expanded')
  showDescription?: boolean;             // Show synopsis on hover (default: true)
}
```

**Events**:

- `onFavoriteToggle(movieId)`: Fired when user clicks favorite button
- `onClick(movieId)`: Fired when user clicks card (opens detail modal)

**Behavior**:

- Hover: Scale up 1.05x, show description overlay
- Click: Call onClick handler with movie ID
- Favorite button: Toggle heart icon (filled/outline)
- Loading: Show skeleton loader while thumbnail loads
- Error: Display placeholder image if thumbnail fails

**Accessibility**:

- Card is `<article>` with `aria-label="{movie.title}"`
- Favorite button is `<button>` with `aria-label="Add {movie.title} to favorites"`
- Keyboard: Tab to card, Enter to open, Space to favorite

**Example Usage**:

```tsx
<MovieCard
  movie={movie}
  isFavorite={favoritesStore.isFavorite(movie.id)}
  onFavoriteToggle={favoritesStore.toggleFavorite}
  onClick={uiStore.openMovieModal}
/>
```

---

### MovieGrid

**Purpose**: Virtualized grid container for displaying movie cards.

**Props Interface**:

```typescript
interface MovieGridProps {
  movies: Movie[];                       // Filtered movie list
  favoriteMovieIds: Set<string>;         // Set of favorited IDs
  onFavoriteToggle: (movieId: string) => void;
  onMovieClick: (movieId: string) => void;
  emptyState?: React.ReactNode;          // Custom empty state (optional)
  isLoading?: boolean;                   // Show skeleton loaders
}
```

**Events**:

- Propagates `onFavoriteToggle` and `onMovieClick` to child MovieCard components

**Behavior**:

- Responsive grid: 1 column (mobile), 2 (tablet), 3-4 (desktop)
- Virtualization: Only render visible cards (react-window)
- Infinite scroll: Load more if paginated (future enhancement)
- Empty state: Show custom emptyState or default "No movies found"
- Loading state: Show 12 skeleton MovieCard placeholders

**Accessibility**:

- Grid container is `<main>` with `aria-label="Movie collection"`
- Movie count announced via `aria-live="polite"` region

**Example Usage**:

```tsx
<MovieGrid
  movies={filteredMovies}
  favoriteMovieIds={favoritesStore.favoriteMovieIds}
  onFavoriteToggle={favoritesStore.toggleFavorite}
  onMovieClick={uiStore.openMovieModal}
  isLoading={movieStore.isLoading}
/>
```

---

### SearchBar

**Purpose**: Fuzzy search input with real-time results and debouncing.

**Props Interface**:

```typescript
interface SearchBarProps {
  value: string;                         // Current search text
  onChange: (value: string) => void;     // Search text change handler
  onClear: () => void;                   // Clear button click handler
  placeholder?: string;                  // Input placeholder (default: "Search movies...")
  debounceMs?: number;                   // Debounce delay (default: 300ms)
  recentSearches?: string[];             // Recent search suggestions (optional)
  isSearching?: boolean;                 // Show loading spinner
}
```

**Events**:

- `onChange(value)`: Fired on every keystroke (debounced)
- `onClear()`: Fired when clear button clicked

**Behavior**:

- Debounced input: onChange called 300ms after last keystroke
- Clear button: Appears when value.length > 0
- Recent searches: Dropdown appears on focus (if provided)
- Loading indicator: Spinner shown when isSearching=true
- Keyboard shortcuts: Cmd/Ctrl+K to focus search

**Accessibility**:

- Input has `type="search"` and `aria-label="Search movies"`
- Clear button has `aria-label="Clear search"`
- Recent searches dropdown has `role="listbox"` with `aria-activedescendant`

**Example Usage**:

```tsx
<SearchBar
  value={searchStore.searchQuery.searchText}
  onChange={searchStore.setSearchText}
  onClear={() => searchStore.setSearchText('')}
  recentSearches={userPreferences.recentSearches}
  isSearching={movieStore.isLoading}
/>
```

---

### FilterPanel

**Purpose**: Container for all filter controls (genre, year, rating).

**Props Interface**:

```typescript
interface FilterPanelProps {
  filters: FilterCriteria;               // Current filter state
  onFilterChange: (filters: Partial<FilterCriteria>) => void;
  onClearFilters: () => void;            // Clear all button handler
  movieCount: number;                    // Number of results for current filters
  totalCount: number;                    // Total movies in collection
}
```

**Events**:

- `onFilterChange(partialFilters)`: Fired when any filter changes
- `onClearFilters()`: Fired when "Clear All" button clicked

**Behavior**:

- Collapsible sections: Genre, Year, Rating (accordion-style)
- Active filter badges: Show selected filters with remove icons
- Result count: Display "Showing X of Y movies"
- Clear all button: Only shown when filters active

**Accessibility**:

- Panel is `<aside>` with `aria-label="Filter movies"`
- Each filter section is `<details>` with `<summary>` for keyboard nav
- Active filter badges are `role="status"` with live region updates

**Example Usage**:

```tsx
<FilterPanel
  filters={searchStore.searchQuery.filters}
  onFilterChange={(partial) => {
    searchStore.setGenreFilter(partial.genres || []);
    searchStore.setYearFilter(partial.yearRange || null);
  }}
  onClearFilters={searchStore.clearFilters}
  movieCount={filteredMovies.length}
  totalCount={allMovies.length}
/>
```

---

### GenreFilter

**Purpose**: Multi-select genre filter with pill-style buttons.

**Props Interface**:

```typescript
interface GenreFilterProps {
  selectedGenres: Genre[];               // Currently selected genres
  availableGenres: Genre[];              // All possible genres
  onChange: (genres: Genre[]) => void;   // Selection change handler
  maxSelections?: number;                // Max simultaneous selections (default: 5)
}
```

**Events**:

- `onChange(genres)`: Fired when genre selected/deselected

**Behavior**:

- Pill buttons: Inactive (outline), Active (filled)
- Click to toggle: Select/deselect genre
- Max limit: Disable unselected genres when maxSelections reached
- Keyboard: Arrow keys navigate, Space/Enter toggle

**Accessibility**:

- Genre group has `role="group"` with `aria-label="Filter by genre"`
- Each genre is `<button>` with `aria-pressed` state

**Example Usage**:

```tsx
<GenreFilter
  selectedGenres={filters.genres}
  availableGenres={allGenres}
  onChange={searchStore.setGenreFilter}
  maxSelections={5}
/>
```

---

### YearFilter

**Purpose**: Dual-handle range slider for year selection.

**Props Interface**:

```typescript
interface YearFilterProps {
  minYear: number;                       // Minimum available year
  maxYear: number;                       // Maximum available year
  value: YearRange | null;               // Current selection
  onChange: (range: YearRange | null) => void;
  step?: number;                         // Slider step (default: 1)
}
```

**Events**:

- `onChange(range)`: Fired when slider values change (debounced)

**Behavior**:

- Dual handles: Drag to set min/max year
- Live labels: Display selected range above handles
- Reset button: Clear range selection (onChange(null))
- Debounced: onChange fired 100ms after drag ends

**Accessibility**:

- Each handle is `<input type="range">` with proper `aria-label`
- Current range announced via `aria-live="polite"`

**Example Usage**:

```tsx
<YearFilter
  minYear={1990}
  maxYear={2025}
  value={filters.yearRange}
  onChange={searchStore.setYearFilter}
/>
```

---

### RatingFilter

**Purpose**: Star-based minimum rating filter.

**Props Interface**:

```typescript
interface RatingFilterProps {
  value: number | null;                  // Selected minimum rating (0-5)
  onChange: (rating: number | null) => void;
  step?: number;                         // Rating increment (default: 0.5)
}
```

**Events**:

- `onChange(rating)`: Fired when star clicked

**Behavior**:

- Star buttons: Click to select minimum rating (1-5 stars)
- Half stars: Support 0.5 increments (1.0, 1.5, 2.0, etc.)
- Clear button: Reset to null (show all ratings)
- Hover preview: Highlight stars on hover

**Accessibility**:

- Star group has `role="radiogroup"` with `aria-label="Minimum rating"`
- Each star is `<button>` with `aria-label="X stars or higher"`

**Example Usage**:

```tsx
<RatingFilter
  value={filters.minRating}
  onChange={searchStore.setRatingFilter}
  step={0.5}
/>
```

---

### EmptyState

**Purpose**: Display helpful message when no movies match filters.

**Props Interface**:

```typescript
interface EmptyStateProps {
  title: string;                         // Primary message (e.g., "No movies found")
  description?: string;                  // Secondary message
  icon?: React.ReactNode;                // Custom icon (optional)
  action?: {
    label: string;                       // Button text (e.g., "Clear filters")
    onClick: () => void;                 // Button handler
  };
}
```

**Events**:

- `action.onClick()`: Fired when action button clicked

**Behavior**:

- Centered layout: Vertical centering in viewport
- Icon: Large icon above title (default: magnifying glass)
- Action button: Optional CTA (e.g., "Clear filters", "Add movies")

**Accessibility**:

- Container has `role="status"` with `aria-live="polite"`
- Announced to screen readers when displayed

**Example Usage**:

```tsx
<EmptyState
  title="No movies found"
  description="Try adjusting your filters or search terms"
  action={{
    label: "Clear all filters",
    onClick: searchStore.clearFilters,
  }}
/>
```

---

### SkeletonLoader

**Purpose**: Placeholder component for loading states.

**Props Interface**:

```typescript
interface SkeletonLoaderProps {
  variant: 'card' | 'text' | 'circle';   // Skeleton shape
  count?: number;                        // Number of skeletons (default: 1)
  width?: string | number;               // Custom width
  height?: string | number;              // Custom height
}
```

**Behavior**:

- Shimmer animation: Subtle left-to-right gradient animation
- Accessible: No aria announcement (decorative only)
- Variants:
  - `card`: Movie card aspect ratio (2:3)
  - `text`: Single line text placeholder
  - `circle`: Circular avatar/icon placeholder

**Example Usage**:

```tsx
<SkeletonLoader variant="card" count={12} />
```

---

### FavoriteButton

**Purpose**: Heart icon toggle for favoriting movies.

**Props Interface**:

```typescript
interface FavoriteButtonProps {
  isFavorite: boolean;                   // Favorite state
  onToggle: () => void;                  // Click handler
  size?: 'sm' | 'md' | 'lg';             // Icon size (default: 'md')
  ariaLabel?: string;                    // Custom ARIA label
}
```

**Events**:

- `onToggle()`: Fired when button clicked

**Behavior**:

- Icon: Outline heart (not favorite), Filled heart (favorite)
- Animation: Scale up 1.2x on click with spring animation
- Optimistic update: Update UI immediately, persist to localStorage async

**Accessibility**:

- Button has `aria-label="{ariaLabel}"` or default
- `aria-pressed` state reflects isFavorite

**Example Usage**:

```tsx
<FavoriteButton
  isFavorite={isFavorite}
  onToggle={() => favoritesStore.toggleFavorite(movieId)}
  ariaLabel={`Add ${movie.title} to favorites`}
/>
```

---

## Layout Components

### Header

**Purpose**: App header with logo, search, and theme toggle.

**Props Interface**:

```typescript
interface HeaderProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  theme: Theme;
  onThemeToggle: () => void;
}
```

---

### Layout

**Purpose**: Main layout wrapper with header, content area, and footer.

**Props Interface**:

```typescript
interface LayoutProps {
  children: React.ReactNode;
  header?: React.ReactNode;              // Custom header (optional)
  footer?: React.ReactNode;              // Custom footer (optional)
}
```

---

## Modal Components

### MovieDetailModal

**Purpose**: Full-screen modal displaying movie details.

**Props Interface**:

```typescript
interface MovieDetailModalProps {
  movie: Movie | null;                   // Movie to display (null = closed)
  isFavorite: boolean;
  onFavoriteToggle: (movieId: string) => void;
  onClose: () => void;                   // Close button/ESC handler
}
```

**Events**:

- `onClose()`: Fired when close button clicked or ESC pressed

**Behavior**:

- Backdrop: Semi-transparent black overlay
- Close on backdrop click: Yes
- Close on ESC: Yes
- Scroll lock: Prevent body scroll when open
- Animation: Fade in (200ms), Slide up (300ms)

**Accessibility**:

- Modal has `role="dialog"` with `aria-modal="true"`
- Focus trap: Tab cycles through modal elements only
- Close button has `aria-label="Close"`
- Focus management: Return focus to trigger element on close

---

## Higher-Order Components

### WithSearchHighlight

**Purpose**: HOC to wrap text components with search term highlighting.

**Props Interface**:

```typescript
interface WithSearchHighlightProps {
  text: string;                          // Full text to display
  searchText: string;                    // Term to highlight
  highlightClassName?: string;           // Custom highlight CSS class
}
```

**Behavior**:

- Case-insensitive matching
- Preserves original text casing
- Supports multiple matches in single string
- Applies `<mark>` tags with custom class

**Example Usage**:

```tsx
<WithSearchHighlight
  text={movie.title}
  searchText={searchStore.searchQuery.searchText}
  highlightClassName="bg-yellow-200 dark:bg-yellow-800"
/>
```

---

## Component Testing Contracts

All components MUST support the following test scenarios:

1. **Snapshot Testing**: Component renders correctly with default props
2. **Prop Validation**: TypeScript types enforce correct prop usage
3. **Event Handling**: All event handlers called with correct arguments
4. **Accessibility**: ARIA roles, labels, and keyboard navigation work
5. **Error Boundaries**: Components gracefully handle missing/invalid data

**Example Test Suite**:

```typescript
describe('MovieCard', () => {
  it('renders movie data correctly', () => {
    // Snapshot test
  });

  it('calls onFavoriteToggle when favorite button clicked', () => {
    // Event handling test
  });

  it('has correct ARIA labels', () => {
    // Accessibility test
  });

  it('handles missing thumbnail gracefully', () => {
    // Error boundary test
  });
});
```

---

## Performance Contracts

### Rendering Budget

- **MovieCard**: < 16ms render time (60fps)
- **MovieGrid**: < 100ms initial render for 1000 items (virtualized)
- **SearchBar**: < 50ms onChange handler (debounced)
- **FilterPanel**: < 50ms filter update

### Bundle Size Budget

- **MovieCard**: < 5KB (gzipped)
- **SearchBar**: < 3KB (gzipped)
- **All components combined**: < 50KB (gzipped)

### Memoization Requirements

- **MovieCard**: Wrapped in React.memo with custom comparison
- **MovieGrid**: useMemo for filtered movie list
- **FilterPanel**: useCallback for all event handlers

---

## References

- [React Component Patterns](https://www.patterns.dev/react)
- [Accessible Components](https://inclusive-components.design/)
- [TypeScript React Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)
