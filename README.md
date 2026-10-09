# HQ
Installable liquid-glass personal hub: home dashboard, calendar, news reader, music, notes, Vault, browsing shortcuts, routines, Play Corner and everyday tools. Vanilla JavaScript with no build step. Local data stays in localStorage and IndexedDB; external news, weather and music need network access.

Live: https://trollgamer3116-dotcom.github.io/aaravhq/

## Prism desk (v41)
- Six home spectrum controls change the colour world. Touch & flow also follows navigation and long scroll gestures; named atmosphere choices pin the palette. No timed palette cycling.
- Palette writes are deduplicated. Scroll colour changes happen after a gesture settles, rather than on every frame. Ordinary taps use local caustics and spring effects.
- Two bounded background layers crossfade. The clock artwork pauses offscreen; background and clock motion pause during scrolling. Desktop pointer lighting updates only the targeted glass surface.
- Mobile sheets follow the visual viewport and avoid opening the keyboard automatically. Reduced motion follows the device preference.

## Verification
From `qa`, install the pinned development dependencies and run `npm test` for state, navigation, sheets, offline Vault, games and interaction regressions. Open `qa/mobile.html` for responsive sizing checks at 320, 375, 390, 430 and 768px. The optional scroll rendering probe measures its current Chrome environment; it is not an iPhone or Safari benchmark.

Production assets use `?v=42`; the service worker uses `aaravhq-v42`.

## Music shelf (v44)
Music opens to a personal shelf with a YouTube Music handoff, discoveries, Listen later, favourites, search and removal undo. Existing saved links are retained. Handoffs record only that a link was opened; HQ cannot see playback or start a personalised shuffle in the destination. YouTube embeds load only after choosing the optional HQ player. Save a song or playlist link with Share → Copy link to add it.
