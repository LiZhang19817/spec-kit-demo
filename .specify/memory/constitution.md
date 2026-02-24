<!--
  SYNC IMPACT REPORT
  ==================
  Version Change: 1.0.0 → 1.1.0
  Change Type: MINOR (Principle reorganization and expansion)

  Principles Modified:
  - I. User Experience First → I. Code Quality Excellence (NEW focus area)
  - II. Performance & Responsiveness → II. Testing-First Development (NEW focus area)
  - III. Search Excellence → III. User Experience Consistency (reorganized & expanded)
  - IV. Component-Based Architecture → IV. Performance Requirements (reorganized & expanded)
  - V. Accessibility & Inclusion → (integrated into III. User Experience Consistency)

  Sections Modified:
  - Core Principles: Reorganized to align with 4 key focus areas
  - Technology Standards: Expanded code quality tooling
  - Quality Standards: Elevated testing standards to Core Principles
  - Governance: No changes

  Template Alignment:
  ✅ .specify/templates/plan-template.md - Constitution Check updated for new principles
  ✅ .specify/templates/spec-template.md - Quality requirements strengthened
  ✅ .specify/templates/tasks-template.md - Testing-first workflow emphasized

  Rationale for Changes:
  - User explicitly requested focus on: code quality, testing standards, UX consistency, performance
  - Previous principles were feature-specific (Search Excellence) vs. quality-focused
  - New structure prioritizes engineering discipline over feature-specific rules
  - Testing elevated from "Quality Standards" subsection to Core Principle
  - Accessibility integrated into broader UX Consistency principle

  Deferred Items: None

  Next Steps:
  - All new features must comply with updated principles
  - Existing code should be gradually refactored to meet new standards
  - CI/CD pipelines should enforce code quality and testing gates
-->

# Netflix Movie Dashboard Constitution

## Core Principles

### I. Code Quality Excellence

All code MUST meet high standards of readability, maintainability, and type safety.

**Non-Negotiable Rules**:
- **Type Safety**: Strict TypeScript mode MUST be enabled (`strict: true`). All functions, components, and modules MUST have explicit type annotations.
- **Single Responsibility**: Each function/component MUST do one thing well. Files MUST not exceed 250 lines (refactor into modules if larger).
- **No Code Smells**: Zero ESLint errors tolerated. Warnings MUST be addressed or explicitly suppressed with justification.
- **Naming Conventions**: Variables/functions use camelCase, components use PascalCase, constants use UPPER_SNAKE_CASE, files match component names.
- **DRY Principle**: Logic duplicated more than twice MUST be extracted into shared utilities or hooks.
- **Documentation**: Public APIs, complex algorithms, and non-obvious logic MUST include JSDoc comments.
- **Dependency Management**: Dependencies MUST be locked with exact versions. Updates MUST pass all tests before merge.

**Automated Enforcement**:
- ESLint with `@typescript-eslint/recommended` and `plugin:react-hooks/recommended`
- Prettier with consistent configuration (single quotes, 2-space indent, trailing commas)
- Husky pre-commit hooks for linting and formatting
- SonarQube or similar for code smell detection

**Rationale**: Poor code quality accumulates technical debt exponentially. A dashboard application requires frequent iteration and feature additions. Without strict quality standards, the codebase becomes unmaintainable within months, slowing development and increasing bug rates.

### II. Testing-First Development

Testing MUST be treated as a first-class activity, not an afterthought.

**Non-Negotiable Rules**:
- **Test Before Implementation**: For new features, write failing tests FIRST, then implement until tests pass (TDD).
- **Coverage Gates**: Pull requests MUST maintain or improve coverage. No PR merged if coverage drops below:
  - 80% for utility functions and business logic
  - 60% for React components
  - 50% for integration tests covering critical user journeys
- **Test Types Required**:
  - **Unit Tests**: All utility functions, custom hooks, data transformations
  - **Component Tests**: Shared components in `src/components/` using React Testing Library
  - **Integration Tests**: Critical user journeys (search flow, movie details, filter combinations)
  - **Visual Regression**: UI components with complex layouts (recommended, not required)
- **Test Quality**: Tests MUST be readable, isolated, and deterministic. Flaky tests MUST be fixed immediately.
- **CI/CD Integration**: All tests MUST pass in CI before merge. No "fix later" promises.

**Testing Standards**:
- Use React Testing Library (not Enzyme) for component tests
- Use Jest for test runner and assertions
- Use MSW (Mock Service Worker) for API mocking
- Use Playwright or Cypress for E2E tests (optional)
- Test file naming: `ComponentName.test.tsx` or `utilityName.test.ts`
- Test location: Colocated with source files or in `__tests__/` directory

**Rationale**: Untested code is broken code waiting to happen. Dashboard applications have complex interactions (search, filters, state management). Without comprehensive tests, refactoring becomes terrifying, bugs multiply, and developer velocity collapses. Testing first forces better design.

### III. User Experience Consistency

The user interface MUST provide a consistent, accessible, and delightful experience across all features.

**Non-Negotiable Rules**:
- **Design System Adherence**: All components MUST use tokens from the design system (colors, spacing, typography, shadows).
- **Consistency Checks**:
  - Navigation patterns MUST be identical across pages (same header, menu structure)
  - Button styles MUST be consistent (primary, secondary, danger variants)
  - Form inputs MUST use the same validation and error display patterns
  - Loading states MUST use consistent skeletons or spinners (not mixed approaches)
  - Empty states MUST follow the same template (icon + message + call-to-action)
- **Accessibility Requirements** (WCAG 2.1 AA):
  - Semantic HTML MUST be used (`nav`, `main`, `article`, `button` not `div` with click handlers)
  - Keyboard navigation MUST work (tab order, Enter/Space for actions, Escape to close)
  - Color contrast MUST meet 4.5:1 for text, 3:1 for UI components
  - ARIA labels MUST be provided for icon-only buttons and dynamic content
  - Focus indicators MUST be visible (not removed with `outline: none` unless replaced)
- **Mobile Responsiveness**: All features MUST work on screens from 320px to 4K. Touch targets MUST be ≥44x44 pixels.
- **User Feedback**: Every action MUST provide immediate feedback (loading indicators, success messages, error messages).
- **Error Handling**: Error messages MUST be user-friendly ("Movie not found. Try a different title." not "404 Resource Not Found").

**Validation**:
- Storybook for component documentation and visual testing
- Axe DevTools for accessibility auditing
- Lighthouse CI for performance and accessibility scoring
- Manual testing on mobile devices before release

**Rationale**: Inconsistent UX creates cognitive load and erodes user trust. When buttons look different across pages, users question if they're in the same application. Accessibility isn't optional—it's a legal requirement and moral obligation. A beautiful dashboard that only works on desktop for mouse users is a failed dashboard.

### IV. Performance Requirements

The application MUST feel instant and responsive at all times.

**Non-Negotiable Rules**:
- **Load Time Budgets**:
  - Initial page load: ≤2 seconds on 3G connection (Lighthouse mobile)
  - Time to Interactive (TTI): ≤3.5 seconds
  - First Contentful Paint (FCP): ≤1.2 seconds
  - Largest Contentful Paint (LCP): ≤2.5 seconds
- **Bundle Size Limits**:
  - Main JavaScript bundle: ≤500KB (gzipped)
  - Total JavaScript (all chunks): ≤1MB (gzipped)
  - CSS bundle: ≤50KB (gzipped)
- **Runtime Performance**:
  - Search results MUST appear within 300ms of keystroke (debounced)
  - Page navigation MUST start rendering within 100ms
  - Animations MUST run at 60fps (no jank)
  - Infinite scroll MUST maintain smooth scrolling with 1000+ items
- **Optimization Techniques** (REQUIRED):
  - Code splitting by route (React.lazy + Suspense)
  - Image lazy loading with intersection observer
  - Virtualized lists for large datasets (react-window or similar)
  - Memoization for expensive computations (React.memo, useMemo, useCallback)
  - Debouncing for search inputs and resize handlers
- **Monitoring**: Performance MUST be tracked in production (Web Vitals, error rates, bundle size trends).

**Enforcement**:
- Lighthouse CI in pull requests (fail if score drops below 90 for performance)
- Bundle size analyzer (fail if bundle exceeds limits)
- Performance budgets in webpack/Vite config
- Real User Monitoring (RUM) in production

**Rationale**: Users expect instant responses. A 1-second delay in search reduces satisfaction by 16%. Bundle bloat compounds over time—without strict limits, the app becomes unusable on mobile. Performance is a feature, not an optimization. Slow dashboards get abandoned.

## Technology Standards

### Mandatory Stack

- **Language**: TypeScript 5+ (strict mode enabled)
- **Framework**: React 18+ with functional components and hooks
- **Build Tool**: Vite 5+ (faster than webpack, better DX)
- **Package Manager**: pnpm (faster than npm, better disk usage)
- **State Management**: Zustand or Jotai (prefer atomic state over Redux)
- **Data Fetching**: TanStack Query (React Query v5) for server state
- **Styling**: Tailwind CSS with custom design system tokens
- **Testing**: Jest + React Testing Library + MSW
- **Linting**: ESLint + TypeScript ESLint + Prettier
- **Git Hooks**: Husky + lint-staged

### Recommended Tools

- **UI Components**: shadcn/ui or Radix UI (accessible primitives)
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React (tree-shakeable, consistent)
- **Date Handling**: date-fns (lighter than Moment.js)
- **Utilities**: lodash-es (tree-shakeable imports only)

### Prohibited Practices

- ❌ Class components (use functional components + hooks)
- ❌ Inline styles (use Tailwind or CSS modules)
- ❌ `any` type (use `unknown` or proper types)
- ❌ `@ts-ignore` without explanation (use `@ts-expect-error` with comment)
- ❌ Direct DOM manipulation (use refs and React APIs)
- ❌ Mixing state management libraries (pick one and stick to it)

## Quality Standards

### Code Review Requirements

All code changes MUST be reviewed before merge:
- **Reviewer Checklist**:
  - Tests added/updated and passing ✅
  - TypeScript types are correct (no `any`) ✅
  - Code follows style guide (ESLint + Prettier) ✅
  - Performance impact considered (bundle size, runtime) ✅
  - Accessibility tested (keyboard nav, screen reader) ✅
  - Error handling implemented ✅
  - Documentation updated (if public API changed) ✅
- **UI Changes**: MUST include screenshots/videos in PR description
- **Breaking Changes**: MUST include migration guide and semver bump
- **Performance Regressions**: MUST be justified or fixed before merge

### Documentation Requirements

- **README.md**: Quick start, development setup, deployment instructions
- **Component Storybook**: All shared components MUST have stories
- **API Documentation**: OpenAPI/Swagger spec for backend endpoints
- **ADRs**: Architecture Decision Records for major technical choices
- **Changelog**: MUST follow Keep a Changelog format

### Continuous Integration

All pull requests MUST pass:
1. Type checking (`tsc --noEmit`)
2. Linting (`eslint . --max-warnings 0`)
3. Unit tests (`jest --coverage`)
4. Integration tests (Playwright/Cypress for critical paths)
5. Lighthouse CI (performance score ≥90)
6. Bundle size check (fail if exceeds limits)

## Governance

### Amendment Procedure

1. **Proposal**: Document proposed changes with rationale in GitHub issue
2. **Discussion**: Team reviews and discusses (minimum 3 business days)
3. **Approval**: Requires 2/3 team consensus (or tech lead decision)
4. **Implementation**: Update constitution and propagate to templates
5. **Versioning**: Increment version per semantic versioning:
   - **MAJOR**: Remove principles or change core technology stack
   - **MINOR**: Add new principles or expand standards materially
   - **PATCH**: Fix typos, clarify wording, non-semantic updates

### Compliance Verification

- **Pre-Merge**: All PRs MUST self-certify compliance with applicable principles
- **Code Review**: Reviewers MUST cite specific principles when requesting changes
- **Retrospectives**: Monthly review of constitution adherence and effectiveness
- **Quarterly Audit**: Full codebase scan for compliance violations

### Enforcement Hierarchy

1. **Automated**: Tooling prevents non-compliant code (ESLint, TypeScript, CI/CD)
2. **Code Review**: Humans catch issues tools miss (architecture, readability)
3. **Post-Merge**: If violations slip through, create ticket and fix within 1 sprint
4. **Technical Debt**: Intentional violations MUST be documented with repayment plan

### Exception Process

If a principle MUST be violated (rare):
1. Document WHY the violation is necessary
2. Document WHEN the debt will be repaid
3. Get explicit approval from tech lead
4. Add TODO comment with ticket reference in code
5. Create tracking ticket for resolution

**Version**: 1.1.0 | **Ratified**: 2026-02-24 | **Last Amended**: 2026-02-24
