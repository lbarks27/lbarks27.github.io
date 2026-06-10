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
    const blogPosts = Array.isArray(data.blogPosts) ? data.blogPosts : [];

    // Sort: dated first (newest), then by original index order for undated
    const sortedProjects = [...projects].sort((a, b) => {
      const ta = a.date ? utils.parseIsoDate(a.date).getTime() : 0;
      const tb = b.date ? utils.parseIsoDate(b.date).getTime() : 0;
      if (ta !== tb) return tb - ta;
      return projects.indexOf(a) - projects.indexOf(b);
    });

    root.innerHTML = "";
    root.classList.add("projects-full");

    if (sortedProjects.length === 0) {
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

    sortedProjects.forEach((project) => {
      const article = document.createElement("article");
      article.className = "project-entry";
      article.setAttribute("id", "project-" + project.id);
      article.setAttribute("data-reveal", "");

      // Header (date, title as in-page anchor, tagline)
      const header = document.createElement("div");
      header.className = "project-entry-header";

      const meta = document.createElement("p");
      meta.className = "blog-meta project-entry-meta";
      meta.textContent = project.date ? "Project / " + formatter.format(utils.parseIsoDate(project.date)) : "Project";

      const title = document.createElement("h2");
      title.className = "project-entry-title";
      const titleLink = document.createElement("a");
      titleLink.href = "#project-" + project.id;
      titleLink.textContent = project.title;
      title.appendChild(titleLink);

      const tagline = document.createElement("p");
      tagline.className = "project-entry-tagline";
      tagline.textContent = project.tagline || "";

      header.appendChild(meta);
      header.appendChild(title);
      header.appendChild(tagline);

      // Rich body sections (full content on the listing page — no links to separate project.html)
      const body = document.createElement("div");
      body.className = "project-entry-body";

      // Overview
      if (project.summary) {
        const sec = document.createElement("div");
        sec.className = "project-section";
        const h = document.createElement("h3");
        h.textContent = "Overview";
        const rich = document.createElement("div");
        rich.className = "rich-text";
        rich.innerHTML = utils.renderMarkdown(project.summary);
        sec.appendChild(h);
        sec.appendChild(rich);
        body.appendChild(sec);
      }

      // Solver Deep Dive
      if (project.solverApproach) {
        const sec = document.createElement("div");
        sec.className = "project-section";
        const h = document.createElement("h3");
        h.textContent = "Solver Deep Dive";
        const rich = document.createElement("div");
        rich.className = "rich-text";
        rich.innerHTML = utils.renderMarkdown(project.solverApproach);
        sec.appendChild(h);
        sec.appendChild(rich);
        body.appendChild(sec);
      }

      // Resources
      const resSec = document.createElement("div");
      resSec.className = "project-section";
      const resH = document.createElement("h3");
      resH.textContent = "Resources";
      const resList = document.createElement("div");
      resList.className = "resource-list";
      resList.innerHTML = renderResources(project);
      resSec.appendChild(resH);
      resSec.appendChild(resList);
      body.appendChild(resSec);

      // Media (photos + videos)
      const hasPhotos = Array.isArray(project.photos) && project.photos.length > 0;
      const hasVideos = Array.isArray(project.videos) && project.videos.length > 0;
      if (hasPhotos || hasVideos) {
        const mediaSec = document.createElement("div");
        mediaSec.className = "project-section";
        const mH = document.createElement("h3");
        mH.textContent = "Media";
        const grid = document.createElement("div");
        grid.className = "media-grid project-media-grid";
        if (hasPhotos) grid.innerHTML += renderPhotos(project);
        if (hasVideos) grid.innerHTML += renderVideos(project);
        mediaSec.appendChild(mH);
        mediaSec.appendChild(grid);
        body.appendChild(mediaSec);
      }

      // Data and Results
      if (project.dataNotes) {
        const sec = document.createElement("div");
        sec.className = "project-section";
        const h = document.createElement("h3");
        h.textContent = "Data and Results";
        const rich = document.createElement("div");
        rich.className = "rich-text";
        rich.innerHTML = utils.renderMarkdown(project.dataNotes);
        sec.appendChild(h);
        sec.appendChild(rich);
        body.appendChild(sec);
      }

      // Related updates (point to the full updates page)
      const related = blogPosts.filter((post) => post.relatedProject === project.id);
      if (related.length > 0) {
        const relSec = document.createElement("div");
        relSec.className = "project-section";
        const rH = document.createElement("h3");
        rH.textContent = "Related Updates";
        const rList = document.createElement("div");
        rList.className = "resource-list";
        rList.innerHTML = renderRelatedPosts(related, utils, formatter);
        relSec.appendChild(rH);
        relSec.appendChild(rList);
        body.appendChild(relSec);
      }

      article.appendChild(header);
      article.appendChild(body);
      root.appendChild(article);
    });

    if (window.installRevealAnimationsFromDynamicContent) {
      window.installRevealAnimationsFromDynamicContent();
    } else {
      installRevealFallback();
    }
  }

  function renderResources(project) {
    const resources = [];

    resources.push({
      label: "GitHub repository",
      value: project.github || "Link pending",
      href: project.github || ""
    });

    if (Array.isArray(project.datasets) && project.datasets.length > 0) {
      project.datasets.forEach((dataset) => {
        const datasetObject = typeof dataset === "string" ? { name: "Dataset", url: dataset } : dataset;
        resources.push({
          label: datasetObject.name || "Dataset",
          value: datasetObject.url || "Link pending",
          href: datasetObject.url || ""
        });
      });
    } else {
      resources.push({
        label: "Dataset package",
        value: "Link pending",
        href: ""
      });
    }

    return resources
      .map((resource) => {
        const action = resource.href
          ? '<a target="_blank" rel="noreferrer" href="' + resource.href + '">Open</a>'
          : "<span>Pending</span>";
        return (
          '<div class="resource-item"><strong>' +
          resource.label +
          "</strong>" +
          '<span class="mono">' +
          resource.value +
          "</span>" +
          action +
          "</div>"
        );
      })
      .join("");
  }

  function renderPhotos(project) {
    if (Array.isArray(project.photos) && project.photos.length > 0) {
      return project.photos
        .map((photo, index) => {
          const src = typeof photo === "string" ? photo : photo.src;
          const alt = typeof photo === "string" ? project.title + " photo " + (index + 1) : photo.alt || project.title;
          return '<img class="media-thumb" src="' + src + '" alt="' + alt + '">';
        })
        .join("");
    }
    return "";
  }

  function renderVideos(project) {
    if (Array.isArray(project.videos) && project.videos.length > 0) {
      return project.videos
        .map((video) => {
          const videoSource = typeof video === "string" ? video : video.src;
          if (videoSource.endsWith(".mp4")) {
            return (
              '<video class="media-thumb" controls>' +
              '<source src="' +
              videoSource +
              '" type="video/mp4">' +
              "</video>"
            );
          }
          return (
            '<iframe class="media-thumb" src="' +
            videoSource +
            '" title="Project video" loading="lazy" allowfullscreen></iframe>'
          );
        })
        .join("");
    }
    return "";
  }

  function renderRelatedPosts(relatedPosts, utils, formatter) {
    if (!relatedPosts || relatedPosts.length === 0) {
      return "<p>No related updates yet.</p>";
    }

    return relatedPosts
      .map((post) => {
        return (
          '<div class="resource-item">' +
          "<strong>" +
          post.title +
          "</strong>" +
          "<span>" +
          formatter.format(utils.parseIsoDate(post.date)) +
          "</span>" +
          '<a href="blog.html#' +
          post.id +
          '">Read</a>' +
          "</div>"
        );
      })
      .join("");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
