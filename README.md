# Continia Brand Hub

The Continia brand guidelines 2.0 as a website that anyone at Continia can browse and search.

**Live:** https://anchcontinia.github.io/Continia-brand-hub/

## What's inside

- `index.html` is a single page with a left sidebar (logo, search, chapter menu) and the content on the right.
- `Assets/css/hub.css` holds the styles. Its tokens match the Continia 3.0 front-end design system used in [new-web](https://github.com/AnchContinia/new-web).
- `Assets/js/hub.js` handles the menu, scrollspy, search (press `/`), click-to-copy colors and the image lightbox.
- `Assets/guide/` contains pages rendered from the PDF guide and used as examples.
- `Assets/logos/` and `Assets/brand/` contain downloadable logo and 5th element SVGs.
- `Assets/fonts/` contains the Alliance No.2 webfont.
- `Assets/Continia_BrandGuide_2.0_compressed.pdf` is the source guide.

## Deploy

On every push to `main`, the `.github/workflows/static.yml` workflow deploys the repository to GitHub Pages.

## Local preview

```sh
python3 -m http.server 8000
# open http://localhost:8000
```
