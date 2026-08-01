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

    document.querySelectorAll("[data-owner-x]").forEach((node) => {
      if (!data.owner.x) {
        return;
      }

      node.textContent = data.owner.x;
      if (node.tagName.toLowerCase() === "a") {
        node.setAttribute("href", data.owner.x);
      }
    });

    document.querySelectorAll("[data-owner-x-link]").forEach((node) => {
      if (data.owner.x) {
        node.setAttribute("href", data.owner.x);
      }
    });

    document.querySelectorAll("[data-owner-instagram]").forEach((node) => {
      if (!data.owner.instagram) {
        return;
      }

      node.textContent = data.owner.instagram;
      if (node.tagName.toLowerCase() === "a") {
        node.setAttribute("href", data.owner.instagram);
      }
    });

    document.querySelectorAll("[data-owner-instagram-link]").forEach((node) => {
      if (data.owner.instagram) {
        node.setAttribute("href", data.owner.instagram);
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
    const parseIsoDate = getDateParser();
    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

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

    root.innerHTML = "";

    if (projects.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      placeholder.setAttribute("data-reveal", "");
      placeholder.textContent = "Content is temporarily unavailable while content loads. Refresh to try again.";
      root.appendChild(placeholder);
      return;
    }

    projectItems
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
      let lastScrollY = window.scrollY;

      const updateHeader = function () {
        const currentScrollY = window.scrollY;
        const atTop = currentScrollY <= 8;
        const scrollingUp = currentScrollY < lastScrollY;
        const shouldShow = atTop || scrollingUp;

        header.classList.toggle("scrolled", !atTop);
        header.classList.toggle("is-hidden", !shouldShow);
        lastScrollY = currentScrollY;
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

    if (file === "index.html" || file === "" || file === "/") {
      target = "index.html";
    } else if (file === "projects.html" || file === "project.html") {
      target = "projects.html";
    } else if (file === "gallery.html") {
      target = "gallery.html";
    } else if (file === "resume.html") {
      target = "resume.html";
    } else if (file === "contact.html") {
      target = "contact.html";
    }

    if (!target) return;

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

  let galleryItems = null;
  let galleryColumnCount = null;

  function getGalleryColumnCount() {
    return window.matchMedia("(max-width: 640px)").matches ? 1 : 3;
  }

  function getGalleryItemRelativeHeight(item) {
    const img = item.querySelector("img");
    if (!img) {
      return 1;
    }

    const width = Number(img.getAttribute("width")) || img.naturalWidth || 1;
    const height = Number(img.getAttribute("height")) || img.naturalHeight || 1;
    return height / Math.max(width, 1);
  }

  function layoutGallery(items) {
    const grid = document.querySelector(".gallery-grid");
    if (!grid || !items || items.length === 0) {
      return;
    }

    const columnCount = getGalleryColumnCount();
    galleryColumnCount = columnCount;

    const columns = Array.from({ length: columnCount }, function () {
      const column = document.createElement("div");
      column.className = "gallery-column";
      return { el: column, height: 0 };
    });

    items.forEach(function (item) {
      let shortest = columns[0];
      for (let i = 1; i < columns.length; i += 1) {
        if (columns[i].height < shortest.height) {
          shortest = columns[i];
        }
      }
      shortest.el.appendChild(item);
      shortest.height += getGalleryItemRelativeHeight(item);
    });

    grid.replaceChildren.apply(grid, columns.map(function (column) {
      return column.el;
    }));
  }

  function shuffleGallery() {
    const grid = document.querySelector(".gallery-grid");
    if (!grid) {
      return;
    }

    const items = Array.from(grid.querySelectorAll(".gallery-item"));
    if (items.length === 0) {
      return;
    }

    for (let i = items.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = items[i];
      items[i] = items[j];
      items[j] = temp;
    }

    items.forEach(function (item, index) {
      const img = item.querySelector("img");
      if (img) {
        img.loading = index < 2 ? "eager" : "lazy";
      }
    });

    galleryItems = items;
    layoutGallery(galleryItems);
  }

  function installGalleryLayout() {
    const grid = document.querySelector(".gallery-grid");
    if (!grid) {
      return;
    }

    let resizeTimer = 0;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        if (!galleryItems) {
          return;
        }

        const nextCount = getGalleryColumnCount();
        if (nextCount !== galleryColumnCount) {
          layoutGallery(galleryItems);
        }
      }, 150);
    });
  }

  function installGalleryLightbox() {
    const grid = document.querySelector(".gallery-grid");
    if (!grid) {
      return;
    }

    const lightbox = document.createElement("div");
    lightbox.className = "gallery-lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-label", "Expanded gallery image");
    lightbox.innerHTML =
      '<button class="gallery-lightbox-close" type="button" aria-label="Close">&times;</button>' +
      '<img alt="">';

    document.body.appendChild(lightbox);

    const lightboxImage = lightbox.querySelector("img");
    const closeButton = lightbox.querySelector(".gallery-lightbox-close");

    function openLightbox(img) {
      lightboxImage.src = img.currentSrc || img.src;
      lightboxImage.alt = img.alt || "";
      lightbox.classList.add("is-open");
      document.body.classList.add("gallery-lightbox-open");
      closeButton.focus();
    }

    function closeLightbox() {
      lightbox.classList.remove("is-open");
      document.body.classList.remove("gallery-lightbox-open");
      lightboxImage.removeAttribute("src");
      lightboxImage.alt = "";
    }

    grid.addEventListener("click", function (event) {
      const item = event.target.closest(".gallery-item");
      if (!item || !grid.contains(item)) {
        return;
      }

      const img = item.querySelector("img");
      if (!img) {
        return;
      }

      openLightbox(img);
    });

    lightbox.addEventListener("click", function (event) {
      if (event.target === lightbox || event.target === closeButton) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && lightbox.classList.contains("is-open")) {
        closeLightbox();
      }
    });
  }

  window.installRevealAnimationsFromProjectPage = installRevealAnimations;
  window.installRevealAnimationsFromDynamicContent = installRevealAnimations;

  shuffleGallery();
  installGalleryLayout();
  installGalleryLightbox();

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
