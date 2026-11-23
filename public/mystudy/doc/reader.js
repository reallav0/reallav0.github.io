const content = document.getElementById("study-content");
const search = document.getElementById("document-search");
const form = document.querySelector(".search-tools");
const previous = document.getElementById("previous-match");
const next = document.getElementById("next-match");
const status = document.getElementById("search-status");
const contents = document.querySelector(".contents");
const narrow = window.matchMedia("(max-width: 950px)");
let matches = [];
let current = -1;

contents.open = !narrow.matches;
narrow.addEventListener("change", () => { contents.open = !narrow.matches; });
contents.addEventListener("click", (event) => {
  if (event.target.closest("a") && narrow.matches) contents.open = false;
});
form.hidden = false;

function clearHighlights() {
  for (const mark of matches) mark.replaceWith(document.createTextNode(mark.textContent));
  content.normalize();
  matches = [];
  current = -1;
}

function selectMatch(index) {
  if (!matches.length) return;
  matches[current]?.classList.remove("current-match");
  current = (index + matches.length) % matches.length;
  matches[current].classList.add("current-match");
  matches[current].scrollIntoView({ block: "center" });
  status.textContent = `${current + 1} of ${matches.length} matches`;
}

search.addEventListener("input", () => {
  clearHighlights();
  const term = search.value.trim().toLowerCase();
  if (term) {
    const walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const value = node.textContent;
      const lower = value.toLowerCase();
      let start = 0;
      let at = lower.indexOf(term);
      if (at === -1) continue;
      const fragment = document.createDocumentFragment();
      while (at !== -1) {
        fragment.append(document.createTextNode(value.slice(start, at)));
        const mark = document.createElement("mark");
        mark.textContent = value.slice(at, at + term.length);
        fragment.append(mark);
        matches.push(mark);
        start = at + term.length;
        at = lower.indexOf(term, start);
      }
      fragment.append(document.createTextNode(value.slice(start)));
      node.replaceWith(fragment);
    }
  }
  previous.disabled = next.disabled = matches.length === 0;
  status.textContent = !term
    ? "Search these notes or use your browser’s Find command."
    : matches.length ? `${matches.length} matches. Press Enter or Next to jump.` : "No matches. Try another keyword.";
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  selectMatch(current + 1);
});
previous.addEventListener("click", () => selectMatch(current < 0 ? matches.length - 1 : current - 1));
search.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.shiftKey) {
    event.preventDefault();
    selectMatch(current < 0 ? matches.length - 1 : current - 1);
  }
  if (event.key === "Escape") {
    search.value = "";
    search.dispatchEvent(new Event("input"));
  }
});
