# Claude AI Development Guide

Best practices for AI-assisted development on this Astro + TypeScript + Tailwind CSS + Supabase stack.

## Package Management

**CRITICAL**: This project uses **pnpm exclusively**. Never use npm or yarn.

```bash
# ✅ Correct
pnpm install
pnpm add <package>
pnpm dev
pnpm build
pnpm lint

# ❌ Wrong
npm install
yarn add <package>
```

## Development Workflow

### Pre-Submission Checklist

**MANDATORY** before marking any task complete:

1. **Run linter**: `pnpm lint` - Fix all errors
2. **Run build**: `pnpm build` - Ensure successful build
3. **Preview**: `pnpm preview` - Test critical functionality

**Never use `eslint-disable` without clear justification.**

### Development Commands

```bash
pnpm dev          # Start dev server (http://localhost:4321)
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Check for issues
pnpm lint:fix     # Auto-fix issues
```

---

## TypeScript Best Practices

### Type Organization

**CRITICAL**: Centralize all types in `src/types/` directory.

```
src/types/
├── calendar.ts      # Calendar and content types
├── database.ts      # Supabase database types
└── [feature].ts     # Feature-specific types
```

**Rules**:
- ✅ Create types in `src/types/`
- ✅ Export and import types properly
- ❌ **NEVER** use `@ts-ignore` or `@ts-expect-error`
- ❌ **NEVER** use `any` type (use `unknown` if necessary)

### Good Type Practices

```typescript
// ✅ Good
export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export type ContentType = "photo" | "spotify" | "text" | "message";

// ❌ Bad
function getData(): any { }
// @ts-ignore
const value = someFunction();

// ✅ Better
function getData(): unknown { }
const value = someFunction() as UserProfile;
```

### Avoiding ts-ignore

Fix the underlying issue instead:

```typescript
// ❌ Bad
// @ts-ignore
const data = response.data;

// ✅ Good: Type guard
function isValidData(data: unknown): data is UserData {
  return typeof data === 'object' && data !== null && 'id' in data;
}

if (isValidData(response.data)) {
  const data = response.data; // Properly typed
}
```

---

## Code Quality & Linting

### ESLint Key Rules

- `@typescript-eslint/no-unused-vars`: Error (prefix unused with `_`)
- `@typescript-eslint/no-explicit-any`: Warning
- `no-console`: Warning (allow `console.warn`, `console.error`)
- `prefer-const`: Error

### Clean Code

```typescript
// ✅ Prefix unused variables with underscore
function onClick(_event: MouseEvent) {
  handleClick();
}

// ✅ Use descriptive names
const currentDate = new Date();
const userProfile = getUserProfile();

// ✅ Remove debug console.log before commit
console.warn('API rate limit approaching'); // OK
console.log('Debug:', data); // Remove before commit
```

---

## Component Development

### React Components

```typescript
import type { CalendarContent } from '../types/calendar';

interface CalendarDayProps {
  day: number;
  content: CalendarContent;
  isOpen: boolean;
  onOpen: (day: number) => void;
}

export function CalendarDay({ day, content, isOpen, onOpen }: CalendarDayProps) {
  return <div className="calendar-day">{/* ... */}</div>;
}
```

### Astro Components

```astro
---
import type { CalendarConfig } from '../types/calendar';

interface Props {
  config: CalendarConfig;
  isPreview?: boolean;
}

const { config, isPreview = false } = Astro.props;
---

<div class="calendar-container">
  <!-- ... -->
</div>
```

### Component Organization

```txt
src/components/
├── Calendar/
│   ├── Calendar.astro
│   └── CalendarDay.tsx
├── Auth/
│   └── LoginForm.tsx
└── shared/
    └── Button.tsx
```

---

## Supabase & Database

**See [supabase/README.md](supabase/README.md) for complete schema documentation.**

### Type-Safe Database Operations

All database operations must use types from `src/types/database.ts`:

```typescript
import type { Friend, FriendInsert } from '../types/database';
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
```

### Error Handling

Always handle errors properly:

```typescript
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
    return { success: false, data: null, error: 'Unexpected error occurred' };
  }
}
```

### Environment Variables

Required in `.env`:
- `PUBLIC_SUPABASE_URL`
- `PUBLIC_SUPABASE_ANON_KEY`

See [README.md](README.md#full-setup-with-supabase-optional) for setup instructions.

---

## Styling with Tailwind CSS

This project uses **Tailwind CSS v4** with the Vite plugin.

### Best Practices

```html
<!-- ✅ Good: Utility classes -->
<div class="flex items-center gap-4 rounded-lg bg-white p-6 shadow-md">

<!-- ✅ Good: Responsive (mobile-first) -->
<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">

<!-- ✅ Good: Include focus states for accessibility -->
<button class="rounded-md bg-blue-600 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
```

---

## Build & Deployment

### Build Process

```bash
pnpm build    # Generates dist/ folder
pnpm preview  # Preview production build
```

### Pre-Deployment Checklist

- ✅ `pnpm lint` passes
- ✅ `pnpm build` succeeds
- ✅ Preview looks correct
- ✅ Environment variables configured in Vercel
- ✅ No console errors
- ✅ Responsive design tested

**See [README.md](README.md#-deployment) for deployment instructions.**

---

## Testing

### Manual Testing Checklist

For each feature:
1. **Functionality** - Works as expected
2. **Edge cases** - Empty states, errors, loading
3. **Accessibility** - Keyboard navigation, screen readers
4. **Responsive** - Mobile, tablet, desktop
5. **Performance** - Fast load times, smooth animations
6. **Browsers** - Chrome, Firefox, Safari

---

## Git & Version Control

### Branch Naming

- `main` - Production
- `claude/*` - AI-assisted development
- `feature/*` - Features
- `fix/*` - Bug fixes

### Commit Messages

Follow conventional commits:

```bash
feat(calendar): add window opening animation
fix(auth): resolve login redirect issue
refactor(database): improve type safety
docs(readme): update setup instructions
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`

### GitHub Actions

CI runs automatically on push/PR to `main` and `claude/**` branches.

**Workflow**: `.github/workflows/lint.yml`
- Installs dependencies with pnpm
- Runs `pnpm lint`

**Before pushing**, run locally:
```bash
pnpm lint && pnpm build
```

---

## Quick Reference

### Pre-Submission Checklist

- [ ] `pnpm lint` - all checks pass
- [ ] `pnpm build` - build succeeds
- [ ] Test in browser - no console errors
- [ ] No `@ts-ignore` or `any` types
- [ ] Types in `src/types/`
- [ ] Commit message follows conventions

### Common Commands

```bash
pnpm dev          # Dev server
pnpm build        # Build
pnpm preview      # Preview
pnpm lint         # Check
pnpm lint:fix     # Fix
```

---

**See also**:
- [README.md](README.md) - Setup and deployment
- [supabase/README.md](supabase/README.md) - Database schema

**Last Updated**: 2025-11-18
