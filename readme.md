# av0 — Software Developer

A Nothing-inspired portfolio for av0, built with React, TypeScript, Vite, and Three.js. Dot-matrix typography, monochrome product panels, and an original interactive hardware sculpture give the site its industrial visual language. The site is fully static and deploys to GitHub Pages.

## Local development

Use Node.js 22 or newer.

```bash
npm install
npm run dev
```

Vite prints the local development URL in the terminal.

## Production build

```bash
npm run build
```

The optimized static site is written to `dist/`. Vite uses `base: './'`, so generated asset URLs remain relative and work from a GitHub Pages repository subpath as well as the `av0.dev` custom domain.

Run the complete local verification pass with:

```bash
npm run check
```

This runs TypeScript validation, the token contrast audit, and a fresh production build.

To check the production build under a repository subpath, run `npm run preview:subpath` and open `http://127.0.0.1:4180/portfolio/`.

## Interactive 3D

`src/components/SystemSculpture.tsx` constructs the hero entirely from procedural Three.js geometry. Drag horizontally on touch, drag with a mouse, or focus the model and use arrow keys to rotate it. **Explode view** separates its interface, logic, and infrastructure layers. **Pause** stops idle motion; **Reset view** (or Home while focused) restores the camera-facing orientation.

Three.js loads in a separate JavaScript chunk. No model server, CDN, API keys, or backend are required. A static SVG preview is displayed while loading and when WebGL is unavailable. Rendering pauses outside the viewport and in hidden tabs, pixel density is capped, and reduced-motion preferences disable ambient animation. A reduced-motion visitor can still manipulate the model and its layers directly.

## Deploying to GitHub Pages

1. Push to either the current `old` branch or a future `main` branch, or run the **Deploy to GitHub Pages** workflow manually from the Actions tab.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. The workflow installs locked dependencies with `npm ci`, builds the site, uploads `dist/`, and deploys it to the `github-pages` environment.

The custom domain is stored in `public/CNAME`. Vite copies it into the production build automatically. Keep the domain's DNS records pointed at GitHub Pages for `https://av0.dev` to remain active.

## Content and visual assets

- Display typography uses the self-hosted, OFL-licensed Doto variable font as a legally reusable Nothing-inspired treatment. Its license is included at `public/fonts/Doto-OFL.txt`; compact interface copy continues to use the system font stack for readability.
- `output/playwright/excrow-current.png` is an authorized capture of the public Excrow homepage and is bundled by Vite into the project showcase.
- FreqX does not currently publish an interface screenshot, so the site uses a clearly described product visualization based on its documented soundboard, hotkey, mixer, and routing features. Replace it with a real app capture when one is available.
- `public/social-preview.png` is the 1200×630 Open Graph image used by social platforms.
- No public email address is configured. The contact section intentionally links to GitHub without inventing an address.
