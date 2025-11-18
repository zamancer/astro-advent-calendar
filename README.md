# 🎄 Advent Calendar - Christmas Memories

An elegant, interactive Advent Calendar web application built with Astro, React, and TypeScript for sharing personalized Christmas memories with friends.

## ✨ Features

- **12 Interactive Windows**: Beautiful calendar grid with numbered doors
- **Multiple Content Types**: Photos, Spotify embeds, text messages, and image messages
- **Smooth Animations**: Hover effects, modal transitions, and optional snowfall
- **Progress Tracking**: Visual indicator showing which windows have been opened
- **Fully Responsive**: Mobile-first design that works beautifully on all devices
- **Persistent State**: Remembers which windows you've opened using localStorage
- **Easy Customization**: Simple configuration file for adding your own content

## 🚀 Quick Start

### Demo Mode (No Setup Required)

The app runs in **demo mode** by default, allowing you to develop and test without any backend setup:

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Start development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open in browser**: Navigate to `http://localhost:4321`

### Full Setup with Supabase (Optional)

To enable backend features like user authentication and data persistence:

1. **Create a Supabase project**:
   - Go to [https://supabase.com](https://supabase.com) and create a new project
   - Wait for the project to finish setting up

2. **Get your Supabase credentials**:
   - Navigate to Project Settings → API
   - Copy your `Project URL` and `anon/public` key

3. **Configure environment variables**:
   \`\`\`bash
   cp .env.example .env
   \`\`\`

   Edit `.env` and add your Supabase credentials:
   \`\`\`env
   PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   PUBLIC_DEMO_MODE=false
   \`\`\`

4. **Start development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

## 🎨 Customization

### Adding Your Own Content

Edit `src/config/calendar-content.ts` to customize the calendar:

\`\`\`typescript
export const calendarConfig: CalendarConfig = {
  title: "Your Title Here",
  subtitle: "Your subtitle here",
  contents: [
    // Add your content items here
  ]
};
\`\`\`

### Content Types

**Photo Content**:
\`\`\`typescript
{
  type: 'photo',
  day: 1,
  imageUrl: '/path/to/image.jpg',
  caption: 'Your caption here',
  alt: 'Image description'
}
\`\`\`

**Spotify Content**:
\`\`\`typescript
{
  type: 'spotify',
  day: 2,
  embedUrl: 'https://open.spotify.com/embed/track/...',
  title: 'Song Title',
  description: 'Optional description'
}
\`\`\`

**Text Content**:
\`\`\`typescript
{
  type: 'text',
  day: 3,
  message: 'Your message here',
  author: 'Optional author name'
}
\`\`\`

**Message Content**:
\`\`\`typescript
{
  type: 'message',
  day: 4,
  title: 'Message Title',
  message: 'Your message here',
  imageUrl: '/optional/image.jpg'
}
\`\`\`

### Styling

Customize colors and fonts in `src/styles/globals.css`:

\`\`\`css
@theme inline {
  --color-background: #0a0f0d;
  --color-accent: #d4af37;
  --font-sans: 'Your Font', sans-serif;
  /* ... more customization */
}
\`\`\`

### Toggle Snowfall

In `src/pages/index.astro`, change the `enabled` prop:

\`\`\`astro
<Snowfall client:load enabled={false} />
\`\`\`

## 📦 Building for Production

\`\`\`bash
npm run build
\`\`\`

The static site will be generated in the `dist/` folder, ready for deployment.

## 🚢 Deployment

### Demo Mode Deployment

For demo mode (no backend), deploy as a static site to:

- **Vercel**: Connect your GitHub repo and deploy automatically
- **Netlify**: Drag and drop the `dist` folder or connect via Git
- **GitHub Pages**: Push the `dist` folder to a `gh-pages` branch

### Deployment with Supabase

#### Vercel Deployment

1. **Connect your repository** to Vercel

2. **Add environment variables** in your Vercel project settings:
   - Go to Project Settings → Environment Variables
   - Add the following variables:
     ```env
     PUBLIC_SUPABASE_URL=your-project-url.supabase.co
     PUBLIC_SUPABASE_ANON_KEY=your-anon-key
     PUBLIC_DEMO_MODE=false
     ```

3. **Deploy**: Vercel will automatically deploy your site with Supabase integration

#### Other Platforms

For Netlify, GitHub Pages, or other platforms:

1. Add the environment variables in your platform's settings
2. Ensure the variables are prefixed with `PUBLIC_` to be accessible in the browser
3. Deploy as usual

**Important**: Never commit your `.env` file to version control. Always use your platform's environment variable settings for production deployments.

## 🛠️ Tech Stack

- **Astro**: Static site framework
- **React**: Interactive components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Canvas API**: Snowfall animation
- **Supabase**: Backend platform (optional, for authentication and data persistence)

## 🏗️ Infrastructure

### Demo Mode

The application includes a **demo mode** feature flag system that allows development without requiring Supabase setup:

- **Default**: Demo mode is ON
- **Toggle**: Set `PUBLIC_DEMO_MODE=false` in `.env` to disable
- **Usage**: Import `isDemoMode()`, `isAuthRequired()`, or `isSupabaseEnabled()` from `src/lib/featureFlags.ts`

Example:
\`\`\`typescript
import { isDemoMode, isAuthRequired } from '~/lib/featureFlags';

if (isDemoMode()) {
  // Use local state or mock data
} else {
  // Use Supabase for real data
}
\`\`\`

### Supabase Integration

Supabase client is available at `src/lib/supabase.ts`:

\`\`\`typescript
import { supabase, isSupabaseConfigured } from '~/lib/supabase';

if (isSupabaseConfigured()) {
  // Supabase is ready to use
  const { data, error } = await supabase.from('table').select();
}
\`\`\`

### Database Schema

The application includes a complete database schema for tracking friends and their calendar progress:

**Tables:**
- `friends` - Stores friend information (name, email, unique access code)
- `friend_window_opens` - Tracks which windows each friend has opened

**Features:**
- Prevents duplicate window opens (each friend can only open each window once)
- TypeScript types for type-safe database operations
- Helper functions for common database queries
- Seed data for development and testing

**Setup:**

1. Run the migration in your Supabase SQL Editor:
   \`\`\`bash
   # Copy the contents of supabase/migrations/20250101000000_create_friend_calendar_schema.sql
   # Paste and run in Supabase Dashboard → SQL Editor
   \`\`\`

2. (Optional) Load seed data for testing:
   \`\`\`bash
   # Copy the contents of supabase/seed.sql
   # Paste and run in Supabase Dashboard → SQL Editor
   \`\`\`

**Usage:**

\`\`\`typescript
import { getFriendByCode, recordWindowOpen, getFriendWithProgress } from '~/lib/database';

// Get friend by their unique code
const { data: friend } = await getFriendByCode('ALICE123');

// Record window open
await recordWindowOpen({
  friend_id: friend.id,
  window_number: 1,
});

// Get friend's progress
const { data: progress } = await getFriendWithProgress(friend.id);
console.log(progress.windows_opened); // [1, 2, 3]
\`\`\`

📚 **Full documentation**: See [supabase/README.md](supabase/README.md) for detailed schema documentation, TypeScript types, and examples.

## 📝 Project Structure

\`\`\`
/
├── src/
│   ├── components/
│   │   ├── CalendarGrid.tsx       # Main calendar component
│   │   ├── CalendarWindow.tsx     # Individual window component
│   │   ├── ContentModal.tsx       # Modal for displaying content
│   │   ├── Snowfall.tsx           # Snowfall animation
│   │   └── content/               # Content type components
│   ├── config/
│   │   └── calendar-content.ts    # Calendar configuration
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client setup
│   │   ├── database.ts            # Database helper functions
│   │   └── featureFlags.ts        # Feature flag system (demo mode)
│   ├── types/
│   │   ├── calendar.ts            # Content type interfaces
│   │   └── database.ts            # Database schema types
│   ├── styles/
│   │   └── globals.css            # Global styles and theme
│   ├── pages/
│   │   └── index.astro            # Main page
│   └── env.d.ts                   # Environment variable types
├── supabase/
│   ├── migrations/
│   │   └── 20250101000000_create_friend_calendar_schema.sql
│   ├── seed.sql                   # Test data for development
│   └── README.md                  # Database schema documentation
├── public/                        # Static assets
├── .env.example                   # Environment variables template
├── astro.config.mjs              # Astro configuration
├── package.json
└── tsconfig.json
\`\`\`

## 🎁 Tips

- Add your own images to the `public/` folder and reference them in the config
- Get Spotify embed URLs by clicking "Share" → "Embed" on any track
- The calendar remembers opened windows even after page refresh
- All windows can be opened in any order (not date-locked)

## 📄 License

Free to use and customize for personal projects!

---

Made with ❤️ for the holidays
