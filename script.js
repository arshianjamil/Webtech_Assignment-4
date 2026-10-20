const STORAGE_KEY = "markdownSlideMakerContent";
const starterMarkdown = `# Welcome
## My assignment#4 for web technology course.
Write slides in Markdown on the left.

---

# Slide 2
## Some formatting
- **Bold** text
- *Italic* text
- \`inline code\`

---

# The End
Thank you!`;

const editor = document.getElementById("markdownInput");
const previewSlide = document.getElementById("previewSlide");
const presentationSlide = document.getElementById("presentationSlide");
const presentation = document.getElementById("presentation");
const workspace = document.getElementById("workspace");
let slides = [];
let currentSlide = 0;
let isPresenting = false;
let toastTimer;

function escapeHTML(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

// A small Markdown renderer for common slide content.
function inlineMarkdown(text) {
  let safe = escapeHTML(text);
  safe = safe.replace(/`([^`]+)`/g, "<code>$1</code>");
  safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  safe = safe.replace(/\*(.+?)\*/g, "<em>$1</em>");
  return safe;
}

function markdownToHTML(markdown) {
  const lines = markdown.split("\n");
  let html = "";
  let listType = null;
  let inCode = false;
  let codeLines = [];

  const closeList = () => {
    if (listType) { html += `</${listType}>`; listType = null; }
  };

  for (const line of lines) {
    if (line.trim().startsWith("```")) {
      closeList();
      if (inCode) {
        html += `<pre><code>${escapeHTML(codeLines.join("\n"))}</code></pre>`;
        codeLines = []; inCode = false;
      } else inCode = true;
      continue;
    }
    if (inCode) { codeLines.push(line); continue; }
    const trimmed = line.trim();
    if (!trimmed) { closeList(); continue; }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);
    const unordered = trimmed.match(/^[-*+]\s+(.+)$/);
    const ordered = trimmed.match(/^\d+\.\s+(.+)$/);

    if (heading) {
      closeList();
      const level = heading[1].length;
      html += `<h${level}>${inlineMarkdown(heading[2])}</h${level}>`;
    } else if (unordered || ordered) {
      const type = unordered ? "ul" : "ol";
      if (listType !== type) { closeList(); html += `<${type}>`; listType = type; }
      html += `<li>${inlineMarkdown((unordered || ordered)[1])}</li>`;
    } else if (trimmed.startsWith(">")) {
      closeList(); html += `<blockquote>${inlineMarkdown(trimmed.slice(1).trim())}</blockquote>`;
    } else if (trimmed === "---" || trimmed === "***") {
      closeList(); html += "<hr>";
    } else {
      closeList(); html += `<p>${inlineMarkdown(trimmed)}</p>`;
    }
  }
  closeList();
  if (inCode) html += `<pre><code>${escapeHTML(codeLines.join("\n"))}</code></pre>`;
  return html || "<p><em>This slide is empty. Add some Markdown in the editor.</em></p>";
}

function readSlides() {
  const chunks = editor.value.split(/^\s*---\s*$/m);
  slides = chunks.map(chunk => chunk.trim()).filter(chunk => chunk.length > 0);
  if (slides.length === 0) slides = [""];
  currentSlide = Math.min(currentSlide, slides.length - 1);
  renderSlides();
}

function renderSlides() {
  const html = markdownToHTML(slides[currentSlide] || "");
  previewSlide.innerHTML = html;
  presentationSlide.innerHTML = html;
  const count = `${currentSlide + 1} / ${slides.length}`;
  document.getElementById("previewCount").textContent = count;
  document.getElementById("presentCount").textContent = count;
  const atStart = currentSlide === 0;
  const atEnd = currentSlide === slides.length - 1;
  ["previewPrev", "presentPrev"].forEach(id => document.getElementById(id).disabled = atStart);
  ["previewNext", "presentNext"].forEach(id => document.getElementById(id).disabled = atEnd);
}

function moveSlide(amount) {
  const next = currentSlide + amount;
  if (next >= 0 && next < slides.length) {
    currentSlide = next;
    renderSlides();
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function saveSlides() {
  try {
    localStorage.setItem(STORAGE_KEY, editor.value);
    document.getElementById("saveStatus").textContent = "Saved in this browser.";
    showToast("Presentation saved successfully!");
  } catch (error) {
    showToast("Could not save. Browser storage may be full or disabled.");
  }
}

function toggleFullscreen() {
  const target = isPresenting ? presentation : document.querySelector(".slide-shell");
  if (!document.fullscreenElement) {
    if (target.requestFullscreen) target.requestFullscreen().catch(() => showToast("Full screen is not available."));
  } else if (document.exitFullscreen) {
    document.exitFullscreen();
  }
}

function updateFullscreenButtons() {
  const active = Boolean(document.fullscreenElement);
  const text = active ? "⛶" : "⛶";
  ["previewFullscreen", "presentFullscreen"].forEach(id => {
    const button = document.getElementById(id);
    button.textContent = text;
    button.setAttribute("aria-label", active ? "Exit full screen" : "Enter full screen");
    button.title = active ? "Exit full screen" : "Full screen";
  });
}

function startPresentation() {
  isPresenting = true;
  presentation.classList.remove("hidden");
  workspace.style.visibility = "hidden";
  document.getElementById("presentBtn").textContent = "Presenting";
  renderSlides();
}
function stopPresentation() {
  isPresenting = false;
  presentation.classList.add("hidden");
  workspace.style.visibility = "visible";
  document.getElementById("presentBtn").textContent = "Present";
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
}

editor.addEventListener("input", () => {
  readSlides();
  document.getElementById("saveStatus").textContent = "Unsaved changes";
});
document.getElementById("saveBtn").addEventListener("click", saveSlides);
document.getElementById("newBtn").addEventListener("click", () => {
  if (editor.value.trim() && !confirm("Start a new presentation? Save your current work first if needed.")) return;
  editor.value = "# New Presentation\n\nAdd your content here.\n\n---\n\n# Second Slide\n\nWrite something on this slide.";
  currentSlide = 0; readSlides(); showToast("New presentation created.");
});
document.getElementById("addSlideBtn").addEventListener("click", () => {
  const separator = editor.value.trim() ? "\n\n---\n\n" : "";
  editor.value = editor.value.trimEnd() + separator + "# New Slide\n\nWrite your content here.";
  editor.focus(); editor.setSelectionRange(editor.value.length, editor.value.length);
  currentSlide = Math.max(0, editor.value.split(/^\s*---\s*$/m).length - 1);
  readSlides();
});
document.getElementById("presentBtn").addEventListener("click", startPresentation);
document.getElementById("exitPresentBtn").addEventListener("click", stopPresentation);
document.getElementById("previewPrev").addEventListener("click", () => moveSlide(-1));
document.getElementById("previewNext").addEventListener("click", () => moveSlide(1));
document.getElementById("presentPrev").addEventListener("click", () => moveSlide(-1));
document.getElementById("presentNext").addEventListener("click", () => moveSlide(1));
document.getElementById("previewFullscreen").addEventListener("click", toggleFullscreen);
document.getElementById("presentFullscreen").addEventListener("click", toggleFullscreen);

document.addEventListener("keydown", event => {
  const tag = document.activeElement.tagName;
  const editingText = tag === "TEXTAREA" || tag === "INPUT";
  if (event.ctrlKey && event.key.toLowerCase() === "s") {
    event.preventDefault(); saveSlides(); return;
  }
  if (event.key === "F11") {
    event.preventDefault(); toggleFullscreen(); return;
  }
  if (editingText && !isPresenting) return;
  if (event.key === "ArrowRight") { event.preventDefault(); moveSlide(1); }
  if (event.key === "ArrowLeft") { event.preventDefault(); moveSlide(-1); }
  if (event.key === "Escape" && isPresenting && !document.fullscreenElement) stopPresentation();
});
document.addEventListener("fullscreenchange", updateFullscreenButtons);

// Load the previous presentation when the page opens.
const saved = localStorage.getItem(STORAGE_KEY);
editor.value = saved !== null ? saved : starterMarkdown;
readSlides();
