# Personal site

Astro 7 static site: landing page, projects and notes.

## Commands

| Command | Action |
| --- | --- |
| `npm run dev` | Start the local server at http://localhost:4321 (runs in the background) |
| `npx astro dev stop` | Stop the local server |
| `npm run build` | Build the site into `dist/` |
| `npm run preview` | Serve `dist/` to check the production build |

## Where things are

| Path | Content |
| --- | --- |
| `src/site.ts` | Name, role, photo and header links |
| `src/pages/index.astro` | Landing page and bio text |
| `src/content/notes/<topic>/*.md` | Notes. The folder name is the topic |
| `src/content/projects/*.md` | Projects. `featured: true` shows the project on the home page |
| `src/content/travel/*.md` | Travel posts. `coords: [lat, lon]` places the pin; photos go in a folder next to the post |
| `src/content/places/places.yaml` | Map pins without a post. Photos for a pin go in `src/content/places/<id>/` |
| `src/content/books/*.md` | Bookshelf. See `_how-to-add-a-book.md` for the fields |
| `src/components/SlamField.astro` | Animated SLAM header background |
| `src/components/WorldMap.astro`, `Globe.astro` | Travel map and post globe, drawn at build time |
| `src/styles/global.css` | Colors, fonts and shared styles |
| `figures/` | TikZ sources for diagrams. `figures/figures.txt` maps each source to its SVG in `public/` |
| `scripts/tikz2svg.py` | Builds the SVGs. Colors follow the site palette in light and dark mode |

`katex` is pinned to the version that `rehype-katex` uses. If you upgrade one, upgrade the other, or the math renders incorrectly.

If the dev server keeps showing old content after a change to `src/content.config.ts`, clear its caches and restart:

```sh
npx astro dev stop && rm -rf node_modules/.vite node_modules/.astro && npm run dev
```

## Writing and publishing notes

Create a `.md` or `.mdx` file in `src/content/notes/<topic>/`. The folder name determines the topic. Start an unpublished note with:

```yaml
---
title: My note
order: 1
draft: true
---
```

`draft: true` keeps the file in the project but excludes it from the homepage, notes index, topic navigation, and generated note pages (including direct URLs). Drafts are also hidden in the local dev server.

When ready to publish, change it to `draft: false` or remove the field, then rebuild and deploy. Notes without a `draft` field are published by default. To unpublish an existing note, set `draft: true` and rebuild and deploy.

Optional fields include `description`, `updated` (YYYY-MM-DD), and `order`. Within each topic, lower `order` values appear first, with ties sorted by title. Filenames beginning with `_` are excluded from the notes collection entirely.

## Figures

Draw diagrams in TikZ and add a line to `figures/figures.txt`. Then build them:

```sh
python3 scripts/tikz2svg.py            # all figures
python3 scripts/tikz2svg.py gc-        # only sources whose path contains "gc-"
```

The script needs `tectonic` and `pdftocairo` (poppler). Use the palette colors (`1A1D21`, `646A72`, `0D9488`, `E05A47`) or the standard xcolor names (`blue`, `green`, `purple`, `yellow`, `orange`, `red`, `gray`), with tints such as `green!20` or shades such as `red!80!black`. The script maps each one to its dark-mode value. Reference the result as an `.svg` image.

## Publishing

The Astro project lives on the `source` branch. GitHub Pages serves the built site from `main`.

After committing changes on `source`, run `npm run deploy`. This builds the site, pushes the source, and publishes the generated files to `main` using the personal `github.com-julius` SSH identity. Git history is preserved on both branches.

Draft notes are excluded from the built website; their source files are still visible in this public repository.
