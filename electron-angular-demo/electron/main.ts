const {app, BrowserWindow, ipcMain} = require('electron');
const url = require("url");
const path = require("path");
const axios = require("axios").default;

async function handleRequest(event, requestConfig) {
  console.log("handleRequest() called.");
  return (await axios(requestConfig)).data;
}

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
      pathname: path.join(__dirname, `../dist/electron-angular-demo/index.html`),
      protocol: "file:",
      slashes: true
    })
  );

  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () { mainWindow = null });
}

app.whenReady().then(function() {  
  ipcMain.handle("request1", handleRequest);
  createWindow();
})

app.on('window-all-closed', function () {
  if (process.platform !== "darwin") app.quit();
});

app.on('activate', function () {
  if (mainWindow === null) createWindow();
});