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

1. **Install dependencies**:
   \`\`\`bash
   npm install
   \`\`\`

2. **Start development server**:
   \`\`\`bash
   npm run dev
   \`\`\`

3. **Open in browser**: Navigate to `http://localhost:4321`

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
│   ├── types/
│   │   └── calendar.ts            # TypeScript interfaces
│   ├── styles/
│   │   └── globals.css            # Global styles and theme
│   └── pages/
│       └── index.astro            # Main page
├── public/                        # Static assets
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
