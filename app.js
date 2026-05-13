/**
 * Portfolio app — loads profile + featured JSON, fetches public repos from GitHub API.
 * Configure your username in content/profile.json (githubUsername).
 */

const CONFIG = {
  profilePath: "content/profile.json",
  featuredPath: "content/featured-projects.json",
};

const THEME_KEY = "portfolio-theme";

function getStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY);
  } catch {
    return null;
  }
}

function setStoredTheme(theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* ignore */
  }
}

function initTheme() {
  const stored = getStoredTheme();
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const theme = stored || (prefersDark ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);

  const btn = document.querySelector(".theme-toggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const next = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    setStoredTheme(next);
  });
}

async function fetchJson(url) {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function applyProfile(profile) {
  const setText = (sel, text) => {
    const el = document.querySelector(sel);
    if (el && text != null) el.textContent = text;
  };

  setText('[data-profile="name"]', profile.name);
  setText('[data-profile="tagline"]', profile.tagline);
  setText('[data-profile="intro"]', profile.intro);
  setText('[data-profile="name-footer"]', profile.name);
  document.title = `${profile.name || "Portfolio"} — Portfolio`;

  const aboutEl = document.querySelector('[data-profile="about"]');
  if (aboutEl && Array.isArray(profile.about)) {
    aboutEl.innerHTML = profile.about.map((p) => `<p>${escapeHtml(p)}</p>`).join("");
  } else if (aboutEl && typeof profile.about === "string") {
    aboutEl.innerHTML = `<p>${escapeHtml(profile.about)}</p>`;
  }

  const contactEl = document.querySelector('[data-profile="contact"]');
  if (contactEl) contactEl.textContent = profile.contact || "";

  const links = Array.isArray(profile.links) ? profile.links : [];
  const heroLinks = document.querySelector('[data-profile="links"]');
  if (heroLinks) {
    if (links.length) {
      heroLinks.hidden = false;
      heroLinks.innerHTML = links
        .map(
          (l) =>
            `<li><a href="${escapeHtml(l.href)}" rel="noopener noreferrer" target="_blank">${escapeHtml(l.label)}</a></li>`
        )
        .join("");
    } else {
      heroLinks.hidden = true;
    }
  }

  const contactLinks = document.querySelector('[data-profile="contact-links"]');
  if (contactLinks) {
    contactLinks.innerHTML = links
      .map(
        (l) =>
          `<a href="${escapeHtml(l.href)}" rel="noopener noreferrer" target="_blank">${escapeHtml(l.label)}</a>`
      )
      .join("");
  }

  renderTechStack(profile.techStack);

  return profile;
}

const SIMPLE_ICONS_PKG = "simple-icons@v13";

/** SVG icon from Simple Icons (same filenames as https://github.com/simple-icons/simple-icons/tree/develop/icons). */
function simpleIconSrc(slug) {
  const s = String(slug || "")
    .trim()
    .toLowerCase();
  return `https://cdn.jsdelivr.net/npm/${SIMPLE_ICONS_PKG}/icons/${encodeURIComponent(s)}.svg`;
}

function renderTechStack(techStack) {
  const root = document.querySelector('[data-profile="tech-stack"]');
  if (!root) return;

  const groups = Array.isArray(techStack) ? techStack : [];
  if (!groups.length) {
    root.innerHTML = `<p class="section__subtitle">Add a <code>techStack</code> array to <code>content/profile.json</code> to show tools here.</p>`;
    return;
  }

  root.innerHTML = groups
    .map((group) => {
      const heading = escapeHtml(group.heading || "");
      const items = Array.isArray(group.items) ? group.items : [];
      const tiles = items
        .map((item) => {
          const label = item.label || "";
          const title = escapeHtml(label);
          const fb = item.fallback != null ? String(item.fallback).trim() : "";
          const slug = item.icon != null ? String(item.icon).trim() : "";
          const customUrl = item.iconUrl != null ? String(item.iconUrl).trim() : "";
          const emojiRaw = item.emoji != null ? String(item.emoji).trim() : "";
          const emoji = emojiRaw.replace(/^["']|["']$/g, "");

          if (emoji) {
            return `
              <div class="tech-tile tech-tile--emoji" title="${title}">
                <span class="tech-tile__icon-wrap tech-tile__icon-wrap--emoji" aria-hidden="true">${escapeHtml(emoji)}</span>
                <span class="tech-tile__label">${escapeHtml(label)}</span>
              </div>`;
          }

          if (slug || customUrl) {
            const src = customUrl || simpleIconSrc(slug);
            const safeSrc = escapeHtml(src);
            const abbrev = (label.slice(0, 2) || "?").toUpperCase();
            const dataFallback = escapeHtml(fb || abbrev);
            return `
              <div class="tech-tile" title="${title}">
                <span class="tech-tile__icon-wrap">
                  <img
                    class="tech-tile__img"
                    src="${safeSrc}"
                    alt=""
                    width="40"
                    height="40"
                    loading="lazy"
                    decoding="async"
                    data-fallback="${dataFallback}"
                  />
                  <span class="tech-tile__glyph tech-tile__glyph--fallback" hidden aria-hidden="true"></span>
                </span>
                <span class="tech-tile__label">${escapeHtml(label)}</span>
              </div>`;
          }

          if (fb) {
            return `
              <div class="tech-tile tech-tile--fallback" title="${title}">
                <span class="tech-tile__glyph" aria-hidden="true">${escapeHtml(fb)}</span>
                <span class="tech-tile__label">${escapeHtml(label)}</span>
              </div>`;
          }

          return `
            <div class="tech-tile tech-tile--fallback" title="${title}">
              <span class="tech-tile__glyph" aria-hidden="true">?</span>
              <span class="tech-tile__label">${escapeHtml(label)}</span>
            </div>`;
        })
        .join("");

      return `
        <section class="tech-stack-group" aria-label="${heading}">
          <h3 class="tech-stack-group__title">${heading}</h3>
          <div class="tech-stack-group__tiles">${tiles}</div>
        </section>`;
    })
    .join("");

  root.querySelectorAll(".tech-tile__img").forEach((img) => {
    const fallbackText = img.getAttribute("data-fallback") || "?";
    img.addEventListener("error", () => {
      img.hidden = true;
      const glyph = img.nextElementSibling;
      if (glyph?.classList.contains("tech-tile__glyph--fallback")) {
        glyph.textContent = fallbackText.slice(0, 6);
        glyph.hidden = false;
      }
    });
  });
}

function renderFeatured(projects) {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;

  const validAccess = new Set(["public", "private", "none"]);

  grid.innerHTML = projects
    .map((p) => {
      const access = validAccess.has(p.repoAccess) ? p.repoAccess : "none";
      const badges = [];
      if (access === "private") badges.push('<span class="badge">Private repository</span>');
      if (access === "none") badges.push('<span class="badge badge--muted">No public repo</span>');

      const tech = (p.tech || [])
        .map((t) => `<li><span class="tech-pill">${escapeHtml(t)}</span></li>`)
        .join("");

      const actions = [];
      if (access === "public" && p.repoUrl) {
        actions.push(`<a href="${escapeHtml(p.repoUrl)}" rel="noopener noreferrer" target="_blank">Repository</a>`);
      }
      if (p.demoUrl) {
        const demoLabel =
          typeof p.demoLabel === "string" && p.demoLabel.trim() ? p.demoLabel.trim() : "Live demo";
        actions.push(
          `<a href="${escapeHtml(p.demoUrl)}" rel="noopener noreferrer" target="_blank">${escapeHtml(demoLabel)}</a>`
        );
      }
      if (p.caseStudyUrl) {
        actions.push(
          `<a href="${escapeHtml(p.caseStudyUrl)}" rel="noopener noreferrer" target="_blank">Case study</a>`
        );
      }

      const roleText = typeof p.role === "string" ? p.role.trim() : "";
      const roleBlock = roleText
        ? `<p class="card__role"><span class="card__role-label">Role</span> ${escapeHtml(roleText)}</p>`
        : "";

      return `
        <article class="card">
          <div class="card__top">
            <span class="card__accent" aria-hidden="true">${escapeHtml(p.accent || "·")}</span>
            <div class="card__badges">${badges.join("")}</div>
          </div>
          <h3 class="card__title">${escapeHtml(p.title || "Untitled")}</h3>
          ${roleBlock}
          <p class="card__summary">${escapeHtml(p.summary || "")}</p>
          ${tech ? `<ul class="card__tech">${tech}</ul>` : ""}
          <div class="card__actions">${actions.join("")}</div>
        </article>
      `;
    })
    .join("");
}

function normalizeRepoName(githubRepo) {
  if (!githubRepo || typeof githubRepo !== "string") return null;
  return githubRepo.trim().toLowerCase();
}

async function fetchAllPublicRepos(username, perPage = 100) {
  const all = [];
  let page = 1;
  for (;;) {
    const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=${perPage}&page=${page}&sort=updated`;
    const res = await fetch(url, { headers: { Accept: "application/vnd.github+json" } });
    if (res.status === 403) {
      const err = new Error("rate_limited");
      err.status = 403;
      throw err;
    }
    if (!res.ok) throw new Error(`GitHub API: ${res.status}`);
    const batch = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < perPage) break;
    page += 1;
    if (page > 20) break;
  }
  return all;
}

function filterRepos(repos, options) {
  const { hideForks, hideArchived } = options;
  return repos.filter((r) => {
    if (hideForks && r.fork) return false;
    if (hideArchived && r.archived) return false;
    return true;
  });
}

function formatDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function renderRepos(repos, container, countEl, dedupeNames) {
  const lowerDedupe = new Set((dedupeNames || []).filter(Boolean).map((n) => n.toLowerCase()));

  const visible = repos.filter((r) => !lowerDedupe.has(r.full_name.toLowerCase()));

  const renderList = (list) => {
    if (!list.length) {
      container.innerHTML = `<p class="section__subtitle">No repositories match your filters or search.</p>`;
      if (countEl) countEl.textContent = "0 repositories";
      return;
    }
    container.innerHTML = list
      .map((r) => {
        const desc = r.description ? escapeHtml(r.description) : "";
        const lang = r.language ? escapeHtml(r.language) : "—";
        const stars = r.stargazers_count ?? 0;
        const updated = formatDate(r.pushed_at || r.updated_at);
        const archived = r.archived ? '<span class="badge badge--muted">Archived</span>' : "";
        const fork = r.fork ? '<span class="badge badge--muted">Fork</span>' : "";

        return `
          <a class="repo-row" href="${escapeHtml(r.html_url)}" rel="noopener noreferrer" target="_blank">
            <div class="repo-row__title">
              ${escapeHtml(r.name)}
              ${archived}${fork}
            </div>
            <div class="repo-row__meta">${lang} · ★ ${stars} · Updated ${escapeHtml(updated)}</div>
            ${desc ? `<p class="repo-row__desc">${desc}</p>` : ""}
          </a>
        `;
      })
      .join("");
    if (countEl) countEl.textContent = `${list.length} ${list.length === 1 ? "repository" : "repositories"}`;
  };

  renderList(visible);

  const search = document.getElementById("repo-search");
  if (!search) return;

  const runSearch = () => {
    const q = search.value.trim().toLowerCase();
    if (!q) {
      renderList(visible);
      return;
    }
    const filtered = visible.filter((r) => {
      const name = (r.name || "").toLowerCase();
      const lang = (r.language || "").toLowerCase();
      const desc = (r.description || "").toLowerCase();
      return name.includes(q) || lang.includes(q) || desc.includes(q);
    });
    renderList(filtered);
    if (countEl) {
      countEl.textContent = `${filtered.length} match${filtered.length === 1 ? "" : "es"}`;
    }
  };

  search.addEventListener("input", runSearch);
}

async function main() {
  initTheme();

  let profile;
  try {
    profile = await fetchJson(CONFIG.profilePath);
  } catch (e) {
    console.error(e);
    const st = document.getElementById("repos-status");
    st?.classList.add("repos-status--error");
    if (st) st.textContent = "Could not load profile.json.";
    return;
  }

  applyProfile(profile);

  const username = (profile.githubUsername || "").trim();
  const repoSettings = profile.repoList || {};
  const perPage = Math.min(100, Math.max(1, Number(repoSettings.perPage) || 100));

  let featured = [];
  try {
    featured = await fetchJson(CONFIG.featuredPath);
    if (!Array.isArray(featured)) featured = [];
  } catch (e) {
    console.warn("Featured projects:", e);
  }

  renderFeatured(featured);

  const dedupeNames = featured.map((p) => p.githubRepo).filter(Boolean);

  const statusEl = document.getElementById("repos-status");
  const countEl = document.getElementById("repos-count");
  const listEl = document.getElementById("repos-list");

  if (!username || username === "YOUR_GITHUB_USERNAME") {
    if (statusEl) {
      statusEl.textContent =
        "Set githubUsername in content/profile.json to load your public repositories.";
    }
    if (listEl) {
      listEl.innerHTML = `<p class="section__subtitle">After you set your GitHub username, reload this page.</p>`;
    }
    return;
  }

  if (statusEl) statusEl.textContent = "Loading repositories…";

  try {
    const raw = await fetchAllPublicRepos(username, perPage);
    const filtered = filterRepos(raw, {
      hideForks: repoSettings.hideForks !== false,
      hideArchived: repoSettings.hideArchived === true,
    });

    if (statusEl) statusEl.textContent = "";
    renderRepos(filtered, listEl, countEl, dedupeNames);
  } catch (e) {
    console.error(e);
    if (statusEl) {
      statusEl.classList.add("repos-status--error");
      if (e.message === "rate_limited") {
        statusEl.textContent =
          "GitHub API rate limit reached. Try again in a few minutes, or open this site from a local preview.";
      } else {
        statusEl.textContent = "Could not load repositories. Check the username and your connection.";
      }
    }
    if (listEl) {
      listEl.innerHTML = `<p class="section__subtitle">You can still browse featured projects above.</p>`;
    }
  }
}

main();
