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
    const root = document.querySelector("[data-blog-root]");
    if (!root || !data) {
      return;
    }

    const utils = getUtils();
    const formatter = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });

    const blogPosts = Array.isArray(data.blogPosts) ? data.blogPosts : [];
    const projects = Array.isArray(data.projects) ? data.projects : [];
    const projectById = new Map(projects.map((project) => [project.id, project]));

    const posts = blogPosts
      .map((post, index) => {
        const relatedProject = projectById.get(post.relatedProject);
        const image = post.image || (relatedProject ? relatedProject.iconOverlay : "");
        const imageAlt =
          post.imageAlt || (relatedProject ? relatedProject.iconOverlayAlt || relatedProject.title + " project image" : "");

        return {
          id: post.id,
          type: "Update",
          title: post.title,
          excerpt: post.excerpt,
          href: "blog.html#" + encodeURIComponent(post.id),
          content: post.content || "",
          date: post.date,
          image: image,
          imageAlt: imageAlt,
          sortTime: utils.parseIsoDate(post.date).getTime(),
          sourceIndex: index
        };
      })
      .sort((a, b) => b.sortTime - a.sortTime || a.sourceIndex - b.sourceIndex);

    root.innerHTML = "";
    root.classList.add("timeline");

    if (posts.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      placeholder.setAttribute("data-reveal", "");
      placeholder.textContent = "Updates are temporarily unavailable while content loads. Refresh to try again.";
      root.appendChild(placeholder);

      if (window.installRevealAnimationsFromDynamicContent) {
        window.installRevealAnimationsFromDynamicContent();
      } else {
        installRevealFallback();
      }
      return;
    }

    posts.forEach((post) => {
      const article = document.createElement("article");
      article.className = "timeline-post";
      article.setAttribute("id", post.id);
      article.setAttribute("data-reveal", "");

      const dateEl = document.createElement("time");
      dateEl.className = "update-date";
      if (post.date) {
        const d = utils.parseIsoDate(post.date);
        dateEl.dateTime = post.date;
        dateEl.textContent = formatter.format(d);
      } else {
        dateEl.textContent = post.type;
      }

      const title = document.createElement("h2");
      title.className = "update-title";
      const titleLink = document.createElement("a");
      titleLink.href = "#" + post.id;
      titleLink.textContent = post.title;
      title.appendChild(titleLink);

      const body = document.createElement("div");
      body.className = "rich-text update-body";
      body.innerHTML = utils.renderMarkdown(post.content || post.excerpt || "");

      article.appendChild(dateEl);
      article.appendChild(title);

      // Optional featured image for the update (only explicit post images, not project icon fallbacks)
      const hasOwnImage = post.image && !/overlay/i.test(post.image);
      if (hasOwnImage) {
        const media = document.createElement("figure");
        media.className = "update-media";
        const img = document.createElement("img");
        img.src = post.image;
        img.alt = post.imageAlt || post.title;
        img.loading = "lazy";
        media.appendChild(img);
        article.appendChild(media);
      }

      article.appendChild(body);

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
