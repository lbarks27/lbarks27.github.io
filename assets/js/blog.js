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

    const projects = Array.isArray(data.projects) ? data.projects : [];
    const blogPosts = Array.isArray(data.blogPosts) ? data.blogPosts : [];
    const projectById = new Map(projects.map((project) => [project.id, project]));
    const projectItems = projects.map((project, index) => ({
      id: "project-" + project.id,
      type: "Project Deep Dive",
      title: project.title,
      excerpt: project.tagline,
      href: "project.html?id=" + encodeURIComponent(project.id),
      tags: [],
      content: "",
      sortTime: Date.UTC(2026, 0, 1) - index * 60000,
      sourceIndex: index
    }));
    const blogItems = blogPosts.map((post, index) => ({
      id: post.id,
      type: "Blog Post",
      title: post.title,
      excerpt: post.excerpt,
      href: "blog.html#" + encodeURIComponent(post.id),
      tags: post.tags || [],
      content: post.content || "",
      date: post.date,
      relatedProject: post.relatedProject,
      sortTime: utils.parseIsoDate(post.date).getTime(),
      sourceIndex: projects.length + index
    }));
    const posts = blogItems
      .concat(projectItems)
      .sort((a, b) => b.sortTime - a.sortTime || a.sourceIndex - b.sourceIndex);

    root.innerHTML = "";

    if (posts.length === 0) {
      const placeholder = document.createElement("div");
      placeholder.className = "placeholder";
      placeholder.setAttribute("data-reveal", "");
      placeholder.textContent = "Posts are temporarily unavailable while content loads. Refresh to try again.";
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

      if (post.type === "Project Deep Dive") {
        const link = document.createElement("a");
        link.className = "back-link";
        link.href = post.href;
        link.textContent = "Open project deep dive";
        article.appendChild(link);
      } else if (post.relatedProject && projectById.has(post.relatedProject)) {
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
