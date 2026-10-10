# Elsa's Castle

A cosy, rainbow-coloured web game for a 3-year-old: princesses, unicorns and a big castle.

**Milestones 1–3 (this version)**
- Dollhouse castle with six rooms. Drag a princess into a room and she moves in (saved on the device).
- Tap a unicorn for sparkles and a neigh. Tap a princess to open her wardrobe: 6 dress, 6 shoe and 6 tiara styles in 8 colours each, saved on the device.
- Tap the pond next to the castle to visit the lake: drag princesses and unicorns into the water, tap or scrub them with the sponge until they are covered in bubbles and come out sparkling clean with a rainbow. Rubber ducks quack when tapped, and the mud puddle gets them dirty again.
- Gentle background music, installable offline (PWA), tablet-first touch controls.
- Parent corner: hold the small circle in the top-right corner for 3 seconds (sound on/off, reset).

**Coming next:** unicorn riding and trips, then day/night, photo book, names/birthdays and unicorn care.

## Run locally
No build step. Serve the folder with any static server, e.g. `python3 -m http.server` and open http://localhost:8000.

## Publish on GitHub Pages
Repo **Settings → Pages → Source: GitHub Actions**. The workflow in `.github/workflows/pages.yml` deploys on every push to `main`.
