# Elsa's Castle

A cosy, rainbow-coloured web game for a 3-year-old: princesses, unicorns and a big castle.

**Milestone 1 (this version)**
- Dollhouse castle with six rooms. Drag a princess into a room and she moves in (saved on the device).
- Tap princesses and unicorns for sparkles, chimes and neighs.
- Gentle background music, installable offline (PWA), tablet-first touch controls.
- Parent corner: hold the small circle in the top-right corner for 3 seconds (sound on/off, reset).

**Coming next:** dress-up, the lake, unicorn riding and trips, then day/night, photo book, names/birthdays and unicorn care.

## Run locally
No build step. Serve the folder with any static server, e.g. `python3 -m http.server` and open http://localhost:8000.

## Publish on GitHub Pages
Repo **Settings → Pages → Source: GitHub Actions**. The workflow in `.github/workflows/pages.yml` deploys on every push to `main`.
