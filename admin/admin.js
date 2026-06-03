const owner = "akassssh05-dev";
const repo = "mallika-kumar-portfolio";
const branch = "main";
const profilePath = "content/profile.json";
const siteBase = "/mallika-kumar-portfolio";
const apiBase = `https://api.github.com/repos/${owner}/${repo}/contents`;

const tokenInput = document.getElementById("token");
const loginPanel = document.getElementById("login-panel");
const editorPanel = document.getElementById("editor-panel");
const form = document.getElementById("profile-form");
const statusBox = document.getElementById("status");
let token = localStorage.getItem("portfolioAdminToken") || "";
let profileSha = "";
let profile = {};

function setStatus(message, isError = false) {
  statusBox.textContent = message;
  statusBox.classList.toggle("error", isError);
}

function headers() {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

function decodeBase64(value) {
  const binary = atob(value.replace(/\n/g, ""));
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

async function githubGet(path) {
  const response = await fetch(`${apiBase}/${path}?ref=${branch}`, { headers: headers() });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

async function githubPut(path, content, message, sha) {
  const body = { message, content, branch };
  if (sha) body.sha = sha;
  const response = await fetch(`${apiBase}/${path}`, {
    method: "PUT",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

function fieldLabel(name) {
  return name.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase());
}

function createRow(listName, fields, item = {}) {
  const row = document.createElement("div");
  row.className = "repeater-row";
  const fieldWrap = document.createElement("div");
  fieldWrap.className = "row-fields";

  fields.forEach((field) => {
    const label = document.createElement("label");
    const input = field === "description" ? document.createElement("textarea") : document.createElement("input");
    input.dataset.list = listName;
    input.dataset.field = field;
    input.value = item[field] || "";
    if (field === "description") input.rows = 3;
    label.textContent = fieldLabel(field);
    label.append(input);
    fieldWrap.append(label);

    if (listName === "researchPapers" && field === "fileUrl") {
      const uploadLabel = document.createElement("label");
      const upload = document.createElement("input");
      upload.type = "file";
      uploadLabel.textContent = "Upload Research Paper";
      upload.addEventListener("change", () => {
        uploadResearchPaper(upload.files[0], input).catch((error) => {
          setStatus(`Upload failed: ${error.message}`, true);
        });
      });
      uploadLabel.append(upload);
      fieldWrap.append(uploadLabel);
    }

    if (listName === "gallery" && field === "imageUrl") {
      const uploadLabel = document.createElement("label");
      const upload = document.createElement("input");
      upload.type = "file";
      upload.accept = "image/*";
      uploadLabel.textContent = "Upload Gallery Image";
      upload.addEventListener("change", () => {
        uploadGalleryImage(upload.files[0], input).catch((error) => {
          setStatus(`Upload failed: ${error.message}`, true);
        });
      });
      uploadLabel.append(upload);
      fieldWrap.append(uploadLabel);
    }
  });

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "remove";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => row.remove());

  row.append(fieldWrap, remove);
  return row;
}

function renderRepeater(root, items = []) {
  const listName = root.dataset.list;
  const fields = root.dataset.fields.split(",");
  root.className = "repeater";
  root.replaceChildren();

  const header = document.createElement("div");
  header.className = "repeater-header";
  const title = document.createElement("h2");
  const add = document.createElement("button");
  title.textContent = fieldLabel(listName);
  add.type = "button";
  add.textContent = `Add ${fieldLabel(listName).replace(/s$/, "")}`;
  add.addEventListener("click", () => root.append(createRow(listName, fields)));
  header.append(title, add);
  root.append(header);

  items.forEach((item) => root.append(createRow(listName, fields, item)));
}

function fillForm() {
  ["name", "eyebrow", "title", "bio"].forEach((field) => {
    form.elements[field].value = profile[field] || "";
  });

  document.querySelectorAll("[data-list][data-fields]").forEach((root) => {
    renderRepeater(root, profile[root.dataset.list] || []);
  });
}

function collectList(listName) {
  const rows = [...document.querySelectorAll(`[data-list="${listName}"][data-field]`)].reduce((groups, input) => {
    const row = input.closest(".repeater-row");
    if (!groups.has(row)) groups.set(row, {});
    groups.get(row)[input.dataset.field] = input.value.trim();
    return groups;
  }, new Map());

  return [...rows.values()].filter((item) => Object.values(item).some(Boolean));
}

function collectProfile() {
  const updated = { ...profile };
  ["name", "eyebrow", "title", "bio"].forEach((field) => {
    updated[field] = form.elements[field].value.trim();
  });
  ["stats", "roles", "engagements", "initiatives", "awards", "research", "researchPapers", "gallery"].forEach((listName) => {
    updated[listName] = collectList(listName);
  });
  return updated;
}

async function loadProfile() {
  setStatus("Loading profile from GitHub...");
  const data = await githubGet(profilePath);
  profileSha = data.sha;
  profile = JSON.parse(decodeBase64(data.content));
  fillForm();
  loginPanel.classList.add("hidden");
  editorPanel.classList.remove("hidden");
  setStatus("Ready.");
}

async function saveProfile(event) {
  event.preventDefault();
  try {
    setStatus("Saving profile to GitHub...");
    profile = collectProfile();
    const result = await githubPut(
      profilePath,
      encodeBase64(`${JSON.stringify(profile, null, 2)}\n`),
      "Update portfolio content from admin",
      profileSha
    );
    profileSha = result.content.sha;
    setStatus("Saved. GitHub Pages will update in a minute.");
  } catch (error) {
    setStatus(`Save failed: ${error.message}`, true);
  }
}

async function uploadFile(file, folder, profileField) {
  if (!file) return;
  setStatus(`Uploading ${file.name}...`);
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const safeName = file.name.replace(/[^a-z0-9._-]+/gi, "-");
  const path = `${folder}/${Date.now()}-${safeName}`;
  await githubPut(path, btoa(binary), `Upload ${file.name} from admin`);
  profile[profileField] = `${siteBase}/${path}`;
  fillForm();
  setStatus(`${file.name} uploaded. Click Save to publish the new link.`);
}

async function uploadResearchPaper(file, input) {
  if (!file) return;
  setStatus(`Uploading ${file.name}...`);
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const safeName = file.name.replace(/[^a-z0-9._-]+/gi, "-");
  const path = `uploads/files/research-papers/${Date.now()}-${safeName}`;
  await githubPut(path, btoa(binary), `Upload research paper ${file.name} from admin`);
  input.value = `${siteBase}/${path}`;
  setStatus(`${file.name} uploaded. Click Save to publish this paper.`);
}

async function uploadGalleryImage(file, input) {
  if (!file) return;
  setStatus(`Uploading ${file.name}...`);
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  const safeName = file.name.replace(/[^a-z0-9._-]+/gi, "-");
  const path = `uploads/images/gallery/${Date.now()}-${safeName}`;
  await githubPut(path, btoa(binary), `Upload gallery image ${file.name} from admin`);
  input.value = `${siteBase}/${path}`;
  setStatus(`${file.name} uploaded. Click Save to publish this gallery item.`);
}

document.getElementById("login").addEventListener("click", async () => {
  token = tokenInput.value.trim();
  if (!token) {
    setStatus("Enter a GitHub token first.", true);
    return;
  }
  localStorage.setItem("portfolioAdminToken", token);
  try {
    await loadProfile();
  } catch (error) {
    localStorage.removeItem("portfolioAdminToken");
    setStatus(`Login failed: ${error.message}`, true);
  }
});

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("portfolioAdminToken");
  window.location.reload();
});

document.getElementById("image-upload").addEventListener("change", (event) => {
  uploadFile(event.target.files[0], "uploads/images", "profileImage").catch((error) => {
    setStatus(`Upload failed: ${error.message}`, true);
  });
});

document.getElementById("file-upload").addEventListener("change", (event) => {
  uploadFile(event.target.files[0], "uploads/files", "resumeFile").catch((error) => {
    setStatus(`Upload failed: ${error.message}`, true);
  });
});

form.addEventListener("submit", saveProfile);

if (token) {
  loadProfile().catch(() => {
    localStorage.removeItem("portfolioAdminToken");
  });
}
