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

  function renderPosts(data) {
    const root = document.querySelector("[data-posts-root]");
    if (!root || !data) {
      return;
    }

    const projects = Array.isArray(data.projects) ? data.projects : [];
    const blogPosts = Array.isArray(data.blogPosts) ? data.blogPosts : [];
    const parseIsoDate = getDateParser();
    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
    const projectById = new Map(projects.map((project) => [project.id, project]));

    function dateTime(value) {
      const time = parseIsoDate(value).getTime();
      return Number.isFinite(time) ? time : null;
    }

    const projectItems = projects.map((project, index) => ({
      type: "Project Deep Dive",
      title: project.title,
      summary: project.tagline,
      href: "project.html?id=" + encodeURIComponent(project.id),
      image: project.iconOverlay,
      imageAlt: project.iconOverlayAlt || project.title + " project image",
      sortTime: dateTime(project.date) || Date.UTC(2026, 0, 1) - index * 60000,
      sourceIndex: index
    }));

    const blogItems = blogPosts.map((post, index) => {
      const relatedProject = projectById.get(post.relatedProject);
      return {
        type: "Blog Post",
        title: post.title,
        summary: post.excerpt,
        href: "blog.html#" + encodeURIComponent(post.id),
        image: relatedProject ? relatedProject.iconOverlay : "",
        imageAlt: relatedProject ? relatedProject.iconOverlayAlt || relatedProject.title + " project image" : "",
        date: post.date,
        sortTime: dateTime(post.date) || Date.UTC(2025, 0, 1) - index * 60000,
        sourceIndex: projects.length + index
      };
    });

    root.innerHTML = "";

    if (projects.length === 0 && blogPosts.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      placeholder.setAttribute("data-reveal", "");
      placeholder.textContent = "Posts are temporarily unavailable while content loads. Refresh to try again.";
      root.appendChild(placeholder);
      return;
    }

    projectItems
      .concat(blogItems)
      .sort((a, b) => b.sortTime - a.sortTime || a.sourceIndex - b.sourceIndex)
      .slice(0, 8)
      .forEach((item) => {
        const card = document.createElement("a");
        card.className = "post-showcase-card";
        card.setAttribute("data-reveal", "");
        card.href = item.href;
        card.setAttribute("aria-label", "Open " + item.title);

        if (item.image) {
          card.classList.add("post-showcase-card-has-image");
          const cardOverlay = document.createElement("img");
          cardOverlay.className = "post-showcase-card-image";
          cardOverlay.src = item.image;
          cardOverlay.alt = item.imageAlt || "";
          cardOverlay.loading = "lazy";
          card.appendChild(cardOverlay);
        } else {
          card.classList.add("post-showcase-card-no-image");
        }

        const content = document.createElement("div");
        content.className = "post-showcase-card-content";

        const label = document.createElement("span");
        label.className = "post-card-label";
        label.textContent = item.date ? item.type + " / " + formatter.format(parseIsoDate(item.date)) : item.type;

        const title = document.createElement("h3");
        title.textContent = item.title;

        const summary = document.createElement("p");
        summary.textContent = item.summary;

        content.appendChild(label);
        content.appendChild(title);
        content.appendChild(summary);
        card.appendChild(content);
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
    renderPosts(data);
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
