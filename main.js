const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,      // permet require() dans le renderer
      contextIsolation: false  
    },
  });

  win.loadFile("renderer/index.html");
}

// ✅ Les handlers doivent être au niveau global
ipcMain.handle("import-file", async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: "Ouvrir un fichier texte",
      filters: [{ name: "Text Files", extensions: ["txt", "md"] }],
      properties: ["openFile"],
    });

    if (canceled || filePaths.length === 0) return ""; // aucun fichier choisi

    const content = fs.readFileSync(filePaths[0], "utf-8");
    return content;
  } catch (err) {
    console.error("Erreur lors de l'import :", err);
    return "";
  }
});


ipcMain.handle("save-file", async (event, content) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    filters: [{ name: "Text Files", extensions: ["txt", "md"] }],
  });

  if (!canceled && filePath) {
    fs.writeFileSync(filePath, content, "utf-8");
    return true;
  }
  return false;
});

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
