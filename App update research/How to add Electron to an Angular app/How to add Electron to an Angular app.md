# How to add Electron to an Angular app

1. `cd angular-app`
2. `npm install electron --save-dev`
3. `npm install axios`
4. Copy the electron folder that's in the same folder as this .md file into `angular-app`.
   1. Modify the `pathname` in the call to `mainWindow.loadURL()` so that it points to the `index.html` file that will be built by the Angular build process.
5. Modify `package.json` so that said JSON has these properties:
   1. `main: "./electron/main.ts"`
   2. `scripts.start: "ng build --base-href . && electron ."`
6. `cd angular-app` and `npm start` to confirm that Electron works.

## Using Electron's node process to call APIs in Angular app

Consider `preload.ts` and `main.ts` that contain the following:

```js
// preload.ts
contextBridge.exposeInMainWorld("api", { 
  request2: (requestConfig) => ipcRenderer.invoke("request1", requestConfig)
});

// main.ts
const {ipcMain} = require('electron');
const axios = require("axios").default;

async function handleRequest(event, requestConfig) {
  return (await axios(requestConfig)).data;
}

app.whenReady().then(function() {  
  ipcMain.handle("request1", handleRequest);
  createWindow(); // createWindow() implemented elsewhere in file
})
```

To achieve the result of calling `handleRequest()` in Angular code (e.g. an Angular component `.ts` file), just write code such as

```js
const result = (<any>window).request2;
```

