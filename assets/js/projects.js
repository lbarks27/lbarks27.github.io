(function () {
  function getUtils() {
    const defaults = {
      parseIsoDate: function (value) {
        return new Date(value);
      },
      renderMarkdown: function (value) {
        return String(value || "");
      }
    };

    return Object.assign(defaults, window.PORTFOLIO_UTILS || {});
  }

  function installRevealFallback() {
    return;
  }

  async function init() {
    const data = await window.PORTFOLIO_DATA_READY;
    const root = document.querySelector("[data-projects-root]");
    if (!root || !data) {
      return;
    }

    const utils = getUtils();
    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    const projects = Array.isArray(data.projects) ? data.projects : [];

    const items = projects.map((project, index) => ({
      id: project.id,
      type: "Project Deep Dive",
      title: project.title,
      excerpt: project.tagline,
      href: "project.html?id=" + encodeURIComponent(project.id),
      tags: [],
      content: "",
      image: project.iconOverlay,
      imageAlt: project.iconOverlayAlt || project.title + " project image",
      date: project.date || null,
      sortTime: project.date ? utils.parseIsoDate(project.date).getTime() : (Date.UTC(2026, 0, 1) - index * 60000),
      sourceIndex: index
    }));

    // Sort: dated first (newest), then by original index order for undated
    items.sort((a, b) => {
      const ta = a.sortTime || 0;
      const tb = b.sortTime || 0;
      if (ta !== tb) return tb - ta;
      return a.sourceIndex - b.sourceIndex;
    });

    root.innerHTML = "";

    if (items.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      placeholder.setAttribute("data-reveal", "");
      placeholder.textContent = "Projects are temporarily unavailable while content loads. Refresh to try again.";
      root.appendChild(placeholder);

      if (window.installRevealAnimationsFromDynamicContent) {
        window.installRevealAnimationsFromDynamicContent();
      } else {
        installRevealFallback();
      }
      return;
    }

    items.forEach((item) => {
      const article = document.createElement("article");
      article.className = "blog-row";
      article.setAttribute("id", "project-" + item.id);
      article.setAttribute("data-reveal", "");

      if (item.image) {
        const imageUrl = new URL(item.image, window.location.href).href;
        article.classList.add("blog-row-has-image");
        article.style.setProperty("--blog-row-image", 'url("' + imageUrl.replace(/"/g, '\\"') + '")');
        article.setAttribute("aria-label", item.imageAlt ? item.title + " / " + item.imageAlt : item.title);
      }

      const meta = document.createElement("p");
      meta.className = "blog-meta";
      meta.textContent = item.date ? item.type + " / " + formatter.format(utils.parseIsoDate(item.date)) : item.type;

      const title = document.createElement("h2");
      title.textContent = item.title;

      const excerpt = document.createElement("p");
      excerpt.textContent = item.excerpt;

      article.appendChild(meta);
      article.appendChild(title);
      article.appendChild(excerpt);

      const link = document.createElement("a");
      link.className = "back-link";
      link.href = item.href;
      link.textContent = "Open project deep dive";
      article.appendChild(link);

      root.appendChild(article);
    });

    if (window.installRevealAnimationsFromDynamicContent) {
      window.installRevealAnimationsFromDynamicContent();
    } else {
      installRevealFallback();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
