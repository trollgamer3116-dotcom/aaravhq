# HQ
Installable liquid-glass PWA for one person: home dashboard, calendar, news reader, music, focus timer, goals, habits, notes, stats, timers, currency, world clock and calculator. Vanilla JS, no build step, all data in localStorage, works offline.

Live: https://trollgamer3116-dotcom.github.io/aaravhq/

## v4
- **News reader**: glass sheet with parallax hero, serif/sans, text size, light/sepia/dark, reading progress, full text where available (feed → WordPress REST → reader proxies → summary + "Open original"), bookmarks with offline copies, swipe between stories, pull to refresh, skeletons, "For you" mix.
- **Now Playing**: full-screen player that morphs from the mini player, ambient blurred art colours, scrubbable progress, shuffle, repeat, volume, up-next queue, visualiser, video mode, Media Session controls. Library grid and recently played; mini player with progress line and swipe-to-skip.
- **Motion**: animated splash, view transitions between tabs, staggered reveals, liquid tab indicator, droplet pull-to-refresh, springy draggable sheets, count-ups. Respects reduced motion.
- **Spotlight** (search button, ⌘K / Ctrl+K or /): notes, events, goals, habits, news, music, pages, quick actions, plus maths, currency and "time in…" answers.
- **Home**: drag to reorder, hide and restore widgets (press and hold or Edit), nightly recap card with rings.
- **Timers**: stopwatch with laps and multiple countdown timers.

Files: `index.html`, `styles.css`, `app.js` (core + views), `news.js`, `music.js`, `search.js`, `fx.js` (motion), `boot.js`, `sw.js` (cache `aaravhq-v10`).
