# YouTube Clone

A YouTube-inspired video streaming frontend built with **Next.js 16** (App Router), **React 19**, **TypeScript**, **Tailwind CSS v4**, and **Redux Toolkit**. Uses mock data to simulate the YouTube experience — home feed, search, video pages, related videos, and a watch-later list.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router + Turbopack)
- [React 19](https://react.dev)
- [TypeScript](https://www.typescriptlang.org)
- [Tailwind CSS v4](https://tailwindcss.com) (CSS-first config)
- [Redux Toolkit](https://redux-toolkit.js.org) + React Redux
- [lucide-react](https://lucide.dev) icons
- [date-fns](https://date-fns.org)

## Features

**Implemented**

- Home feed with a responsive video grid (1/2/3/4 columns across breakpoints)
- Category filter chips + infinite-style "Load more" pagination
- Full-text search page (`/search?q=...`)
- Watch page (`/watch/[id]`) with player, video info, related videos
- Watch Later (persisted to `localStorage` via context)
- Dark / light theme (system-preference aware, persisted)
- Responsive layout: top nav, collapsible sidebar, mobile drawer
- Channel avatars with colored-initial fallback

**In progress / planned**

- Comments section on the watch page
- Engagement actions (like / dislike / subscribe)
- Real video playback
- Watch history tracking + history page
- Library (Watch Later) page
- Sidebar navigation links (Home / History / Library)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Scripts

| Command            | Description                    |
| ------------------ | ------------------------------ |
| `npm run dev`      | Start the dev server           |
| `npm run build`    | Create a production build      |
| `npm run start`    | Start the production server    |
| `npm run lint`     | Run ESLint                     |

## Project Structure

```
src/
├── app/                    # App Router pages
│   ├── layout.tsx          # Root layout (providers wiring)
│   ├── page.tsx            # Home feed
│   ├── search/page.tsx     # Search page
│   └── watch/[id]/         # Watch page + client component
├── components/
│   ├── home/               # Home-only components
│   ├── layout/             # TopNav, Sidebar, MobileNav, providers
│   ├── search/             # SearchInput, SearchResults
│   ├── ui/                 # Reusable atoms (ChannelAvatar, WatchLaterButton...)
│   └── video/              # VideoCard, VideoGrid, VideoPlayer, VideoInfo...
├── context/                # Theme, WatchLater, History providers
├── lib/
│   ├── data/               # Mock videos + categories
│   ├── constants.ts
│   └── utils.ts            # formatViews, formatDuration, timeAgo
└── store/
    ├── slices/             # videoSlice, searchSlice, uiSlice
    ├── hooks.ts            # Typed useAppDispatch / useAppSelector
    └── index.ts
```

## Notes

- Images are mocked with `https://picsum.photos` (allow-listed in `next.config.ts`).
- Data is mock-only; no backend or API key required.
