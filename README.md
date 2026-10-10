# Elsa's Castle

A cosy, rainbow-coloured web game for a 3-year-old: princesses, unicorns and a big castle.

**Milestones 1–5 (this version)**
- Dollhouse castle with ten rooms. Drag a princess into a room and she moves in (saved on the device).
- Tap a unicorn for sparkles and a neigh. Tap a princess to open her wardrobe: 6 dress, 6 shoe and 6 tiara styles in 8 colours each, saved on the device.
- Tap the pond next to the castle to visit the lake: drag princesses and unicorns into the water, tap or scrub them with the sponge until they are covered in bubbles and come out sparkling clean with a rainbow. Rubber ducks quack when tapped, and the mud puddle gets them dirty again.
- Tap the blue rainbow button (left side) for a trip: Elsa hops on a unicorn and the trip menu opens. (You can also drag any princess onto a unicorn and tap the unicorn.) Choose a trip: Flower Meadow, Cloud Hill, Sweet Forest, Rainbow Bridge, or a free ride. Steer by dragging, collect flowers, butterflies, stars, hearts, gems and sweets by touching or tapping them. At the end of a journey there is a surprise landmark; the Sweet Forest has chocolate mud. The castle button always brings everyone home, and the princess returns to her own room.
- Day and night: the sky slowly turns to dusk and night (stars, moon, glowing windows). Princesses and unicorns fall asleep with Zzz, and the unicorns go to bed at the stable. Tap the sun or moon to change the time of day.
- Camera button: keeps a picture of whatever is on screen; the photo book button opens the album (up to 12 photos, kept on the device).
- Party button (cake): cake with candles to blow out (tap the flames), balloons to pop, confetti and the birthday song. If it is a princess's birthday (set in the parent corner), the party starts by itself the first time the game is opened that day.
- Tap the stable to visit the unicorns: drag apples, carrots or cupcakes to feed them, drag the brush over them to groom them.
- Parent corner: rename the princesses (the name shows in the wardrobe and in the birthday banner), set birthdays, delete photos.
- Gentle background music, installable offline (PWA), tablet-first touch controls.
- Parent corner: hold the small circle in the top-right corner for 3 seconds (sound on/off, reset).

**Done:** all five planned milestones. Ideas for later: more outfits, more destinations, voice cheers recorded by family.

## Run locally
No build step. Serve the folder with any static server, e.g. `python3 -m http.server` and open http://localhost:8000.

Tip: add `?tripseconds=5` to the URL to make journeys short while testing.

## Publish on GitHub Pages
Repo **Settings → Pages → Source: GitHub Actions**. The workflow in `.github/workflows/pages.yml` deploys on every push to `main`.
