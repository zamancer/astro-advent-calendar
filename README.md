# 🎄 Advent Calendar - Christmas Memories

An elegant, interactive Advent Calendar web application built with Astro, React, and TypeScript for sharing personalized Christmas memories with friends.

## ✨ Features

- **12 Interactive Windows**: Beautiful calendar grid with numbered doors
- **Multiple Content Types**: Photos, Spotify embeds, text messages, and image messages
- **Cloud Image Storage**: Upload images to Supabase with CDN delivery
- **Organized by Folders**: Images automatically organized by friend
- **Bulk Upload Script**: Easy script to upload multiple images at once
- **Demo Mode**: Test with placeholder images before setting up storage
- **Smooth Animations**: Hover effects, modal transitions, and optional snowfall
- **Progress Tracking**: Visual indicator showing which windows have been opened
- **Fully Responsive**: Mobile-first design that works beautifully on all devices
- **Persistent State**: Remembers which windows you've opened using localStorage
- **Easy Customization**: Simple configuration file for adding your own content

## 🚀 Quick Start

1. **Install dependencies**:
   \`\`\`bash
   pnpm install
   \`\`\`

2. **Set up environment** (optional for demo mode):
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your Supabase credentials, or set PUBLIC_DEMO_MODE=true
   \`\`\`

3. **Start development server**:
   \`\`\`bash
   pnpm dev
   \`\`\`

4. **Open in browser**: Navigate to `http://localhost:4321`

## 📸 Image Storage Setup

This calendar supports cloud image storage with Supabase for fast, CDN-backed image delivery.

### Quick Setup

1. **Enable Demo Mode** (for testing):
   \`\`\`bash
   echo "PUBLIC_DEMO_MODE=true" > .env
   \`\`\`
   Images will use placeholders - perfect for development!

2. **Use Supabase** (for production):
   - Create a free account at [Supabase](https://supabase.com)
   - Create a storage bucket named `calendar-images`
   - Copy your credentials to `.env`
   - See [docs/IMAGE_STORAGE.md](docs/IMAGE_STORAGE.md) for detailed setup

### Uploading Images

Use the bulk upload script to upload images organized by friend:

\`\`\`bash
# Upload images for a specific friend
pnpm upload-images alice photo1.jpg photo2.jpg photo3.jpg

# Upload all images from a folder
pnpm upload-images bob ~/Pictures/holiday/*.jpg
\`\`\`

The script will output public URLs for each image.

### Image Optimization

Before uploading, optimize your images for best performance:

\`\`\`bash
# Recommended: 1200x800px, < 200KB, 85% quality
\`\`\`

See [docs/IMAGE_OPTIMIZATION.md](docs/IMAGE_OPTIMIZATION.md) for detailed optimization guide.

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

This project is optimized for static hosting. Deploy to:

- **Vercel**: Connect your GitHub repo and deploy automatically
- **Netlify**: Drag and drop the `dist` folder or connect via Git
- **GitHub Pages**: Push the `dist` folder to a `gh-pages` branch

## 🛠️ Tech Stack

- **Astro**: Static site framework
- **React**: Interactive components
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **Supabase**: Cloud storage and CDN
- **Canvas API**: Snowfall animation

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
│   │   └── storage.ts             # Image storage utilities
│   ├── types/
│   │   └── calendar.ts            # TypeScript interfaces
│   ├── styles/
│   │   └── globals.css            # Global styles and theme
│   └── pages/
│       └── index.astro            # Main page
├── scripts/
│   └── upload-images.js          # Bulk image upload script
├── docs/
│   ├── IMAGE_STORAGE.md          # Storage setup guide
│   └── IMAGE_OPTIMIZATION.md     # Image optimization guide
├── public/                        # Static assets
├── .env.example                  # Environment variables template
├── astro.config.mjs              # Astro configuration
├── package.json
└── tsconfig.json
\`\`\`

## 🎁 Tips

- Use **demo mode** for testing without setting up Supabase
- **Optimize images** before uploading (see docs/IMAGE_OPTIMIZATION.md)
- **Organize by friend**: Use descriptive friend IDs for easier management
- Get **Spotify embed URLs** by clicking "Share" → "Embed" on any track
- The calendar **remembers opened windows** even after page refresh
- All windows can be **opened in any order** (not date-locked)
- **Keep originals**: Always save original images before optimization

## 📚 Documentation

- [Image Storage Setup](docs/IMAGE_STORAGE.md) - Complete guide to Supabase storage
- [Image Optimization](docs/IMAGE_OPTIMIZATION.md) - How to optimize images for web

## 📄 License

Free to use and customize for personal projects!

---

Made with ❤️ for the holidays
