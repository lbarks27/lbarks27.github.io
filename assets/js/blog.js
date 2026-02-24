(function () {
  const data = window.PORTFOLIO_DATA;
  const root = document.querySelector("[data-blog-root]");
  if (!root || !data || !Array.isArray(data.blogPosts)) {
    return;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });

  const projectById = new Map((data.projects || []).map((project) => [project.id, project]));

  const posts = data.blogPosts
    .slice()
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  root.innerHTML = "";

  posts.forEach((post) => {
    const article = document.createElement("article");
    article.className = "blog-row";
    article.setAttribute("id", post.id);
    article.setAttribute("data-reveal", "");

    const meta = document.createElement("p");
    meta.className = "blog-meta";
    meta.textContent = formatter.format(new Date(post.date));

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
})();
