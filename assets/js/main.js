(function () {
  function getDateParser() {
    if (window.PORTFOLIO_UTILS && typeof window.PORTFOLIO_UTILS.parseIsoDate === "function") {
      return window.PORTFOLIO_UTILS.parseIsoDate;
    }

    return function (value) {
      return new Date(value);
    };
  }

  function setOwnerFields(data) {
    if (!data || !data.owner) {
      return;
    }

    document.querySelectorAll("[data-owner-name]").forEach((node) => {
      node.textContent = data.owner.name;
    });

    const emailLink = document.querySelector("[data-owner-email]");
    if (emailLink) {
      emailLink.textContent = data.owner.email;
      emailLink.setAttribute("href", "mailto:" + data.owner.email);
    }

    const githubLink = document.querySelector("[data-owner-github]");
    if (githubLink) {
      githubLink.textContent = data.owner.github;
      githubLink.setAttribute("href", data.owner.github);
    }

    const youtubeLink = document.querySelector("[data-owner-youtube]");
    if (youtubeLink && data.owner.youtube) {
      youtubeLink.textContent = data.owner.youtube;
      youtubeLink.setAttribute("href", data.owner.youtube);
    }
  }

  function renderProjects(data) {
    const root = document.querySelector("[data-projects-root]");
    if (!root || !data || !Array.isArray(data.projects)) {
      return;
    }

    root.innerHTML = "";

    if (data.projects.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      placeholder.setAttribute("data-reveal", "");
      placeholder.textContent = "Projects are temporarily unavailable while content loads. Refresh to try again.";
      root.appendChild(placeholder);
      return;
    }

    data.projects.forEach((project) => {
      const card = document.createElement("a");
      card.className = "project-card";
      card.setAttribute("data-reveal", "");
      card.href = "project.html?id=" + encodeURIComponent(project.id);
      card.setAttribute("aria-label", "Open " + project.title + " project page");

      if (project.iconOverlay) {
        card.classList.add("project-card-has-overlay");
        const cardOverlay = document.createElement("img");
        cardOverlay.className = "project-card-overlay";
        cardOverlay.src = project.iconOverlay;
        cardOverlay.alt = project.iconOverlayAlt || project.title + " project image";
        cardOverlay.loading = "lazy";
        card.appendChild(cardOverlay);
      }

      const content = document.createElement("div");
      content.className = "project-card-content";

      const title = document.createElement("h3");
      title.textContent = project.title;

      const summary = document.createElement("p");
      summary.textContent = project.tagline;

      content.appendChild(title);
      content.appendChild(summary);
      card.appendChild(content);
      root.appendChild(card);
    });
  }

  function renderBlogPreview(data) {
    const root = document.querySelector("[data-blog-preview-root]");
    if (!root || !data || !Array.isArray(data.blogPosts)) {
      return;
    }

    const parseIsoDate = getDateParser();
    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    const posts = data.blogPosts
      .slice()
      .sort((a, b) => parseIsoDate(b.date).getTime() - parseIsoDate(a.date).getTime())
      .slice(0, 3);

    root.innerHTML = "";

    if (posts.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      placeholder.setAttribute("data-reveal", "");
      placeholder.textContent = "Blog posts are temporarily unavailable while content loads. Refresh to try again.";
      root.appendChild(placeholder);
      return;
    }

    posts.forEach((post) => {
      const card = document.createElement("article");
      card.className = "blog-card";
      card.setAttribute("data-reveal", "");

      const meta = document.createElement("p");
      meta.className = "blog-meta";
      meta.textContent = formatter.format(parseIsoDate(post.date));

      const title = document.createElement("h3");
      title.textContent = post.title;

      const excerpt = document.createElement("p");
      excerpt.textContent = post.excerpt;

      const tagRow = document.createElement("div");
      tagRow.className = "tags";
      (post.tags || []).forEach((tag) => {
        const tagNode = document.createElement("span");
        tagNode.className = "tag";
        tagNode.textContent = tag;
        tagRow.appendChild(tagNode);
      });

      card.appendChild(meta);
      card.appendChild(title);
      card.appendChild(excerpt);
      card.appendChild(tagRow);
      root.appendChild(card);
    });
  }

  function installHeaderBehavior() {
    const header = document.querySelector(".site-header");
    const toggle = document.querySelector("[data-menu-toggle]");
    const nav = document.querySelector("[data-nav-links]");

    if (header) {
      const updateHeader = function () {
        if (window.scrollY > 8) {
          header.classList.add("scrolled");
        } else {
          header.classList.remove("scrolled");
        }
      };
      updateHeader();
      window.addEventListener("scroll", updateHeader, { passive: true });
    }

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("open");
      });

      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", function () {
          nav.classList.remove("open");
        });
      });
    }
  }

  function installRevealAnimations() {
    const items = Array.from(document.querySelectorAll("[data-reveal]"));
    if (items.length === 0) {
      return;
    }

    if (!("IntersectionObserver" in window)) {
      items.forEach((item) => item.classList.add("revealed"));
      return;
    }

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -40px 0px"
      }
    );

    items.forEach((item, index) => {
      item.style.transitionDelay = Math.min(index * 30, 240) + "ms";
      observer.observe(item);
    });
  }

  function installBackgroundParallax() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const root = document.documentElement;
    const footer = document.querySelector(".site-footer");
    let ticking = false;

    function updateParallax() {
      let effectiveScroll = window.scrollY;

      if (footer) {
        const footerTop = footer.offsetTop;
        const stopScroll = Math.max(footerTop - window.innerHeight, 0);
        effectiveScroll = Math.min(window.scrollY, stopScroll);
      }

      const offset = 50 + effectiveScroll * 0.018;
      root.style.setProperty("--bg-image-y", offset.toFixed(2) + "%");
      ticking = false;
    }

    function onScroll() {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(updateParallax);
    }

    updateParallax();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  function setYear() {
    const target = document.querySelector("[data-year]");
    if (target) {
      target.textContent = String(new Date().getFullYear());
    }
  }

  window.installRevealAnimationsFromProjectPage = installRevealAnimations;
  window.installRevealAnimationsFromDynamicContent = installRevealAnimations;

  async function init() {
    const data = await window.PORTFOLIO_DATA_READY;
    setOwnerFields(data);
    renderProjects(data);
    renderBlogPreview(data);
    installHeaderBehavior();
    installRevealAnimations();
    installBackgroundParallax();
    setYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
