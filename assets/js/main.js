(function () {
  const data = window.PORTFOLIO_DATA;

  function setOwnerFields() {
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

    const linkedinLink = document.querySelector("[data-owner-linkedin]");
    if (linkedinLink) {
      linkedinLink.textContent = data.owner.linkedin;
      linkedinLink.setAttribute("href", data.owner.linkedin);
    }
  }

  function renderProjects() {
    const root = document.querySelector("[data-projects-root]");
    if (!root || !data || !Array.isArray(data.projects)) {
      return;
    }

    root.innerHTML = "";

    data.projects.forEach((project) => {
      const card = document.createElement("article");
      card.className = "project-card";
      card.setAttribute("data-reveal", "");

      const title = document.createElement("h3");
      title.textContent = project.title;

      const summary = document.createElement("p");
      summary.textContent = project.tagline;

      const meta = document.createElement("div");
      meta.className = "project-meta";

      const status = document.createElement("span");
      status.textContent = project.github ? "GitHub linked" : "GitHub pending";

      const detailLink = document.createElement("a");
      detailLink.href = "project.html?id=" + encodeURIComponent(project.id);
      detailLink.textContent = "Open page";
      detailLink.className = "btn btn-ghost";

      meta.appendChild(status);
      meta.appendChild(detailLink);

      card.appendChild(title);
      card.appendChild(summary);
      card.appendChild(meta);
      root.appendChild(card);
    });
  }

  function renderBlogPreview() {
    const root = document.querySelector("[data-blog-preview-root]");
    if (!root || !data || !Array.isArray(data.blogPosts)) {
      return;
    }

    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    const posts = data.blogPosts
      .slice()
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

    root.innerHTML = "";

    posts.forEach((post) => {
      const card = document.createElement("article");
      card.className = "blog-card";
      card.setAttribute("data-reveal", "");

      const meta = document.createElement("p");
      meta.className = "blog-meta";
      meta.textContent = formatter.format(new Date(post.date));

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

  function installSpectralScrollFx() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const root = document.documentElement;
    let ticking = false;

    const updateFx = function () {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const viewportWidth = Math.max(window.innerWidth, 1);
      const viewportHeight = Math.max(window.innerHeight, 1);
      const progress = Math.min(window.scrollY / maxScroll, 1);
      const sourceX = viewportWidth * (1.22 + Math.sin(window.scrollY * 0.0006) * 0.12);
      const sourceY = viewportHeight * (-0.18 + Math.cos(window.scrollY * 0.0008) * 0.22 + progress * 0.22);
      const coreX = viewportWidth * (0.5 + Math.sin(window.scrollY * 0.00095) * 0.15);
      const coreY = viewportHeight * (0.54 + progress * 0.28 + Math.cos(window.scrollY * 0.0007) * 0.08);
      const angleRad = Math.atan2(coreY - sourceY, coreX - sourceX);
      const beamAngle = angleRad * (180 / Math.PI);
      const beamAngleCss = beamAngle + 90;
      const scanX = Math.sin(window.scrollY * 0.002) * 2.8;
      const scanY = window.scrollY * 0.024;
      const flicker = 0.9 + Math.sin(window.scrollY * 0.028) * 0.06;

      root.style.setProperty("--fx-scroll", progress.toFixed(4));
      root.style.setProperty("--fx-source-x", sourceX.toFixed(2) + "px");
      root.style.setProperty("--fx-source-y", sourceY.toFixed(2) + "px");
      root.style.setProperty("--fx-core-x", coreX.toFixed(2) + "px");
      root.style.setProperty("--fx-core-y", coreY.toFixed(2) + "px");
      root.style.setProperty("--fx-beam-angle", beamAngleCss.toFixed(2) + "deg");
      root.style.setProperty("--fx-scan-x", scanX.toFixed(2) + "px");
      root.style.setProperty("--fx-scan-y", scanY.toFixed(2) + "px");
      root.style.setProperty("--fx-flicker", flicker.toFixed(3));
    };

    const onScroll = function () {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(function () {
        updateFx();
        ticking = false;
      });
    };

    updateFx();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  function setYear() {
    const target = document.querySelector("[data-year]");
    if (target) {
      target.textContent = String(new Date().getFullYear());
    }
  }

  setOwnerFields();
  renderProjects();
  renderBlogPreview();
  installHeaderBehavior();
  installRevealAnimations();
  installSpectralScrollFx();
  setYear();
})();
