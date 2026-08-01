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
    const shell = document.querySelector("[data-project-shell]");

    if (!shell || !data || !Array.isArray(data.projects)) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("id");
    const project = data.projects.find((item) => item.id === projectId);

    if (!project) {
      shell.innerHTML =
        '<section class="container section"><h1 class="section-title">Project Not Found</h1><p class="section-lead">Use the projects archive to select a valid project page.</p><a class="back-link" href="projects.html">Back to projects</a></section>';
      return;
    }

    const utils = getUtils();
    document.title = project.title + " | Liam Barkley";

    function renderResources() {
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

    function renderPhotos() {
      if (Array.isArray(project.photos) && project.photos.length > 0) {
        return project.photos
          .map((photo, index) => {
            const src = typeof photo === "string" ? photo : photo.src;
            const alt = typeof photo === "string" ? project.title + " photo " + (index + 1) : photo.alt || project.title;
            return '<img class="media-thumb" src="' + src + '" alt="' + alt + '">';
          })
          .join("");
      }

      return '<div class="media-thumb">Add project photos here<br><span class="mono">assets/images/your-photo.jpg</span></div>';
    }

    function renderVideos() {
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

      return '<div class="media-thumb">Add a demo video link or local MP4 here<br><span class="mono">https://www.youtube.com/embed/...</span></div>';
    }

    const underConstruction = project.status === "under-construction";
    const heroImage = project.iconOverlay
      ? new URL(project.iconOverlay, window.location.href).href.replace(/'/g, "\\'")
      : "";
    const heroDescription = underConstruction
      ? project.tagline || ""
      : project.summary || project.tagline || "";

    const bodyHtml = underConstruction
      ? '<article class="panel project-report-pending" data-reveal>' +
        '<p class="project-report-pending-text">under construction</p>' +
        "</article>"
      : '<article class="panel" data-reveal><h2>Overview</h2><div class="rich-text">' +
        utils.renderMarkdown(project.summary) +
        "</div></article>" +
        '<article class="panel" data-reveal><h2>Solver Deep Dive</h2><div class="rich-text">' +
        utils.renderMarkdown(project.solverApproach) +
        "</div></article>" +
        '<article class="panel" data-reveal><h2>Resources</h2><div class="resource-list">' +
        renderResources() +
        "</div></article>" +
        '<article class="panel" data-reveal><h2>Photos</h2><div class="media-grid">' +
        renderPhotos() +
        "</div></article>" +
        '<article class="panel" data-reveal><h2>Videos</h2><div class="media-grid">' +
        renderVideos() +
        "</div></article>" +
        '<article class="panel" data-reveal><h2>Data and Results</h2><div class="rich-text">' +
        utils.renderMarkdown(project.dataNotes) +
        '</div><table class="data-table"><thead><tr><th>Metric</th><th>Status</th><th>Notes</th></tr></thead><tbody><tr><td>Primary KPI</td><td>Pending</td><td>Add the metric recruiters should notice first.</td></tr><tr><td>Validation Method</td><td>Pending</td><td>Add test plan, simulation set, or hardware protocol.</td></tr><tr><td>Result Snapshot</td><td>Pending</td><td>Add numerical result and context.</td></tr></tbody></table></article>';

    shell.innerHTML =
      '<section class="project-hero"' +
      (heroImage ? ' style="--page-hero-image: url(\'' + heroImage + '\');"' : "") +
      ">" +
      (heroImage
        ? '<div class="hero-media" aria-hidden="true"><div class="hero-media-frame"></div></div>'
        : "") +
      '<div class="container">' +
      '<h1 class="project-title">' +
      project.title +
      "</h1>" +
      '<div class="rich-text project-tagline project-hero-description">' +
      utils.renderMarkdown(heroDescription) +
      "</div>" +
      '<a class="back-link" href="projects.html">Back to projects</a>' +
      "</div>" +
      "</section>" +
      '<section class="section">' +
      '<div class="container project-layout">' +
      bodyHtml +
      "</div>" +
      "</section>";

    if (window.installRevealAnimationsFromProjectPage) {
      window.installRevealAnimationsFromProjectPage();
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
