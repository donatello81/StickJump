# StickJump

A monochrome browser trampoline game for keyboards and touchscreens. No build step or runtime dependencies. Requires Node.js 18+ to use the included development server.

```sh
npm start
# Open port 3000 in your browser.
npm test
```

You can also serve this directory using any static web server. Set `PORT` to change the development server port.

## Play

- **Left / Right:** hold to rotate backward / forward. Release early to control momentum.
- **Down:** tap just before landing. A fresh press near contact gives the strongest bounce; holding does not keep refreshing the boost.
- **Up:** swim in the direction of the stick-man's nose. Hold for repeated strokes. An upside-down stick-man swims left; an upright one swims right.
- **Space:** start, pause, resume or retry. **P / Escape:** pause or resume.
- The four on-screen buttons support simultaneous touch input.

Land mostly upright and within the trampoline. Missing or crashing ends the run immediately. Bank 250 points per complete rotation and 100 points per metre of peak height on every safe landing. Survive ten landings to finish. Your best score stays on this device when browser storage is available.

Physics runs at a fixed 120 Hz with gravity, angular momentum, wind, air resistance, timed bounce energy and stroke impulses. Height is measured at the feet above the trampoline. This is a playable approximation, not a biomechanical simulation. Flips and height from a failed jump are not banked.

The game pauses when its browser tab loses focus. Sound is optional and off by default. Everything needed for play is local, including system font fallbacks; no external services or credentials are required.

## Play offline — no server needed

Open **StickJump.html** directly in a browser (double-click it on a computer). It includes the game, physics, and styles in a single file and makes no network requests. You can copy or share this file and play without Node.js, installation, or internet access. Some mobile file viewers do not execute JavaScript; use a browser that supports opening local HTML files, or the hosted GitHub Pages version on those devices.

After editing the source files, run `npm run build` to refresh the standalone file. The normal `index.html` uses JavaScript modules and should be opened through a web server; `StickJump.html` is the version for direct file opening. Browser storage for local files varies: gameplay still works when personal-best persistence is unavailable.
