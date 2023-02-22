# Electron tutorial

There are two main processes in Electron.

- The *main* process is modified by editing whatever .js file is specified as the argument of "main" in package.json
- The *renderer* process is modified by editing whatever .js file is referenced in a `<script>` tag in the HTML

##  [Using preload scripts](https://www.electronjs.org/docs/latest/tutorial/tutorial-preload)

Most of the interesting content in the tutorial is in the section "Using Preload Scripts". A preload script can be used to expose properties from the main process to the renderer.

- Using the code `contextBridge.exposeInMainWorld('rVar', mVar)` in the preload script exposes the variable `mVar` from the main world with to the renderer, with alias `rVar` in the renderer
- Using the code `contextBridge.exposeInMainWorld('f3', 'f2')` in the preload script specifies that when `f3` is called in the renderer process, `f2` should be called by the interprocess communication. Using `ipcMain.handle('f2', f1)`  in the main process then specifies that whenever the interprocess communication calls a function `f2`, the function `f1` (defined somewhere in the main process) should be called instead. So, if all this configuration is set up, then `fn3` calls `f2`, which calls `f1`.

# Outline for using Angular and Electron

## Considerations

- How often will we be sending a request from renderer to main? Seems like once per API request.
- Q: In the tutorial, `renderer.js` is recognized as the renderer script because `<script src="./renderer.js"></script>` is placed in the HTML. How can we use the appropriate .js file created by Angular's build process as the render script? The Angular build process produces many .js files; is there a single .js file that should be used, or somehow multiple?
  - A: The `renderer.js` script is associated with the HTML file through the ordinary web development construct that is the `<script>` tag. This means we don't specify which renderer script is used directly; we specify which renderer script is used by specifying which HTML file is the main HTML file. This is done by using either `win.loadFile()` or `win.loadURL()` in the `createWindow()` method of the main process.
    - A: Since our Angular app builds to an HTML file into which one or more JS files are injected via `<script>`, all we have to do to run our Angular app with Electron is point Electron to the appropriate Angular-built HTML file.

## Outline

Reference [this](https://buddy.works/tutorials/building-a-desktop-app-with-electron-and-angular) and [this](https://www.electronjs.org/docs/latest/tutorial/ipc) for guidance. Cory Coolguy's answer to [this SO post](https://stackoverflow.com/questions/57061723/how-does-postman-an-electron-app-get-around-cors) was helpful also.

1. Add an "awaitable" request-making function to the main process:

```js
app.whenReady().then(() => {
  const {net} = require('electron');
  async function makeRequest(event, url) {
      return new Promise((resolve, reject) => {
        const request = net.request(url);
        request.on('response', (response) => {
          let data = '';
          response.on('data', (chunk) => {
            data += chunk;
          });
          response.on('end', () => {
            resolve(data);
          });
        });
        request.on('error', (error) => {
          reject(error);
        });
        request.end();
      });
    }
  
  ipcMain.handle('request', makeRequest);
  createWindow();
}
```

2. Expose Electron's HTTP API to the renderer via preload script. Use a preload script like this:

```js
const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('request', (url) => ipcRenderer.invoke('request', url));
```

Don't forget to hook the preload script up to the app by adding this to the `createWindow()` function:

```js
webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
```

3. Use the function in the renderer script (i.e. Angular code) like this:

```js
const response = await window.electronAPI.request("https://example.com")
```

