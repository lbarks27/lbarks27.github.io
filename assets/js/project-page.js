(function () {
  const data = window.PORTFOLIO_DATA;
  const shell = document.querySelector("[data-project-shell]");

  if (!shell || !data || !Array.isArray(data.projects)) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const projectId = params.get("id");
  const project = data.projects.find((item) => item.id === projectId);

  if (!project) {
    shell.innerHTML =
      '<section class="container section"><h1 class="section-title">Project Not Found</h1><p class="section-lead">Use the portfolio homepage to select a valid project page.</p><a class="back-link" href="index.html#projects">Back to projects</a></section>';
    return;
  }

  document.title = project.title + " | Liam Barkley";

  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const relatedPosts = (data.blogPosts || [])
    .filter((post) => post.relatedProject === project.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  function renderResources() {
    const resources = [];

    resources.push({
      label: "GitHub repository",
      value: project.github || "Link pending",
      href: project.github || ""
    });

    if (Array.isArray(project.datasets) && project.datasets.length > 0) {
      project.datasets.forEach((dataset) => {
        resources.push({
          label: dataset.name || "Dataset",
          value: dataset.url || "Link pending",
          href: dataset.url || ""
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
          if (video.endsWith(".mp4")) {
            return (
              '<video class="media-thumb" controls>' +
              '<source src="' +
              video +
              '" type="video/mp4">' +
              "</video>"
            );
          }
          return (
            '<iframe class="media-thumb" src="' +
            video +
            '" title="Project video" loading="lazy" allowfullscreen></iframe>'
          );
        })
        .join("");
    }

    return '<div class="media-thumb">Add a demo video link or local MP4 here<br><span class="mono">https://www.youtube.com/embed/...</span></div>';
  }

  function renderRelatedPosts() {
    if (relatedPosts.length === 0) {
      return "<p>No related blog updates yet.</p>";
    }

    return relatedPosts
      .map((post) => {
        return (
          '<div class="resource-item">' +
          "<strong>" +
          post.title +
          "</strong>" +
          "<span>" +
          formatter.format(new Date(post.date)) +
          "</span>" +
          '<a href="blog.html#' +
          post.id +
          '">Read</a>' +
          "</div>"
        );
      })
      .join("");
  }

  shell.innerHTML =
    '<section class="project-hero">' +
    '<div class="container">' +
    '<p class="section-kicker">Project Page</p>' +
    '<h1 class="project-title">' +
    project.title +
    "</h1>" +
    '<p class="project-tagline">' +
    project.tagline +
    "</p>" +
    '<a class="back-link" href="index.html#projects">Back to portfolio</a>' +
    "</div>" +
    "</section>" +
    '<section class="section">' +
    '<div class="container project-layout">' +
    '<article class="panel" data-reveal><h2>Overview</h2><p>' +
    project.summary +
    "</p></article>" +
    '<article class="panel" data-reveal><h2>Solver Deep Dive</h2><p>' +
    project.solverApproach +
    "</p></article>" +
    '<article class="panel" data-reveal><h2>Resources</h2><div class="resource-list">' +
    renderResources() +
    "</div></article>" +
    '<article class="panel" data-reveal><h2>Photos</h2><div class="media-grid">' +
    renderPhotos() +
    "</div></article>" +
    '<article class="panel" data-reveal><h2>Videos</h2><div class="media-grid">' +
    renderVideos() +
    "</div></article>" +
    '<article class="panel" data-reveal><h2>Data and Results</h2><p>' +
    project.dataNotes +
    '</p><table class="data-table"><thead><tr><th>Metric</th><th>Status</th><th>Notes</th></tr></thead><tbody><tr><td>Primary KPI</td><td>Pending</td><td>Add the metric recruiters should notice first.</td></tr><tr><td>Validation Method</td><td>Pending</td><td>Add test plan, simulation set, or hardware protocol.</td></tr><tr><td>Result Snapshot</td><td>Pending</td><td>Add numerical result and context.</td></tr></tbody></table></article>' +
    '<article class="panel" data-reveal><h2>Recent Blog Updates</h2><div class="resource-list">' +
    renderRelatedPosts() +
    "</div></article>" +
    "</div>" +
    "</section>";

  if (window.installRevealAnimationsFromProjectPage) {
    window.installRevealAnimationsFromProjectPage();
  } else {
    const items = Array.from(document.querySelectorAll("[data-reveal]"));
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );
      items.forEach((item) => observer.observe(item));
    } else {
      items.forEach((item) => item.classList.add("revealed"));
    }
  }
})();
