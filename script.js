const USERNAME = "xerot407";

// Which section each repo belongs to (anything not listed goes to "learning")
const CATEGORY = {
  "advanced-dork-gen": "security",
  "port-scanning": "security",
  "offlinepaswordstrengthchecker": "security",
  "passwordstrengthchecker": "security",
  "university-cafe-": "apps",
  "personal-expense-tracker-": "apps"
};
const FEATURED = "advanced-dork-gen";

const GROUPS = [
  { id: "security", title: "Security tools", note: "Scanners, generators and checkers for testing and defending." },
  { id: "apps", title: "Apps and systems", note: "Complete programs that solve an everyday problem." },
  { id: "learning", title: "Learning lab", note: "Practice projects and notes from along the way." }
];

// Used if GitHub can't be reached (offline or rate limited)
const FALLBACK = [
  ["Advanced-Dork-Gen", "TypeScript", "A Google dork generator tool."],
  ["Port-Scanning", "Python", "Port scanning in Python."],
  ["offlinepaswordstrengthchecker", "Python", "Password strength checker that works offline."],
  ["passwordStrengthChecker", "PowerShell", "Password strength checker in PowerShell."],
  ["University-Cafe-", "Python", "A university cafe ordering system."],
  ["personal-expense-tracker-", "Python", "Track personal expenses."],
  ["AI-Prompt-History", "JavaScript", "A record of AI prompts."],
  ["learn_demo", "HTML", "HTML practice project."],
  ["netoworking", null, "Networking notes."]
].map(([name, language, description]) => ({
  name, language, description, html_url: `https://github.com/${USERNAME}/${name}`
}));

const root = document.getElementById("repo-groups");
const count = document.getElementById("repo-count");
const filters = document.getElementById("filters");
let repos = [];
let active = "all";

const catOf = repo => CATEGORY[repo.name.toLowerCase()] || "learning";

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function chip(repo, index) {
  const card = el("article", "chip");
  card.style.setProperty("--i", index);
  if (repo.name.toLowerCase() === FEATURED) card.classList.add("featured");

  card.append(el("span", "notch"));
  if (repo.language) card.append(el("span", "lang", repo.language));

  const link = el("a", "name", repo.name);
  link.href = repo.html_url;
  link.target = "_blank";
  link.rel = "noopener";
  card.append(link);

  card.append(el("p", "", repo.description || "No description yet."));

  if (repo.pushed_at) {
    const date = new Date(repo.pushed_at).toLocaleDateString("en", { month: "short", year: "numeric" });
    card.append(el("span", "meta", `Updated ${date}`));
  }
  return card;
}

function render() {
  root.replaceChildren();
  GROUPS.filter(g => active === "all" || g.id === active).forEach(group => {
    const items = repos.filter(r => catOf(r) === group.id);
    if (!items.length) return;

    // Featured project goes first in its section
    items.sort((a, b) => (b.name.toLowerCase() === FEATURED) - (a.name.toLowerCase() === FEATURED));

    const section = el("div", "group");
    const head = el("div", "group-head");
    head.append(el("h3", "", group.title), el("span", "count", items.length === 1 ? "1 project" : `${items.length} projects`));
    section.append(head, el("p", "group-note", group.note));

    const grid = el("div", "chips");
    items.forEach((r, i) => grid.append(chip(r, i)));
    section.append(grid);
    root.append(section);
  });
}

filters.addEventListener("click", e => {
  const btn = e.target.closest("button");
  if (!btn) return;
  active = btn.dataset.filter;
  filters.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", String(b === btn)));
  render();
});

async function load() {
  try {
    const res = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed`);
    if (!res.ok) throw new Error(res.status);
    repos = (await res.json()).filter(r => !r.fork);
  } catch (err) {
    repos = FALLBACK;
  }
  count.textContent = `${repos.length} projects on GitHub, newest first.`;
  render();
}

load();
document.getElementById("year").textContent = new Date().getFullYear();