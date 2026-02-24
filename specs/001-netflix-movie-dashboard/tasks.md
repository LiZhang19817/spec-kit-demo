---

description: "Task list for Netflix Movie Dashboard feature implementation"
---

# Tasks: Netflix Movie Dashboard

**Input**: Design documents from `/specs/001-netflix-movie-dashboard/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/, research.md, quickstart.md

**Tests**: YES - Testing-First Development (TDD) required per constitution. All test tasks are mandatory and must be completed BEFORE implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths assume single-project React SPA architecture

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize Vite React TypeScript project with strict mode in repository root
- [X] T002 [P] Install core dependencies: React 18.2+, TypeScript 5.3+, Vite 5.0+
- [X] T003 [P] Install UI dependencies: Tailwind CSS 3.4+, Framer Motion 11.0+, GSAP 3.12+
- [X] T004 [P] Install state/data dependencies: Zustand 4.5+, Fuse.js 7.0+, react-window 1.8+
- [X] T005 [P] Install dev dependencies: Jest 29+, React Testing Library 14+, MSW 2.0+, ESLint, Prettier
- [X] T006 Configure TypeScript strict mode in tsconfig.json with path aliases (@/)
- [X] T007 [P] Configure Tailwind CSS with Apple design system theme in tailwind.config.js
- [X] T008 [P] Configure PostCSS in postcss.config.js
- [X] T009 [P] Configure ESLint with TypeScript rules, max-lines: 250 in .eslintrc.json
- [X] T010 [P] Configure Prettier with consistent formatting in .prettierrc
- [X] T011 [P] Configure Vite with build optimizations in vite.config.ts
- [X] T012 [P] Configure Jest with React Testing Library in jest.config.js
- [X] T013 [P] Setup Husky pre-commit hooks for linting and formatting
- [X] T014 Create project directory structure: src/{components,hooks,store,lib,types,data,styles}
- [X] T015 [P] Create test directory structure: tests/{unit,integration,components,fixtures}
- [X] T016 [P] Create global styles with Apple design tokens in src/styles/globals.css
- [X] T017 [P] Create animation keyframes in src/styles/animations.css
- [X] T018 [P] Create sample movies fixture in tests/fixtures/movies.json (50 movies)
- [X] T019 [P] Create static movies data file in public/data/movies.json
- [X] T020 Create README.md with setup instructions and development workflow

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T021 [P] Define Movie type interface in src/types/movie.ts
- [X] T022 [P] Define Genre type in src/types/movie.ts
- [X] T023 [P] Define FilterCriteria type interface in src/types/filters.ts
- [X] T024 [P] Define SearchQuery type interface in src/types/filters.ts
- [X] T025 [P] Define UserPreferences type interface in src/types/filters.ts
- [X] T026 [P] Create type index exports in src/types/index.ts
- [X] T027 [P] Implement localStorage utility functions in src/lib/localStorage.ts
- [X] T028 [P] Implement data validators in src/lib/validators.ts
- [X] T029 [P] Configure Fuse.js search options in src/lib/fuzzySearch.ts
- [X] T030 [P] Create GSAP animation helpers in src/lib/animations.ts
- [X] T031 Implement MovieStore with loadMovies action in src/store/movieStore.ts
- [X] T032 [P] Implement SearchStore with filter/search actions in src/store/searchStore.ts
- [X] T033 [P] Implement UIStore with theme and modal state in src/store/uiStore.ts
- [X] T034 [P] Implement FavoritesStore with localStorage persistence in src/store/favoritesStore.ts
- [X] T035 [P] Create test setup configuration in tests/setup.ts
- [X] T036 [P] Create MSW handlers for localStorage mocking in tests/mocks/handlers.ts
- [X] T037 Create root App component with store providers in src/App.tsx
- [X] T038 Create application entry point in src/main.tsx
- [X] T039 Create index.html with meta tags and favicon

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Browse Movie Collection (Priority: P1) 🎯 MVP

**Goal**: Display all movies in a visually appealing, responsive grid with Apple-style design

**Independent Test**: Load dashboard → Verify all movies displayed with thumbnails, titles, metadata → Scroll smoothly → Empty state works → Responsive on mobile

### Tests for User Story 1 (TDD - WRITE FIRST) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T040 [P] [US1] Unit test for movie data validation in tests/unit/validators.test.ts
- [X] T041 [P] [US1] Unit test for MovieStore loadMovies action in tests/unit/movieStore.test.ts
- [X] T042 [P] [US1] Component test for SkeletonLoader variants in tests/components/SkeletonLoader.test.tsx
- [X] T043 [P] [US1] Component test for EmptyState with actions in tests/components/EmptyState.test.tsx
- [X] T044 [P] [US1] Component test for MovieCard display and events in tests/components/MovieCard.test.tsx
- [X] T045 [P] [US1] Component test for MovieGrid virtualization in tests/components/MovieGrid.test.tsx
- [X] T046 [US1] Integration test for browse flow (load → display → scroll) in tests/integration/browseFlow.test.tsx

### Implementation for User Story 1

- [X] T047 [P] [US1] Create Button component with Apple styles in src/components/common/Button.tsx
- [X] T048 [P] [US1] Create SkeletonLoader component with variants in src/components/common/SkeletonLoader.tsx
- [X] T049 [P] [US1] Create EmptyState component with icon and action in src/components/common/EmptyState.tsx
- [X] T050 [US1] Create MovieCard component with hover effects and accessibility in src/components/movie/MovieCard.tsx
- [X] T051 [US1] Create MovieGrid component with react-window virtualization in src/components/movie/MovieGrid.tsx
- [X] T052 [US1] Create useDebounce hook in src/hooks/useDebounce.ts
- [X] T053 [US1] Create Header component with logo and theme toggle in src/components/layout/Header.tsx
- [X] T054 [US1] Create Layout component with header/footer in src/components/layout/Layout.tsx
- [X] T055 [US1] Update App.tsx to load movies and render MovieGrid
- [X] T056 [US1] Add responsive grid styling with Tailwind breakpoints
- [X] T057 [US1] Add GSAP scroll animations for movie cards
- [X] T058 [US1] Add Framer Motion hover animations for MovieCard
- [X] T059 [US1] Test empty state when no movies loaded
- [X] T060 [US1] Test responsive layout on mobile/tablet/desktop
- [X] T061 [US1] Verify 60fps scrolling performance with 500+ movies
- [X] T062 [US1] Run Lighthouse audit and verify ≤2s load time, 90+ performance score

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Search for Movies (Priority: P2)

**Goal**: Real-time fuzzy search with <300ms response, typo tolerance, and result highlighting

**Independent Test**: Type search query → Results appear within 300ms → Fuzzy matching handles typos → Clear search works → Highlights match terms

### Tests for User Story 2 (TDD - WRITE FIRST) ⚠️

- [X] T063 [P] [US2] Unit test for Fuse.js search configuration in tests/unit/fuzzySearch.test.ts
- [X] T064 [P] [US2] Unit test for useMovieSearch hook with debouncing in tests/unit/useMovieSearch.test.ts
- [X] T065 [P] [US2] Unit test for SearchStore executeSearch action in tests/unit/searchStore.test.ts
- [X] T066 [P] [US2] Component test for SearchBar with debounce and clear in tests/components/SearchBar.test.tsx
- [X] T067 [P] [US2] Component test for SearchHighlight text matching in tests/components/SearchHighlight.test.tsx
- [X] T068 [US2] Integration test for search flow (type → debounce → results → highlight) in tests/integration/searchFlow.test.tsx
- [X] T069 [US2] Performance test for search <300ms with 1000 movies in tests/integration/searchPerformance.test.tsx

### Implementation for User Story 2

- [X] T070 [US2] Implement fuzzy search function with Fuse.js in src/lib/fuzzySearch.ts
- [X] T071 [US2] Create useMovieSearch custom hook with debouncing in src/hooks/useMovieSearch.ts
- [X] T072 [US2] Update SearchStore with searchText state and executeSearch in src/store/searchStore.ts
- [X] T073 [US2] Create SearchHighlight component for term highlighting in src/components/search/SearchHighlight.tsx
- [X] T074 [US2] Create SearchBar component with debounced input in src/components/search/SearchBar.tsx
- [X] T075 [US2] Update Header to include SearchBar
- [X] T076 [US2] Update MovieCard to use SearchHighlight for titles
- [X] T077 [US2] Connect SearchBar to SearchStore and MovieStore
- [X] T078 [US2] Add recent searches dropdown to SearchBar
- [X] T079 [US2] Test fuzzy matching with typos (e.g., "Incepton" → "Inception")
- [X] T080 [US2] Test search performance <300ms with 1000 movies
- [X] T081 [US2] Test empty state when search yields no results
- [X] T082 [US2] Verify clear button resets search and shows full collection

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Filter Movies by Criteria (Priority: P3)

**Goal**: Combinable filters (genre, year, rating) with instant feedback and clear all option

**Independent Test**: Apply genre filter → See filtered results → Add year range → Results narrow → Clear all → Full collection returns

### Tests for User Story 3 (TDD - WRITE FIRST) ⚠️

- [X] T083 [P] [US3] Unit test for useMovieFilter hook with combined filters in tests/unit/useMovieFilter.test.ts
- [X] T084 [P] [US3] Component test for GenreFilter pill selection in tests/components/GenreFilter.test.tsx
- [X] T085 [P] [US3] Component test for YearFilter dual-handle slider in tests/components/YearFilter.test.tsx
- [X] T086 [P] [US3] Component test for RatingFilter star selection in tests/components/RatingFilter.test.tsx
- [X] T087 [P] [US3] Component test for FilterPanel with clear all in tests/components/FilterPanel.test.tsx
- [X] T088 [US3] Integration test for filter flow (genre + year + rating) in tests/integration/filterFlow.test.tsx
- [X] T089 [US3] Integration test for search + filter combination in tests/integration/searchFilterCombo.test.tsx

### Implementation for User Story 3

- [X] T090 [P] [US3] Create useMovieFilter hook for filter logic in src/hooks/useMovieFilter.ts
- [X] T091 [P] [US3] Create GenreFilter component with pill buttons in src/components/filters/GenreFilter.tsx
- [X] T092 [P] [US3] Create YearFilter component with range slider in src/components/filters/YearFilter.tsx
- [X] T093 [P] [US3] Create RatingFilter component with star buttons in src/components/filters/RatingFilter.tsx
- [X] T094 [US3] Create FilterPanel container component in src/components/filters/FilterPanel.tsx
- [X] T095 [US3] Update SearchStore with genre/year/rating filter actions
- [X] T096 [US3] Update SearchStore executeSearch to combine search + filters
- [X] T097 [US3] Add FilterPanel to Layout sidebar or header
- [X] T098 [US3] Add active filter badges with remove icons
- [X] T099 [US3] Add "Clear All Filters" button
- [X] T100 [US3] Test filter combination (genre + year + rating simultaneously)
- [X] T101 [US3] Test empty state when filters match no movies
- [X] T102 [US3] Verify filters work with search (combined functionality)
- [X] T103 [US3] Test filter state persists during session (not across refreshes)

**Checkpoint**: All user stories 1, 2, and 3 should now be independently functional

---

## Phase 6: User Story 4 - Save Favorite Movies (Priority: P4)

**Goal**: Toggle favorites, persist to localStorage, filter favorites view, integrate with search/filters

**Independent Test**: Click favorite icon → Movie marked → Refresh page → Favorite persists → View favorites filter → Search/filter within favorites

### Tests for User Story 4 (TDD - WRITE FIRST) ⚠️

- [X] T104 [P] [US4] Unit test for useFavorites hook with localStorage in tests/unit/useFavorites.test.ts
- [X] T105 [P] [US4] Unit test for FavoritesStore persistence in tests/unit/favoritesStore.test.ts
- [X] T106 [P] [US4] Unit test for localStorage utility functions in tests/unit/localStorage.test.ts
- [X] T107 [P] [US4] Component test for FavoriteButton toggle in tests/components/FavoriteButton.test.tsx
- [X] T108 [P] [US4] Integration test for favorites flow (mark → persist → reload → verify) in tests/integration/favoritesFlow.test.tsx
- [X] T109 [US4] Integration test for favorites + search + filters in tests/integration/favoritesWithFilters.test.tsx

### Implementation for User Story 4

- [X] T110 [P] [US4] Create useLocalStorage generic hook in src/hooks/useLocalStorage.ts
- [X] T111 [P] [US4] Create useFavorites hook with persistence in src/hooks/useFavorites.ts
- [X] T112 [US4] Update FavoritesStore with loadFromStorage and saveToStorage
- [X] T113 [US4] Create FavoriteButton component with heart icon in src/components/common/FavoriteButton.tsx
- [X] T114 [US4] Add FavoriteButton to MovieCard component
- [X] T115 [US4] Add "View Favorites" toggle to FilterPanel
- [X] T116 [US4] Update SearchStore to filter by favoritesOnly flag
- [X] T117 [US4] Update FavoritesStore to auto-save on toggle
- [X] T118 [US4] Add Framer Motion animation to FavoriteButton (scale on click)
- [X] T119 [US4] Test favorite toggle (add and remove)
- [X] T120 [US4] Test localStorage persistence across browser refresh
- [X] T121 [US4] Test favorites view filter shows only favorited movies
- [X] T122 [US4] Test search and filters work within favorites subset
- [X] T123 [US4] Test error handling when localStorage is full or disabled

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final production readiness

- [X] T124 [P] Add dark mode support with theme toggle in Header
- [ ] T125 [P] Create MovieDetailModal component for expanded movie view in src/components/movie/MovieDetailModal.tsx
- [X] T126 [P] Add keyboard shortcuts (Cmd/Ctrl+K for search focus, Esc to close modal)
- [X] T127 [P] Optimize image loading with lazy loading and blur-up technique
- [X] T128 [P] Add error boundary component for graceful error handling in src/components/common/ErrorBoundary.tsx
- [X] T129 [P] Add loading states with skeleton loaders for all async operations
- [ ] T130 [P] Implement responsive images with srcset for different screen sizes
- [X] T131 [P] Add meta tags for SEO and social sharing in index.html
- [X] T132 [P] Add favicon and app icons in public/
- [ ] T133 Add analytics tracking (optional, privacy-respecting)
- [ ] T134 Run full E2E test suite covering all user stories
- [ ] T135 Run accessibility audit with axe-core and fix violations
- [ ] T136 Run Lighthouse CI and verify all metrics pass (Performance ≥90, Accessibility ≥90)
- [ ] T137 Test on mobile devices (iOS Safari, Android Chrome)
- [ ] T138 Test on desktop browsers (Chrome, Firefox, Safari, Edge)
- [X] T139 Verify bundle size ≤500KB main chunk (gzipped)
- [ ] T140 Run performance profiling and optimize render bottlenecks
- [X] T141 [P] Update README.md with final documentation and screenshots
- [ ] T142 [P] Create CHANGELOG.md with version history
- [ ] T143 [P] Update package.json with correct version and metadata
- [X] T144 Generate production build and verify no errors
- [ ] T145 Deploy to preview environment and smoke test
- [X] T146 Run final code quality check (ESLint, Prettier, TypeScript)
- [X] T147 Verify all constitution requirements met (code quality, testing, UX, performance)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Independent of US1 but builds on same components
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Independent but integrates with US2 (search + filter)
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Independent but adds to US1 components

### Within Each User Story

**CRITICAL: TDD workflow**
1. Tests MUST be written and FAIL first
2. Implement to make tests pass
3. Refactor while keeping tests green

- Models/Types before hooks and stores
- Stores before components
- Common components before complex components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T020)
- All Foundational tasks marked [P] can run in parallel within Phase 2 (T021-T036)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Within each story, tests marked [P] can run in parallel
- Within each story, independent components marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (TDD - write first):
T040: "Unit test for movie data validation in tests/unit/validators.test.ts"
T041: "Unit test for MovieStore loadMovies action in tests/unit/movieStore.test.ts"
T042: "Component test for SkeletonLoader variants in tests/components/SkeletonLoader.test.tsx"
T043: "Component test for EmptyState with actions in tests/components/EmptyState.test.tsx"
T044: "Component test for MovieCard display and events in tests/components/MovieCard.test.tsx"
T045: "Component test for MovieGrid virtualization in tests/components/MovieGrid.test.tsx"

# After tests fail, launch all common components together:
T047: "Create Button component with Apple styles in src/components/common/Button.tsx"
T048: "Create SkeletonLoader component with variants in src/components/common/SkeletonLoader.tsx"
T049: "Create EmptyState component with icon and action in src/components/common/EmptyState.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T020)
2. Complete Phase 2: Foundational (T021-T039) - CRITICAL
3. Complete Phase 3: User Story 1 (T040-T062) - TDD workflow
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

**Deliverable**: Working movie dashboard with browse functionality, loading states, empty states, responsive design

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Browse) → Test independently → Deploy/Demo (MVP! 🎯)
3. Add User Story 2 (Search) → Test independently → Deploy/Demo
4. Add User Story 3 (Filter) → Test independently → Deploy/Demo
5. Add User Story 4 (Favorites) → Test independently → Deploy/Demo
6. Add Polish → Final release
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T039)
2. Once Foundational is done:
   - Developer A: User Story 1 (Browse) - T040-T062
   - Developer B: User Story 2 (Search) - T063-T082
   - Developer C: User Story 3 (Filter) - T083-T103
   - Developer D: User Story 4 (Favorites) - T104-T123
3. Stories complete and integrate independently
4. Team collaborates on Polish (T124-T147)

---

## Notes

- **[P] tasks** = different files, no dependencies, safe to parallelize
- **[Story] label** maps task to specific user story for traceability
- **TDD workflow** mandatory per constitution: Tests first, then implementation
- Each user story should be independently completable and testable
- Verify tests fail before implementing (Red-Green-Refactor)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Coverage gates enforced: 80% utilities, 60% components, 50% integration
- Performance budgets enforced: ≤2s load, ≤300ms search, ≤500KB bundle, 60fps scrolling
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Testing Checklist per User Story

Each user story MUST have:
- ✅ Unit tests for utilities and hooks
- ✅ Component tests for all UI components
- ✅ Integration test for complete user journey
- ✅ Tests written BEFORE implementation (TDD)
- ✅ Tests verify acceptance criteria from spec.md
- ✅ Coverage meets constitution targets

---

## Performance Validation Checklist

Before marking any story complete:
- ✅ Lighthouse performance score ≥90
- ✅ Bundle size within limits (≤500KB main chunk)
- ✅ 60fps scrolling with 500+ movies
- ✅ Search response ≤300ms
- ✅ Initial load ≤2s on 3G
- ✅ No console errors or warnings
- ✅ Accessibility score ≥90 (axe-core)

---

## Ready for Implementation! 🚀

**Total Tasks**: 147
**User Story 1 (Browse)**: 23 tasks (T040-T062)
**User Story 2 (Search)**: 20 tasks (T063-T082)
**User Story 3 (Filter)**: 21 tasks (T083-T103)
**User Story 4 (Favorites)**: 20 tasks (T104-T123)
**Parallel Opportunities**: 60+ tasks can run in parallel with proper team coordination

**Suggested Next Command**: `/speckit.implement` to start TDD execution
