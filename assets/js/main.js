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

  function createRandomSeed() {
    if (window.crypto && window.crypto.getRandomValues) {
      const randomValues = new Uint32Array(1);
      window.crypto.getRandomValues(randomValues);
      return randomValues[0] >>> 0;
    }
    return Math.floor(Math.random() * 4294967296) >>> 0;
  }

  function getVisitSeed() {
    const storageKey = "portfolio-fx-seed";
    try {
      const existing = window.sessionStorage.getItem(storageKey);
      if (existing !== null) {
        const parsed = Number(existing);
        if (Number.isFinite(parsed)) {
          return parsed >>> 0;
        }
      }

      const seed = createRandomSeed();
      window.sessionStorage.setItem(storageKey, String(seed));
      return seed;
    } catch (_error) {
      return createRandomSeed();
    }
  }

  function hashString(value) {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function createSeededRng(seed) {
    let state = seed >>> 0;
    return function () {
      state = (state + 0x6d2b79f5) >>> 0;
      let mixed = state;
      mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
      mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
      return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function shouldUseLiteLensFx() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      return true;
    }

    const saveData =
      typeof window.navigator.connection === "object" &&
      window.navigator.connection !== null &&
      window.navigator.connection.saveData === true;
    if (saveData) {
      return true;
    }

    const hardwareConcurrency = Number(window.navigator.hardwareConcurrency || 0);
    const hasDeviceMemory = typeof window.navigator.deviceMemory === "number";
    const deviceMemory = hasDeviceMemory ? Number(window.navigator.deviceMemory) : 0;
    const compactTouchViewport = window.innerWidth < 960 && window.matchMedia("(pointer: coarse)").matches;
    const desktopViewport = window.innerWidth >= 1200 && window.matchMedia("(pointer: fine)").matches;
    const strongDevice = hasDeviceMemory && hardwareConcurrency >= 10 && deviceMemory >= 8;

    if (compactTouchViewport) {
      return true;
    }

    return !(desktopViewport && strongDevice);
  }

  function installLensOverlay() {
    if (!document.body || document.querySelector("[data-lens-overlay]")) {
      return;
    }

    const overlay = document.createElement("div");
    overlay.className = "fx-lens-overlay";
    overlay.setAttribute("data-lens-overlay", "");
    overlay.setAttribute("data-quality", shouldUseLiteLensFx() ? "lite" : "full");
    overlay.setAttribute("aria-hidden", "true");
    document.body.appendChild(overlay);
  }

  function createSpectralProfile() {
    const visitSeed = getVisitSeed();
    const pageKey = window.location.pathname + "|" + window.location.search;
    const pageSeed = hashString(pageKey || "index");
    const rng = createSeededRng((visitSeed ^ pageSeed) >>> 0);

    return {
      sourceBaseX: -0.26 + rng() * 0.24,
      sourceBaseY: -0.34 + rng() * 0.36,
      sourceSwingX: 0.05 + rng() * 0.1,
      sourceSwingY: 0.1 + rng() * 0.16,
      sourceFreqX: 0.00045 + rng() * 0.0007,
      sourceFreqY: 0.00055 + rng() * 0.0008,
      sourceProgressY: 0.16 + rng() * 0.22,
      coreBaseX: 0.38 + rng() * 0.26,
      coreBaseY: 0.46 + rng() * 0.17,
      coreSwingX: 0.06 + rng() * 0.12,
      coreSwingY: 0.03 + rng() * 0.09,
      coreFreqX: 0.0006 + rng() * 0.0008,
      coreFreqY: 0.00045 + rng() * 0.0008,
      coreProgressY: 0.17 + rng() * 0.26,
      beamAxisOffset: 84 + rng() * 16,
      scanXScale: 1.8 + rng() * 2.3,
      scanYScale: 0.014 + rng() * 0.02,
      scanXFreq: 0.0014 + rng() * 0.0012,
      flickerBase: 0.87 + rng() * 0.08,
      flickerAmp: 0.03 + rng() * 0.05,
      flickerFreq: 0.018 + rng() * 0.02,
      spectrumShift: -3 + rng() * 6,
      spectrumSaturation: 160 + rng() * 36,
      warmHue: 328 + rng() * 24,
      warmSat: 84 + rng() * 14,
      warmLight: 58 + rng() * 16,
      coolHue: 188 + rng() * 44,
      coolSat: 74 + rng() * 20,
      coolLight: 58 + rng() * 20,
      iceHue: 172 + rng() * 38,
      iceSat: 28 + rng() * 40,
      iceLight: 84 + rng() * 12,
      deepHue: 214 + rng() * 34,
      deepSat: 60 + rng() * 30,
      deepLight: 46 + rng() * 24,
      colorDriftAmp: 3 + rng() * 8,
      colorDriftFreq: 0.0009 + rng() * 0.0018
    };
  }

  function installSpectralScrollFx() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const root = document.documentElement;
    const useLiteLensFx = shouldUseLiteLensFx();
    const profile = createSpectralProfile();
    const unseededRng = createSeededRng(createRandomSeed());
    const frameIntervalMs = useLiteLensFx ? 44 : 32;
    let lastFrameTs = 0;
    const spontaneity = {
      phaseA: unseededRng() * Math.PI * 2,
      phaseB: unseededRng() * Math.PI * 2,
      phaseC: unseededRng() * Math.PI * 2,
      sourceJitterX: 0.008 + unseededRng() * 0.014,
      sourceJitterY: 0.008 + unseededRng() * 0.014,
      coreJitterX: 0.006 + unseededRng() * 0.012,
      coreJitterY: 0.006 + unseededRng() * 0.01,
      angleJitter: 1.2 + unseededRng() * 2.8,
      hueJitter: 0.3 + unseededRng() * 0.9,
      saturationJitter: 3 + unseededRng() * 8,
      scanJitterX: 0.15 + unseededRng() * 0.6,
      scanJitterY: 0.08 + unseededRng() * 0.32
    };
    let ticking = false;

    const updateFx = function () {
      const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const viewportWidth = Math.max(window.innerWidth, 1);
      const viewportHeight = Math.max(window.innerHeight, 1);
      const progress = Math.min(window.scrollY / maxScroll, 1);
      const noiseA = Math.sin(window.scrollY * (profile.scanXFreq * 0.72) + spontaneity.phaseA);
      const noiseB = Math.cos(window.scrollY * (profile.scanXFreq * 0.49) + spontaneity.phaseB);
      const noiseC = Math.sin(window.scrollY * (profile.scanXFreq * 0.31) + spontaneity.phaseC);
      const sourceX =
        viewportWidth *
        (profile.sourceBaseX + Math.sin(window.scrollY * profile.sourceFreqX) * profile.sourceSwingX + noiseA * spontaneity.sourceJitterX);
      const sourceY =
        viewportHeight *
        (profile.sourceBaseY + Math.cos(window.scrollY * profile.sourceFreqY) * profile.sourceSwingY + progress * profile.sourceProgressY + noiseB * spontaneity.sourceJitterY);
      const coreX =
        viewportWidth *
        (profile.coreBaseX + Math.sin(window.scrollY * profile.coreFreqX) * profile.coreSwingX + noiseC * spontaneity.coreJitterX);
      const coreY =
        viewportHeight *
        (profile.coreBaseY + progress * profile.coreProgressY + Math.cos(window.scrollY * profile.coreFreqY) * profile.coreSwingY + noiseA * spontaneity.coreJitterY);
      const lensAlpha = clamp(0.18 + progress * 0.12 + Math.abs(noiseA) * 0.04, 0.16, 0.36);
      const angleRad = Math.atan2(coreY - sourceY, coreX - sourceX);
      const beamAngle = angleRad * (180 / Math.PI);
      const beamAngleCss = beamAngle + profile.beamAxisOffset + noiseB * spontaneity.angleJitter;
      const scanX = Math.sin(window.scrollY * profile.scanXFreq + spontaneity.phaseA) * profile.scanXScale + noiseC * spontaneity.scanJitterX;
      const scanY = window.scrollY * profile.scanYScale + noiseB * spontaneity.scanJitterY;
      const flicker = profile.flickerBase + Math.sin(window.scrollY * profile.flickerFreq + spontaneity.phaseC) * profile.flickerAmp;
      const spectrumShift = profile.spectrumShift + noiseA * spontaneity.hueJitter;
      const spectrumSaturation = profile.spectrumSaturation + noiseB * spontaneity.saturationJitter;
      const colorWave = Math.sin(window.scrollY * profile.colorDriftFreq + spontaneity.phaseB);
      const warmHue = profile.warmHue + noiseA * (profile.colorDriftAmp * 0.35) + colorWave * 0.7;
      const warmSat = clamp(profile.warmSat + noiseC * 4, 38, 98);
      const warmLight = clamp(profile.warmLight + noiseB * 3, 35, 92);
      const coolHue = profile.coolHue + noiseB * profile.colorDriftAmp - colorWave * 1.2;
      const coolSat = clamp(profile.coolSat + noiseA * 4.5, 40, 98);
      const coolLight = clamp(profile.coolLight + noiseC * 3.5, 35, 92);
      const iceHue = profile.iceHue + noiseC * (profile.colorDriftAmp * 0.8);
      const iceSat = clamp(profile.iceSat + noiseB * 3, 20, 86);
      const iceLight = clamp(profile.iceLight + noiseA * 2.4, 70, 98);
      const deepHue = profile.deepHue + noiseA * (profile.colorDriftAmp * 0.9) - colorWave * 0.8;
      const deepSat = clamp(profile.deepSat + noiseC * 4, 30, 96);
      const deepLight = clamp(profile.deepLight + noiseB * 2.6, 28, 84);

      root.style.setProperty("--fx-scroll", progress.toFixed(4));
      root.style.setProperty("--fx-source-x", sourceX.toFixed(2) + "px");
      root.style.setProperty("--fx-source-y", sourceY.toFixed(2) + "px");
      root.style.setProperty("--fx-core-x", coreX.toFixed(2) + "px");
      root.style.setProperty("--fx-core-y", coreY.toFixed(2) + "px");
      root.style.setProperty("--fx-lens-alpha", lensAlpha.toFixed(3));
      if (!useLiteLensFx) {
        const ghostX = coreX + (coreX - sourceX) * 0.72 + noiseB * (viewportWidth * 0.01);
        const ghostY = coreY + (coreY - sourceY) * 0.72 + noiseC * (viewportHeight * 0.01);
        const ghost2X = coreX - (coreX - sourceX) * 0.44 + noiseA * (viewportWidth * 0.008);
        const ghost2Y = coreY - (coreY - sourceY) * 0.44 + noiseB * (viewportHeight * 0.008);
        root.style.setProperty("--fx-ghost-x", ghostX.toFixed(2) + "px");
        root.style.setProperty("--fx-ghost-y", ghostY.toFixed(2) + "px");
        root.style.setProperty("--fx-ghost2-x", ghost2X.toFixed(2) + "px");
        root.style.setProperty("--fx-ghost2-y", ghost2Y.toFixed(2) + "px");
      }
      root.style.setProperty("--fx-beam-angle", beamAngleCss.toFixed(2) + "deg");
      root.style.setProperty("--fx-scan-x", scanX.toFixed(2) + "px");
      root.style.setProperty("--fx-scan-y", scanY.toFixed(2) + "px");
      root.style.setProperty("--fx-flicker", flicker.toFixed(3));
      root.style.setProperty("--fx-spectrum-shift", spectrumShift.toFixed(2) + "deg");
      root.style.setProperty("--fx-spectrum-saturation", spectrumSaturation.toFixed(1) + "%");
      root.style.setProperty("--fx-warm-h", warmHue.toFixed(2));
      root.style.setProperty("--fx-warm-s", warmSat.toFixed(2) + "%");
      root.style.setProperty("--fx-warm-l", warmLight.toFixed(2) + "%");
      root.style.setProperty("--fx-cool-h", coolHue.toFixed(2));
      root.style.setProperty("--fx-cool-s", coolSat.toFixed(2) + "%");
      root.style.setProperty("--fx-cool-l", coolLight.toFixed(2) + "%");
      root.style.setProperty("--fx-ice-h", iceHue.toFixed(2));
      root.style.setProperty("--fx-ice-s", iceSat.toFixed(2) + "%");
      root.style.setProperty("--fx-ice-l", iceLight.toFixed(2) + "%");
      root.style.setProperty("--fx-deep-h", deepHue.toFixed(2));
      root.style.setProperty("--fx-deep-s", deepSat.toFixed(2) + "%");
      root.style.setProperty("--fx-deep-l", deepLight.toFixed(2) + "%");
    };

    const onScroll = function () {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(function (timestamp) {
        if (timestamp - lastFrameTs < frameIntervalMs) {
          ticking = false;
          return;
        }
        lastFrameTs = timestamp;
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
  installLensOverlay();
  installSpectralScrollFx();
  setYear();
})();
