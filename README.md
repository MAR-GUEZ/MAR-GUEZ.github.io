# Portfolio (GitHub Pages)

Static portfolio site: **featured projects** (JSON) + **all public repositories** (GitHub API). No build step — push to GitHub and enable Pages.

**Languages:** English (`/en/`) and Spanish (`/es/`). The root URL redirects to a preferred locale (saved choice, or browser language).

## Quick start

1. **Set your GitHub username** in both [`content/en/profile.json`](content/en/profile.json) and [`content/es/profile.json`](content/es/profile.json) (`githubUsername`).
2. **Edit your story** in each locale’s `profile.json`: `name`, `tagline`, `intro`, `about`, `contact`, `links`, `techStack`.
3. **Curate featured projects** in [`content/en/featured-projects.json`](content/en/featured-projects.json) and the Spanish twin under `content/es/`.
4. **UI chrome strings** (nav labels, badges, repo messages) live in `content/{locale}/ui.json`.
5. Open `en/index.html` or `es/index.html` via a static server to preview (or open the root `index.html` to test the redirect).

## Languages

| Route | Language |
|-------|----------|
| `/` | Redirects to `/en/` or `/es/` |
| `/en/` | English |
| `/es/` | Español |

The header **EN | ES** control switches locale and keeps the current hash (e.g. `#featured`). Preference is stored in `localStorage` (`portfolio-lang`).

## Tech stack (`profile.json` → `techStack`)

Array of groups. Each group:

| Field | Description |
|-------|-------------|
| `heading` | Section label (e.g. "Backend & AI"). |
| `items` | List of `{ "label", "emoji"?, "icon"?, "iconUrl"?, "fallback"? }`. |

Each **item** (first match wins):

- **`emoji`**: optional string shown in the tile instead of an image (e.g. `"🦞"` for OpenClaw). If set, **`icon`**, **`iconUrl`**, and **`fallback`** are ignored for display.
- **`icon`**: filename slug for Simple Icons (e.g. `python`, `hubspot`). SVG URL: `https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/{slug}.svg`.
- **`iconUrl`**: optional full URL to any SVG/PNG when there is no Simple Icons entry. If both `icon` and `iconUrl` are set, `iconUrl` wins.
- **`fallback`**: short text for a **text-only** tile when you have no `emoji`, `icon`, or `iconUrl`, or as the **error fallback** if an image fails to load.

## Featured project fields

| Field | Description |
|-------|-------------|
| `id` | Stable slug (for your reference). |
| `title` | Project name. |
| `role` | Optional. Your contribution (e.g. “Backend integrations”, “Solo maintainer”). |
| `summary` | Short description (no employer names required). |
| `tech` | Array of technology labels. |
| `accent` | Emoji or symbol shown on the card. |
| `repoAccess` | `"public"` \| `"private"` \| `"none"`. |
| `repoUrl` | Public GitHub repo URL (only used when `repoAccess` is `"public"`). |
| `githubRepo` | e.g. `username/repo` — if set, that repo is **hidden** from the auto list below to avoid duplicates. |
| `demoUrl` | Optional public URL (demo, staging, or production site). |
| `demoLabel` | Optional link text for `demoUrl` (e.g. `"Live site"`, `"Production"`). Defaults to **Live demo** / **Demo en vivo** when omitted. |
| `caseStudyUrl` | Optional write-up / external page. |

**Private repos:** use `repoAccess: "private"`. The site shows a private-repo badge and **does not** link to the repo (so visitors are not sent to a 404 / access denied page).

**No repo:** use `repoAccess: "none"` (optional `demoUrl` / `caseStudyUrl`).

## Repository list (API)

- Data comes from `GET https://api.github.com/users/{username}/repos` (paginated, up to 20 pages).
- Configure defaults in each locale’s `profile.json` → `repoList`:
  - `hideForks` (default `true`)
  - `hideArchived` (default `false`)
  - `perPage` (max 100)

Unauthenticated requests are subject to GitHub’s **rate limit**. If the list fails, featured projects still work.

## GitHub Pages

### User site (recommended for `https://username.github.io/`)

1. Create a repo named **`username.github.io`** (replace `username` with your GitHub username).
2. Push this repo’s files to the **default branch** (often `main`).
3. Repo **Settings → Pages → Build and deployment → Source**: **Deploy from a branch**, branch **main**, folder **`/` (root)**.
4. After a minute, open `https://username.github.io/` (redirects to `/en/` or `/es/`).

### Project site

If the site lives in another repo (e.g. `portfolio`), use Pages from that repo’s root; the URL will be `https://username.github.io/portfolio/` (with `/en/` and `/es/` under that base).

## Files

| File | Role |
|------|------|
| `index.html` | Locale redirect |
| `en/index.html` / `es/index.html` | Locale page shells + language switcher |
| `styles.css` | Layout and theme (light/dark + language control) |
| `app.js` | Locale detection, profile/featured render, GitHub fetch |
| `content/en/*` / `content/es/*` | Profile, featured projects, UI strings |
| `content/assets/` | Shared images |
| `MAR-CV.md` | Short CV note / source line |

## Source CV

See [`MAR-CV.md`](MAR-CV.md) for the one-line CV reference; expand each locale’s `profile.json` for the narrative shown on the site.
