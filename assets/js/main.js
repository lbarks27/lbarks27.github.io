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

    document.querySelectorAll("[data-owner-email]").forEach((node) => {
      node.textContent = data.owner.email;
      if (node.tagName.toLowerCase() === "a") {
        node.setAttribute("href", "mailto:" + data.owner.email);
      }
    });

    document.querySelectorAll("[data-owner-email-link]").forEach((node) => {
      node.setAttribute("href", "mailto:" + data.owner.email);
    });

    document.querySelectorAll("[data-owner-github]").forEach((node) => {
      node.textContent = data.owner.github;
      if (node.tagName.toLowerCase() === "a") {
        node.setAttribute("href", data.owner.github);
      }
    });

    document.querySelectorAll("[data-owner-github-link]").forEach((node) => {
      node.setAttribute("href", data.owner.github);
    });

    document.querySelectorAll("[data-owner-youtube]").forEach((node) => {
      if (!data.owner.youtube) {
        return;
      }

      node.textContent = data.owner.youtube;
      if (node.tagName.toLowerCase() === "a") {
        node.setAttribute("href", data.owner.youtube);
      }
    });

    document.querySelectorAll("[data-owner-youtube-link]").forEach((node) => {
      if (data.owner.youtube) {
        node.setAttribute("href", data.owner.youtube);
      }
    });
  }

  function installContactForm(data) {
    const form = document.querySelector("[data-contact-form]");
    if (!form) {
      return;
    }

    const status = document.querySelector("[data-contact-form-status]");
    const recipient = data && data.owner && data.owner.email ? data.owner.email : "";

    if (recipient) {
      form.setAttribute("action", "mailto:" + recipient);
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();

      if (typeof form.reportValidity === "function" && !form.reportValidity()) {
        return;
      }

      if (!recipient) {
        if (status) {
          status.textContent = "Email address is unavailable.";
        }
        return;
      }

      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const subject = String(formData.get("subject") || "").trim() || "Portfolio contact";
      const message = String(formData.get("message") || "").trim();
      const bodyLines = [];

      if (name) {
        bodyLines.push("Name: " + name);
      }

      if (email) {
        bodyLines.push("Email: " + email);
      }

      if (bodyLines.length > 0) {
        bodyLines.push("");
      }

      bodyLines.push(message);

      if (status) {
        status.textContent = "Opening email draft...";
      }

      window.location.href =
        "mailto:" + recipient + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(bodyLines.join("\n"));
    });
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
      const image = post.image || (relatedProject ? relatedProject.iconOverlay : "");
      const imageAlt =
        post.imageAlt || (relatedProject ? relatedProject.iconOverlayAlt || relatedProject.title + " project image" : "");
      return {
        type: "Update",
        title: post.title,
        summary: post.excerpt,
        href: "blog.html#" + encodeURIComponent(post.id),
        image: image,
        imageAlt: imageAlt,
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
      placeholder.textContent = "Content is temporarily unavailable while content loads. Refresh to try again.";
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
      const closeNav = function () {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      };

      toggle.addEventListener("click", function () {
        const isOpen = nav.classList.toggle("open");
        toggle.setAttribute("aria-expanded", String(isOpen));
      });

      nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", function () {
          closeNav();
        });
      });
    }
  }

  function highlightCurrentNav() {
    const nav = document.querySelector("[data-nav-links]");
    if (!nav) return;

    const links = nav.querySelectorAll("a");
    const path = window.location.pathname.toLowerCase();
    const file = path.split("/").pop() || "index.html";

    let target = null;

    if (file === "blog.html") {
      target = "blog.html";
    } else if (file === "projects.html" || file === "project.html") {
      target = "projects.html";
    } else if (file === "gallery.html") {
      target = "gallery.html";
    } else if (file === "resume.html") {
      target = "resume.html";
    } else if (file === "contact.html") {
      target = "contact.html";
    }

    if (!target) return; // home or unknown: no nav item active

    links.forEach((link) => {
      const href = (link.getAttribute("href") || "").toLowerCase();
      if (href === target || href.endsWith("/" + target)) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  }

  function installRevealAnimations() {
    return;
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
    highlightCurrentNav();
    installContactForm(data);
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
