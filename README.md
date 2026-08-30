# Personal CV Website

Static bilingual resume website for Dmitriy Bardin. The site is built with HTML, CSS, and vanilla JavaScript, so it can be deployed directly to GitHub Pages.

## Structure

- `index.html` — semantic markup and fallback Russian content.
- `styles/main.css` — design tokens, responsive layout, cards, navigation, and interaction states.
- `scripts/translations.js` — Russian and English site copy.
- `scripts/main.js` — language switching, CV download switching, mobile menu, active navigation, scroll progress, and reveal animations.
- `assets/images` — optimized profile images and favicon.
- `assets/docs` — current Russian and English PDF resumes.

## Local Preview

Open `index.html` directly in a browser, or run a small local server:

```bash
python3 -m http.server 8080
```

Russian version: `http://localhost:8080/`

English version: `http://localhost:8080/?lang=en`

## GitHub Pages

1. Push the project files to a GitHub repository.
2. Open repository settings and go to `Pages`.
3. Choose deployment from the `main` branch and the repository root.
4. Save the settings and wait for the Pages URL to become available.
