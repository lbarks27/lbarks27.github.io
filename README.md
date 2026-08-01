# Liam Barkley Portfolio (GitHub Pages)

Static portfolio site with a SpaceX-inspired visual direction.

## Includes
- Homepage with `Projects`, `Gallery`, `Resume`, and `Contact`
- Individual project pages via `project.html?id=<project-id>`
- Editable content files in `content/projects/`

## Quick edit checklist
1. Update your real links in `content/site.json`:
   - `owner.email`
   - `owner.github`
   - `owner.youtube`
   - `owner.x`
   - `owner.instagram`
2. Add your resume PDF to:
   - `assets/resume/Liam_Barkley_Resume.pdf`
3. Edit project files in `content/projects/*.md`:
   - front matter for metadata like `github`, `photos`, `videos`, `datasets`
   - `## Overview`
   - `## Solver Deep Dive`
   - `## Data and Results`
4. Add or remove filenames in `content/projects/index.json` when you add or delete entries.
5. Add local media to `assets/images/` and reference paths in project front matter.

## Local preview
Run from this folder:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Deploy to GitHub Pages
1. Create a new GitHub repo.
2. Push this folder to the repo root.
3. In GitHub repo settings:
   - Open `Pages`
   - Source: `Deploy from a branch`
   - Branch: `main` (or `master`) and `/ (root)`
4. Wait for build, then open the provided `*.github.io` URL.

## Optional custom domain
After you buy a domain, add a `CNAME` file in the repo root and configure DNS with your registrar.
