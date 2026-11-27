const USERNAME = "xerot407";

// Section order: security tools first, then apps, then learning projects
const CATEGORY = {
  "advanced-dork-gen": 0,
  "port-scanning": 0,
  "offlinepaswordstrengthchecker": 0,
  "passwordstrengthchecker": 0,
  "university-cafe-": 1,
  "personal-expense-tracker-": 1
};
const FEATURED = "advanced-dork-gen";

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

const grid = document.getElementById("repo-grid");
const key = repo => repo.name.toLowerCase();

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function card(repo) {
  const item = el("article", "card");
  if (key(repo) === FEATURED) item.classList.add("featured");

  if (repo.language) item.append(el("span", "lang", repo.language));

  const link = el("a", "name", repo.name);
  link.href = repo.html_url;
  link.target = "_blank";
  link.rel = "noopener";
  item.append(link);

  item.append(el("p", "", repo.description || "No description yet."));

  if (repo.pushed_at) {
    const date = new Date(repo.pushed_at).toLocaleDateString("en", { month: "short", year: "numeric" });
    item.append(el("span", "meta", `Updated ${date}`));
  }
  return item;
}

function render(repos) {
  const rank = r => (key(r) === FEATURED ? -1 : (CATEGORY[key(r)] ?? 2));
  const sorted = [...repos].sort((a, b) => rank(a) - rank(b)); // stable, keeps newest-first inside each rank
  grid.replaceChildren(...sorted.map(card));
  document.getElementById("plate-repos").textContent = repos.length;
}

async function load() {
  let repos;
  try {
    const res = await fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100&sort=pushed`);
    if (!res.ok) throw new Error(res.status);
    repos = (await res.json()).filter(r => !r.fork);
  } catch (err) {
    repos = FALLBACK;
  }
  render(repos);
}

load();
document.getElementById("year").textContent = new Date().getFullYear();