# Electron tutorial

There are two main processes in Electron.

- The *main* process is modified by editing whatever .js file is specified as the argument of "main" in package.json
- The *renderer* process is modified by editing whatever .js file is referenced in a `<script>` tag in the HTML

##  [Using preload scripts](https://www.electronjs.org/docs/latest/tutorial/tutorial-preload)

Most of the interesting content in the tutorial is in the section "Using Preload Scripts". A preload script can be used to expose properties from the main process to the renderer.

- Using the code `contextBridge.exposeInMainWorld('rVar', mVar)` in the preload script exposes the variable `mVar` from the main world with to the renderer, with alias `rVar` in the renderer
- Using the code `contextBridge.exposeInMainWorld('f3', 'f2')` in the preload script specifies that when `f3` is called in the renderer process, `f2` should be called by the interprocess communication. Using `ipcMain.handle('f2', f1)`  in the main process then specifies that whenever the interprocess communication calls a function `f2`, the function `f1` (defined somewhere in the main process) should be called instead. So, if all this configuration is set up, then `fn3` calls `f2`, which calls `f1`.


