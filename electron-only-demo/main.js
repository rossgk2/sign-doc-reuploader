const { app, ipcMain, BrowserWindow } = require("electron");
const path = require("path");
const axios = require("axios").default;

async function handleRequest(event, requestConfig) {
  return (await axios(requestConfig)).data;
}

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    }
  });

  win.webContents.openDevTools() // Open the DevTools.

  win.loadFile("index.html");
}

app.whenReady().then(function() {  
  ipcMain.handle("request1", handleRequest);
  createWindow();
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})