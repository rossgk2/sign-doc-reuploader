const {app, BrowserWindow, ipcMain} = require('electron');
const url = require("url");
const path = require("path");
const axios = require("axios").default;

/* Functions to be exposed to renderer via preload.ts. */

async function httpRequest(event, requestConfig) {
  console.log("handleRequest() called");
  return (await axios(requestConfig)).data;
}

function redirect(event, url) {
  const currentWindow = BrowserWindow.getFocusedWindow();
  currentWindow.webContents.loadURL(url);
}

function getCurrentUrl(event) {
  const currentWindow = BrowserWindow.getFocusedWindow();
  return currentWindow.webContents.getURL();
}

/* Window setup. */

let mainWindow;

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.ts"),
      nodeIntegration: true //necessary?
    }
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, `../dist/migration-tool/index.html`),
      protocol: "file:",
      slashes: true
    })
  );

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () { mainWindow = null });
}

app.whenReady().then(function() {  
  ipcMain.handle("httpRequest1", httpRequest);
  ipcMain.handle("redirect1", redirect);
  ipcMain.handle("getCurrentUrl1", getCurrentUrl);
  createWindow();
})

app.on('window-all-closed', function () {
  if (process.platform !== "darwin") app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});