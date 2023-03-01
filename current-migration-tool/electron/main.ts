const {app, BrowserWindow, ipcMain} = require('electron');
const url = require("url");
const path = require("path");
const axios = require("axios").default;

/* Functions to be exposed to renderer via preload.ts. */

async function httpRequest(event, requestConfig) {
  return (await axios(requestConfig)).data;
}

function loadUrl(event, url) {
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

  /* Loads the renderer process (i.e. the Angular scripts) only after "did-finish-load" emits.
  This prevents us from getting "is not a function" errors when using functions exposed from Electron
  in Angular scripts.
  
  AppModule is the main module of the Angular app. */
  mainWindow.webContents.on("did-finish-load", function() {
    const jsCode = `document.addEventListener('DOMContentLoaded', function() { 
      platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err)); });`
    mainWindow.webContents.executeJavaScript(jsCode);
  });
}

app.whenReady().then(function() {  
  ipcMain.handle("httpRequest1", httpRequest);
  ipcMain.handle("loadUrl1", loadUrl);
  ipcMain.handle("getCurrentUrl1", getCurrentUrl);
  createWindow();
})

app.on('window-all-closed', function () {
  if (process.platform !== "darwin") app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});