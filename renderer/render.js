let tabs = [];
let activeTab = 0;

const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const tabsDiv = document.getElementById('tabs');

// 🔹 Gestion des onglets
function renderTabs() {
  tabsDiv.innerHTML = '';
  tabs.forEach((tab, i) => {
    const btn = document.createElement('button');
    btn.textContent = tab.title;
    btn.onclick = () => switchTab(i);
    tabsDiv.appendChild(btn);
  });
}

function switchTab(index) {
  activeTab = index;
  editor.value = tabs[index].content;
  renderMarkdown();
}
function renderMarkdown() {
  // certaines versions utilisent marked.parse()
  const html = (typeof marked === "function") 
    ? marked(editor.value) 
    : marked.parse(editor.value);

  preview.innerHTML = html;

  if (tabs[activeTab]) tabs[activeTab].content = editor.value;
}

// 🔹 Toolbar actions
document.getElementById('btn-new').onclick = () => {
  tabs.push({ title: 'Nouvelle Note', content: '' });
  renderTabs();
  switchTab(tabs.length - 1);
};

// 🔹 Import fichiers pour le Web
document.getElementById('btn-import').onclick = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.txt,.md';
  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      tabs.push({ title: file.name, content: reader.result });
      renderTabs();
      switchTab(tabs.length - 1);
    };
    reader.readAsText(file);
  };
  input.click();
};

// 🔹 Sauvegarde fichiers pour le Web
document.getElementById('btn-save').onclick = () => {
  const tab = tabs[activeTab];
  if (!tab) return;
  const blob = new Blob([tab.content], { type: 'text/markdown' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = tab.title + '.md';
  a.click();
  URL.revokeObjectURL(a.href);
};

// 🔹 Markdown live preview
editor.addEventListener('input', renderMarkdown);

// 🔹 Créer un onglet initial
tabs.push({ title: 'Nouvelle Note', content: '' });
renderTabs();
switchTab(0);
