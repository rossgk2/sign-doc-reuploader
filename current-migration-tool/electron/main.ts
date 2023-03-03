const {app, BrowserWindow, ipcMain, session} = require('electron');
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

/* Loads the index.html file into the window win. */
function loadIndexHtml(win) {
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `../dist/migration-tool/index.html`),
      protocol: "file:",
      slashes: true
    })
  );
}

/* Configures the window win so that the renderer process (i.e. the Angular scripts) is loaded
 only after "DOMContentLoaded" occurs. This prevents us from getting "is not a function" errors
 when using functions exposed from Electron in Angular scripts. */
function configLoadRendererAfterDOMContentLoaded(win) {
  win.webContents.on("dom-ready", function() {
    const jsCode = `document.addEventListener('DOMContentLoaded', function() { 
      platformBrowserDynamic().bootstrapModule(AppModule).catch(err => console.error(err)); });`
    win.webContents.executeJavaScript(jsCode);
  });
}

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.ts"),
      nodeIntegration: true //necessary?
    }
  });

  mainWindow.on("closed", function () { mainWindow = null });
  configLoadRendererAfterDOMContentLoaded(mainWindow);
  loadIndexHtml(mainWindow);
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(function() {  
  ipcMain.handle("httpRequest1", httpRequest);
  ipcMain.handle("loadUrl1", loadUrl);
  ipcMain.handle("getCurrentUrl1", getCurrentUrl);

  /* Configure handling of redirect from OAuth to https://migrationtool.com by canceling
  the redirect and manually loading index.html. */
  const filter = { urls: ['https://migrationtool.com/*'] };
  session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
    // send details.url to renderer process; extract state and code from it there
    console.log(`redirect to migrationtool.com intercepted at time ${Date.now()}.`);
    console.log(details.url);
    callback({ cancel: true });
    console.log(`callback({cancel: true}) finished executing at time ${Date.now()}`);
    const currentWindow = BrowserWindow.getFocusedWindow();
    configLoadRendererAfterDOMContentLoaded(currentWindow);
    currentWindow.webContents.send("navigate", "/migration-console"); // use the "migration-console" route when loading index.html
    console.log(`sent message to "navigate at time ${Date.now()}`);

    loadIndexHtml(currentWindow);
  });

  createWindow();
})

app.on('window-all-closed', function () {
  if (process.platform !== "darwin") app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});