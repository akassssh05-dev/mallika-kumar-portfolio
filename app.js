const contentPath = "content/profile.json";

const byId = (id) => document.getElementById(id);

function setText(selector, value) {
  document.querySelectorAll(selector).forEach((node) => {
    node.textContent = value || "";
  });
}

function createListItem(item) {
  const article = document.createElement("article");
  article.className = "list-item";
  const title = document.createElement("h3");
  const description = document.createElement("p");
  title.textContent = item.title || "";
  description.textContent = item.description || "";
  article.append(title, description);
  return article;
}

function createCard(item) {
  const article = document.createElement("article");
  article.className = "card";
  const title = document.createElement("h3");
  const description = document.createElement("p");
  title.textContent = item.title || "";
  description.textContent = item.description || "";
  article.append(title, description);
  return article;
}

function createTimelineItem(item) {
  const article = document.createElement("article");
  article.className = "timeline-item";
  const year = document.createElement("div");
  const body = document.createElement("div");
  const title = document.createElement("h3");
  const description = document.createElement("p");
  year.className = "timeline-year";
  year.textContent = item.year || "";
  title.textContent = item.title || "";
  description.textContent = item.description || "";
  body.append(title, description);
  article.append(year, body);
  return article;
}

function renderCollection(id, items, renderer) {
  const root = byId(id);
  root.replaceChildren(...(items || []).map(renderer));
}

async function loadContent() {
  const response = await fetch(contentPath, { cache: "no-store" });
  if (!response.ok) throw new Error(`Unable to load ${contentPath}`);
  return response.json();
}

loadContent()
  .then((profile) => {
    document.title = `${profile.name} | Portfolio`;
    setText('[data-field="name"]', profile.name);
    setText('[data-field="eyebrow"]', profile.eyebrow);
    setText('[data-field="title"]', profile.title);
    byId("bio").textContent = profile.bio;

    if (profile.profileImage) {
      byId("hero-photo").src = profile.profileImage;
      byId("hero-photo").alt = profile.name;
    }

    if (profile.resumeFile) {
      byId("resume-link").href = profile.resumeFile;
    } else {
      byId("resume-link").style.display = "none";
    }

    byId("impact").replaceChildren(
      ...(profile.stats || []).map((stat) => {
        const div = document.createElement("div");
        div.className = "stat";
        const value = document.createElement("strong");
        const label = document.createElement("span");
        value.textContent = stat.value || "";
        label.textContent = stat.label || "";
        div.append(value, label);
        return div;
      })
    );

    renderCollection("roles-list", profile.roles, createListItem);
    renderCollection("engagements-list", profile.engagements, createTimelineItem);
    renderCollection("initiatives-list", profile.initiatives, createCard);
    renderCollection("awards-list", profile.awards, createListItem);
    renderCollection("research-list", profile.research, createCard);
  })
  .catch((error) => {
    console.error(error);
    byId("bio").textContent = "Portfolio content could not be loaded.";
  });

byId("year").textContent = new Date().getFullYear();

document.querySelector(".nav-toggle").addEventListener("click", (event) => {
  const nav = document.querySelector(".site-nav");
  const isOpen = nav.classList.toggle("open");
  event.currentTarget.setAttribute("aria-expanded", String(isOpen));
});
