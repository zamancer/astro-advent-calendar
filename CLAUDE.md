# Claude AI Development Guide

This document outlines best practices and guidelines for AI-assisted development on this Astro + TypeScript + Tailwind CSS + Supabase + Vercel + GitHub Actions project.

## Table of Contents

- [Package Management](#package-management)
- [Development Workflow](#development-workflow)
- [TypeScript Best Practices](#typescript-best-practices)
- [Code Quality & Linting](#code-quality--linting)
- [Component Development](#component-development)
- [Supabase & Database](#supabase--database)
- [Styling with Tailwind CSS](#styling-with-tailwind-css)
- [Build & Deployment](#build--deployment)
- [Testing](#testing)
- [Git & Version Control](#git--version-control)

---

## Package Management

### Always Use pnpm

**CRITICAL**: This project uses pnpm as the package manager. All AI agents must use pnpm exclusively.

```bash
# ✅ Correct
pnpm install
pnpm add <package-name>
pnpm dev
pnpm build
pnpm lint

# ❌ Wrong - Never use npm or yarn
npm install
yarn add <package-name>
```

**Rationale**: pnpm provides better disk space efficiency, faster installations, and stricter dependency management.

### Key pnpm Commands

```bash
# Install dependencies
pnpm install --frozen-lockfile  # CI/CD environments
pnpm install                    # Local development

# Add dependencies
pnpm add <package>              # Production dependency
pnpm add -D <package>           # Development dependency

# Run scripts
pnpm dev                        # Start dev server
pnpm build                      # Build for production
pnpm preview                    # Preview production build
pnpm lint                       # Run linter
pnpm lint:fix                   # Auto-fix linting issues
```

---

## Development Workflow

### Pre-Submission Checklist

**MANDATORY**: Before marking any task as complete or submitting for review, you MUST:

1. **Run the linter**:
   ```bash
   pnpm lint
   ```
   - Fix all errors
   - Address warnings where possible
   - Never use `eslint-disable` without a clear, documented reason

2. **Run the build**:
   ```bash
   pnpm build
   ```
   - Ensure the build completes successfully
   - Check for type errors
   - Verify no unused exports or imports

3. **Preview the build** (when relevant):
   ```bash
   pnpm preview
   ```
   - Test critical functionality
   - Verify responsive design
   - Check for console errors

### Development Server

```bash
# Start development server (http://localhost:4321)
pnpm dev
```

Always test changes in the browser during development, especially for:
- UI components
- Interactive features
- Responsive layouts
- Form validations

---

## TypeScript Best Practices

### Type Organization

**CRITICAL**: All TypeScript types must be properly organized and centralized.

```
src/types/
├── calendar.ts      # Calendar and content types
├── database.ts      # Supabase database types
└── [feature].ts     # Feature-specific types
```

**Rules**:
1. ✅ Create types in `src/types/` directory
2. ✅ Export types from dedicated type files
3. ✅ Import types where needed
4. ❌ NEVER use `@ts-ignore` or `@ts-expect-error`
5. ❌ NEVER use `any` type (use `unknown` if necessary)

### Good Type Practices

```typescript
// ✅ Good: Well-defined interface with proper types
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

// ✅ Good: Union types for variants
export type ContentType = "photo" | "spotify" | "text" | "message";

// ✅ Good: Generic types for reusable patterns
export interface DatabaseResponse<T> {
  data: T | null;
  error: Error | null;
}

// ❌ Bad: Using 'any'
function getData(): any { }

// ❌ Bad: Using ts-ignore
// @ts-ignore
const value = someFunction();

// ✅ Better: Proper typing or unknown
function getData(): unknown { }
const value = someFunction() as UserProfile;
```

### Type Imports

```typescript
// ✅ Good: Named type imports
import type { CalendarContent, ContentType } from '../types/calendar';
import type { Friend, FriendWithProgress } from '../types/database';

// ✅ Good: Inline type imports (TypeScript 4.5+)
import { type Friend, getFriend } from '../lib/database';
```

### Avoiding ts-ignore

Instead of using `@ts-ignore`, fix the underlying issue:

```typescript
// ❌ Bad
// @ts-ignore
const data = response.data;

// ✅ Good: Add proper type guard
function isValidData(data: unknown): data is UserData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'id' in data
  );
}

if (isValidData(response.data)) {
  const data = response.data; // Properly typed
}

// ✅ Good: Use type assertion with validation
const data = response.data as UserData;

// ✅ Good: Define proper types
interface ApiResponse {
  data: UserData;
  error: string | null;
}
```

---

## Code Quality & Linting

### ESLint Configuration

This project uses ESLint with TypeScript, React, and Astro plugins.

**Key Rules**:
- `@typescript-eslint/no-unused-vars`: Error (with `_` prefix exceptions)
- `@typescript-eslint/no-explicit-any`: Warning (avoid `any`)
- `no-console`: Warning (allow `console.warn` and `console.error`)
- `prefer-const`: Error
- `react-hooks/rules-of-hooks`: Error
- `react-hooks/exhaustive-deps`: Warning

### Linting Workflow

```bash
# Check for issues
pnpm lint

# Auto-fix issues
pnpm lint:fix

# Lint specific files
pnpm lint src/components/Calendar.tsx
```

### Clean Code Principles

1. **No unused variables**: Remove or prefix with `_`
   ```typescript
   // ✅ Good
   function onClick(_event: MouseEvent) {
     handleClick();
   }
   ```

2. **Meaningful names**: Use descriptive variable and function names
   ```typescript
   // ❌ Bad
   const d = new Date();
   const u = getData();

   // ✅ Good
   const currentDate = new Date();
   const userProfile = getUserProfile();
   ```

3. **Console statements**: Only use for debugging, remove before commit
   ```typescript
   // ✅ Acceptable
   console.warn('API rate limit approaching');
   console.error('Failed to fetch data:', error);

   // ❌ Remove before commit
   console.log('Debug:', data);
   ```

---

## Component Development

### React Components

```typescript
// ✅ Good: Typed functional component
import type { CalendarContent } from '../types/calendar';

interface CalendarDayProps {
  day: number;
  content: CalendarContent;
  isOpen: boolean;
  onOpen: (day: number) => void;
}

export function CalendarDay({ day, content, isOpen, onOpen }: CalendarDayProps) {
  return (
    <div className="calendar-day">
      {/* Component content */}
    </div>
  );
}
```

### Astro Components

```astro
---
// ✅ Good: Typed Astro component
import type { CalendarConfig } from '../types/calendar';

interface Props {
  config: CalendarConfig;
  isPreview?: boolean;
}

const { config, isPreview = false } = Astro.props;
---

<div class="calendar-container">
  <!-- Component markup -->
</div>
```

### Component Organization

```
src/components/
├── Calendar/
│   ├── Calendar.astro
│   ├── CalendarDay.tsx
│   └── CalendarGrid.tsx
├── Auth/
│   ├── LoginForm.tsx
│   └── AuthProvider.tsx
└── shared/
    ├── Button.tsx
    └── Modal.tsx
```

---

## Supabase & Database

### Type Safety with Supabase

**CRITICAL**: All database operations must be properly typed.

```typescript
// ✅ Good: Typed database queries
import type { Friend, FriendInsert, FriendWithProgress } from '../types/database';
import { supabase } from './supabase';

export async function getFriend(id: string): Promise<Friend | null> {
  const { data, error } = await supabase
    .from('friends')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching friend:', error);
    return null;
  }

  return data;
}

export async function createFriend(friend: FriendInsert): Promise<Friend | null> {
  const { data, error } = await supabase
    .from('friends')
    .insert(friend)
    .select()
    .single();

  if (error) {
    console.error('Error creating friend:', error);
    return null;
  }

  return data;
}
```

### Database Type Organization

Organize database types by purpose:

```typescript
// src/types/database.ts

// Base table types (matching schema)
export interface Friend {
  id: string;
  name: string;
  email: string;
  unique_code: string;
  created_at: string;
  updated_at: string;
}

// Insert types (for creating records)
export interface FriendInsert {
  name: string;
  email: string;
  unique_code: string;
}

// Update types (for updating records)
export interface FriendUpdate {
  name?: string;
  email?: string;
}

// Extended types (with joined data)
export interface FriendWithProgress extends Friend {
  windows_opened: number[];
  total_windows_opened: number;
}
```

### Error Handling

```typescript
// ✅ Good: Proper error handling
export async function getWindowProgress(friendId: string) {
  try {
    const { data, error } = await supabase
      .from('friend_window_opens')
      .select('window_number')
      .eq('friend_id', friendId);

    if (error) {
      console.error('Database error:', error.message);
      return { success: false, data: null, error: error.message };
    }

    return { success: true, data, error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, data: null, error: 'An unexpected error occurred' };
  }
}
```

### Environment Variables

```typescript
// src/lib/supabase.ts
const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}
```

**Required Environment Variables**:
- `PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

---

## Styling with Tailwind CSS

### Tailwind v4 Configuration

This project uses Tailwind CSS v4 with the Vite plugin.

```javascript
// astro.config.mjs
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
});
```

### Best Practices

1. **Use Tailwind utilities**: Prefer utility classes over custom CSS
   ```html
   <!-- ✅ Good -->
   <div class="flex items-center gap-4 rounded-lg bg-white p-6 shadow-md">

   <!-- ❌ Avoid when possible -->
   <div class="custom-card">
   ```

2. **Responsive design**: Mobile-first approach
   ```html
   <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
   ```

3. **Component classes**: Extract repeated patterns
   ```css
   @layer components {
     .btn-primary {
       @apply rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700;
     }
   }
   ```

4. **Accessibility**: Always include focus states
   ```html
   <button class="rounded-md bg-blue-600 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
   ```

---

## Build & Deployment

### Vercel Deployment

This project is configured for Vercel deployment with static output.

```javascript
// astro.config.mjs
export default defineConfig({
  output: "static",
  adapter: vercel(),
});
```

### Build Process

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

**Build outputs**:
- `dist/`: Static files ready for deployment
- `.vercel/output/`: Vercel-specific build artifacts

### Pre-Deployment Checklist

Before deploying:

1. ✅ All tests pass (if applicable)
2. ✅ Linter passes: `pnpm lint`
3. ✅ Build succeeds: `pnpm build`
4. ✅ Preview looks correct: `pnpm preview`
5. ✅ Environment variables configured in Vercel
6. ✅ No console errors in browser
7. ✅ Responsive design tested

### Environment Variables in Vercel

Configure these in your Vercel project settings:
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

---

## Testing

### Manual Testing Checklist

For each feature, test:

1. **Functionality**: Does it work as expected?
2. **Edge cases**: Empty states, errors, loading states
3. **Accessibility**: Keyboard navigation, screen readers
4. **Responsive**: Mobile, tablet, desktop
5. **Performance**: Fast load times, smooth animations
6. **Browser compatibility**: Chrome, Firefox, Safari

### Future: Automated Testing

When adding tests, follow these patterns:

```typescript
// src/components/__tests__/Calendar.test.ts
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { CalendarDay } from '../Calendar/CalendarDay';

describe('CalendarDay', () => {
  it('renders the day number', () => {
    const { getByText } = render(
      <CalendarDay day={1} content={mockContent} isOpen={false} onOpen={() => {}} />
    );
    expect(getByText('1')).toBeInTheDocument();
  });
});
```

---

## Git & Version Control

### Branch Naming

- `main`: Production branch
- `claude/*`: AI-assisted development branches
- `feature/*`: Feature branches
- `fix/*`: Bug fix branches

### Commit Messages

Follow conventional commits:

```bash
# Format: <type>(<scope>): <description>

feat(calendar): add window opening animation
fix(auth): resolve login redirect issue
refactor(database): improve type safety for queries
docs(readme): update setup instructions
style(ui): adjust spacing in calendar grid
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation
- `style`: Formatting, styling
- `test`: Adding tests
- `chore`: Maintenance tasks

### GitHub Actions

This project has automated linting on push and pull requests.

**Workflow**: `.github/workflows/lint.yml`

The CI will:
1. Install dependencies with pnpm
2. Run ESLint
3. Report any errors

**Make sure your code passes locally before pushing**:
```bash
pnpm lint && pnpm build
```

---

## Quick Reference

### Common Commands

```bash
# Development
pnpm dev                  # Start dev server
pnpm build                # Build for production
pnpm preview              # Preview build

# Code Quality
pnpm lint                 # Check linting
pnpm lint:fix             # Fix linting issues

# Dependencies
pnpm install              # Install dependencies
pnpm add <package>        # Add dependency
pnpm add -D <package>     # Add dev dependency
```

### Pre-Submission Checklist

- [ ] Run `pnpm lint` - all checks pass
- [ ] Run `pnpm build` - build succeeds
- [ ] Test in browser - no console errors
- [ ] Check responsive design
- [ ] No `@ts-ignore` or `any` types
- [ ] Types properly organized in `src/types/`
- [ ] Environment variables documented
- [ ] Commit message follows conventions

---

## Additional Resources

- [Astro Documentation](https://docs.astro.build/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [pnpm Documentation](https://pnpm.io/)

---

**Last Updated**: 2025-11-18
**Version**: 1.0.0
