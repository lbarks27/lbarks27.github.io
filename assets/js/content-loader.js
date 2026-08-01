(function () {
  const CONTENT_VERSION = "20260607-3";

  function normalizeNewlines(value) {
    return String(value || "").replace(/\r\n?/g, "\n");
  }

  function buildVersionedPath(path) {
    const separator = path.indexOf("?") === -1 ? "?" : "&";
    return path + separator + "v=" + encodeURIComponent(CONTENT_VERSION);
  }

  function parseFrontMatter(text) {
    const source = normalizeNewlines(text);
    const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
    if (!match) {
      return {
        attributes: {},
        body: source.trim()
      };
    }

    const attributes = {};
    match[1].split("\n").forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return;
      }

      const separatorIndex = trimmed.indexOf(":");
      if (separatorIndex === -1) {
        return;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      const rawValue = trimmed.slice(separatorIndex + 1).trim();
      attributes[key] = parseFrontMatterValue(rawValue);
    });

    return {
      attributes: attributes,
      body: match[2].trim()
    };
  }

  function parseFrontMatterValue(rawValue) {
    if (!rawValue) {
      return "";
    }

    if (
      (rawValue.startsWith("[") && rawValue.endsWith("]")) ||
      (rawValue.startsWith("{") && rawValue.endsWith("}"))
    ) {
      try {
        return JSON.parse(rawValue);
      } catch (_error) {
        return rawValue;
      }
    }

    if (
      (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
      (rawValue.startsWith("'") && rawValue.endsWith("'"))
    ) {
      return rawValue.slice(1, -1);
    }

    if (rawValue === "true") {
      return true;
    }

    if (rawValue === "false") {
      return false;
    }

    if (rawValue === "null") {
      return null;
    }

    if (/^-?\d+(\.\d+)?$/.test(rawValue)) {
      return Number(rawValue);
    }

    return rawValue;
  }

  function splitMarkdownSections(markdown) {
    const sections = {};
    const lines = normalizeNewlines(markdown).split("\n");
    let currentTitle = "";
    let buffer = [];

    function flush() {
      if (!currentTitle) {
        return;
      }
      sections[currentTitle] = buffer.join("\n").trim();
    }

    lines.forEach((line) => {
      const headingMatch = line.match(/^##\s+(.+)$/);
      if (headingMatch) {
        flush();
        currentTitle = headingMatch[1].trim();
        buffer = [];
        return;
      }

      if (currentTitle) {
        buffer.push(line);
      }
    });

    flush();
    return sections;
  }

  function ensureArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function parseIsoDate(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      return new Date(value);
    }

    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12, 0, 0, 0);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function renderInlineMarkdown(text) {
    let output = escapeHtml(text);
    output = output.replace(/`([^`]+)`/g, "<code>$1</code>");
    output = output.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
    output = output.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    output = output.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    return output;
  }

  function renderMarkdown(markdown) {
    const lines = normalizeNewlines(markdown).split("\n");
    const blocks = [];
    let paragraphLines = [];
    let listItems = [];
    let listType = "";
    let inCodeBlock = false;
    let codeLines = [];

    function flushParagraph() {
      if (paragraphLines.length === 0) {
        return;
      }
      blocks.push("<p>" + renderInlineMarkdown(paragraphLines.join(" ")) + "</p>");
      paragraphLines = [];
    }

    function flushList() {
      if (listItems.length === 0 || !listType) {
        return;
      }
      blocks.push(
        "<" +
          listType +
          ">" +
          listItems
            .map((item) => {
              return "<li>" + renderInlineMarkdown(item) + "</li>";
            })
            .join("") +
          "</" +
          listType +
          ">"
      );
      listItems = [];
      listType = "";
    }

    function flushCodeBlock() {
      if (!inCodeBlock) {
        return;
      }
      blocks.push("<pre><code>" + escapeHtml(codeLines.join("\n")) + "</code></pre>");
      inCodeBlock = false;
      codeLines = [];
    }

    lines.forEach((line) => {
      if (line.trim().startsWith("```")) {
        flushParagraph();
        flushList();
        if (inCodeBlock) {
          flushCodeBlock();
        } else {
          inCodeBlock = true;
          codeLines = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeLines.push(line);
        return;
      }

      const trimmed = line.trim();
      if (!trimmed) {
        flushParagraph();
        flushList();
        return;
      }

      const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch) {
        flushParagraph();
        flushList();
        const level = Math.min(headingMatch[1].length, 6);
        blocks.push("<h" + level + ">" + renderInlineMarkdown(headingMatch[2]) + "</h" + level + ">");
        return;
      }

      const unorderedMatch = trimmed.match(/^-\s+(.+)$/);
      if (unorderedMatch) {
        flushParagraph();
        if (listType && listType !== "ul") {
          flushList();
        }
        listType = "ul";
        listItems.push(unorderedMatch[1]);
        return;
      }

      const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
      if (orderedMatch) {
        flushParagraph();
        if (listType && listType !== "ol") {
          flushList();
        }
        listType = "ol";
        listItems.push(orderedMatch[1]);
        return;
      }

      if (listType) {
        flushList();
      }

      paragraphLines.push(trimmed);
    });

    flushParagraph();
    flushList();
    flushCodeBlock();
    return blocks.join("");
  }

  function normalizeProject(documentData) {
    const attributes = documentData.attributes;
    const sections = splitMarkdownSections(documentData.body);

    return {
      id: String(attributes.id || ""),
      title: String(attributes.title || ""),
      date: String(attributes.date || ""),
      tagline: String(attributes.tagline || ""),
      summary: sections.Overview || String(attributes.summary || ""),
      solverApproach: sections["Solver Deep Dive"] || String(attributes.solverApproach || ""),
      dataNotes: sections["Data and Results"] || String(attributes.dataNotes || ""),
      github: String(attributes.github || ""),
      status: String(attributes.status || "").toLowerCase(),
      iconOverlay: String(attributes.iconOverlay || ""),
      iconOverlayAlt: String(attributes.iconOverlayAlt || ""),
      photos: ensureArray(attributes.photos),
      videos: ensureArray(attributes.videos),
      datasets: ensureArray(attributes.datasets)
    };
  }

  async function loadText(path) {
    const response = await fetch(buildVersionedPath(path), { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load " + path + " (" + response.status + ")");
    }
    return response.text();
  }

  async function loadJson(path) {
    const response = await fetch(buildVersionedPath(path), { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Failed to load " + path + " (" + response.status + ")");
    }
    return response.json();
  }

  async function loadCollection(indexPath, folderPath, normalizer) {
    const filenames = await loadJson(indexPath);
    const documents = await Promise.all(
      filenames.map(async (filename) => {
        const text = await loadText(folderPath + filename);
        return normalizer(parseFrontMatter(text));
      })
    );
    return documents;
  }

  async function loadCollectionSafely(indexPath, folderPath, normalizer, label) {
    try {
      return await loadCollection(indexPath, folderPath, normalizer);
    } catch (error) {
      console.error("Failed to load " + label + " content.", error);
      return [];
    }
  }

  async function loadPortfolioData() {
    let siteData = {};
    try {
      siteData = await loadJson("content/site.json");
    } catch (error) {
      console.error("Failed to load site metadata.", error);
    }

    const projects = await loadCollectionSafely(
      "content/projects/index.json",
      "content/projects/",
      normalizeProject,
      "projects"
    );

    return {
      owner: siteData.owner || {},
      projects: projects
    };
  }

  window.PORTFOLIO_UTILS = {
    escapeHtml: escapeHtml,
    parseIsoDate: parseIsoDate,
    renderMarkdown: renderMarkdown
  };

  window.PORTFOLIO_DATA_READY = loadPortfolioData()
    .then(function (data) {
      window.PORTFOLIO_DATA = data;
      document.dispatchEvent(
        new CustomEvent("portfolio-data-ready", {
          detail: data
        })
      );
      return data;
    })
    .catch(function (error) {
      console.error(error);
      const fallback = {
        owner: {},
        projects: []
      };
      window.PORTFOLIO_DATA = fallback;
      return fallback;
    });
})();
