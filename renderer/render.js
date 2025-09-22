import { marked } from '../node_modules/marked/lib/marked.esm.js';
const { ipcRenderer } = require('electron');

// DOM elements
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const tabsContainer = document.getElementById("tabs");
const btnNew = document.getElementById("btn-new");
const btnImport = document.getElementById("btn-import");
const btnSave = document.getElementById("btn-save");

// Multi-tabs
let tabs = [];
let activeTabId = null;
let nextTabId = 1;

function renderTabs() {
  tabsContainer.innerHTML = "";
  tabs.forEach(tab => {
    const tabEl = document.createElement("div");
    tabEl.classList.add("tab");
    if(tab.id === activeTabId) tabEl.classList.add("active");
    tabEl.textContent = tab.title;
    tabEl.onclick = () => switchTab(tab.id);
    tabsContainer.appendChild(tabEl);
  });
}

function switchTab(id) {
  activeTabId = id;
  const tab = tabs.find(t => t.id === id);
  editor.value = tab.content;
  updatePreview();
  renderTabs();
}

function createTab(title = "Sans titre", content = "", filePath = null) {
  const id = nextTabId++;
  tabs.push({ id, title, content, filePath });
  activeTabId = id;
  editor.value = content;
  updatePreview();
  renderTabs();
}

// Markdown preview
function updatePreview() {
  preview.innerHTML = marked(editor.value);
}

// Editor input
editor.addEventListener("input", () => {
  if (!activeTabId) return;
  const tab = tabs.find(t => t.id === activeTabId);
  tab.content = editor.value;
  updatePreview();
});

// Buttons
btnNew.addEventListener("click", () => createTab());
btnImport.addEventListener("click", async () => {
  const content = await ipcRenderer.invoke('import-file');
  if(content !== "") createTab("Fichier importé", content);
});
btnSave.addEventListener("click", async () => {
  if(!activeTabId) return;
  const tab = tabs.find(t => t.id === activeTabId);
  tab.content = editor.value;
  await ipcRenderer.invoke('save-file', tab.content);
});

// Create initial tab
createTab();
