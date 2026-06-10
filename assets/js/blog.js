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
          tags: post.tags || [],
          content: post.content || "",
          date: post.date,
          relatedProject: post.relatedProject,
          image: image,
          imageAlt: imageAlt,
          sortTime: utils.parseIsoDate(post.date).getTime(),
          sourceIndex: index
        };
      })
      .sort((a, b) => b.sortTime - a.sortTime || a.sourceIndex - b.sourceIndex);

    root.innerHTML = "";

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
      article.className = "blog-row";
      article.setAttribute("id", post.id);
      article.setAttribute("data-reveal", "");

      if (post.image) {
        const imageUrl = new URL(post.image, window.location.href).href;
        article.classList.add("blog-row-has-image");
        article.style.setProperty("--blog-row-image", 'url("' + imageUrl.replace(/"/g, '\\"') + '")');
        article.setAttribute("aria-label", post.imageAlt ? post.title + " / " + post.imageAlt : post.title);
      }

      const meta = document.createElement("p");
      meta.className = "blog-meta";
      meta.textContent = post.date ? post.type + " / " + formatter.format(utils.parseIsoDate(post.date)) : post.type;

      const title = document.createElement("h2");
      title.textContent = post.title;

      const excerpt = document.createElement("p");
      excerpt.textContent = post.excerpt;

      const tags = document.createElement("div");
      tags.className = "tags";
      (post.tags || []).forEach((tag) => {
        const node = document.createElement("span");
        node.className = "tag";
        node.textContent = tag;
        tags.appendChild(node);
      });

      article.appendChild(meta);
      article.appendChild(title);
      article.appendChild(excerpt);
      article.appendChild(tags);

      if (post.content && post.content.trim() && post.content.trim() !== post.excerpt.trim()) {
        const body = document.createElement("div");
        body.className = "rich-text";
        body.innerHTML = utils.renderMarkdown(post.content);
        article.appendChild(body);
      }

      if (post.relatedProject && projectById.has(post.relatedProject)) {
        const project = projectById.get(post.relatedProject);
        const link = document.createElement("a");
        link.className = "back-link";
        link.href = "project.html?id=" + encodeURIComponent(project.id);
        link.textContent = "Open project deep dive: " + project.title;
        article.appendChild(link);
      }

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
