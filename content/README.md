# Content Editing

Portfolio content now lives in `content/projects/` and `content/blog/`.

## Projects
- One file per project in `content/projects/*.md`
- Keep the front matter fields at the top
- Edit the body sections under:
  - `## Overview`
  - `## Solver Deep Dive`
  - `## Data and Results`

## Blog posts
- One file per post in `content/blog/*.md`
- Edit the front matter for metadata like `date`, `tags`, and `relatedProject`
- Write the post body in Markdown below the front matter

## Adding a new entry
1. Create a new Markdown file in the matching folder.
2. Add that filename to `content/projects/index.json` or `content/blog/index.json`.
3. Use an existing file as the template.
