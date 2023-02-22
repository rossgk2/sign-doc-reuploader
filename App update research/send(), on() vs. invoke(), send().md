# `send()` and `on()`

#### preload.js (Preload Script)

```javascript
const { contextBridge, ipcRenderer } = require('electron')

ipcRenderer.on('asynchronous-reply', (_event, arg) => {
  console.log(arg);
})

contextBridge.exposeInMainWorld('electronAPI', {
    f3: (message) => ipcRenderer.send('asynchronous-message', message)
})
```

#### Subscribed to `app.whenReady()` of main script

```javascript
ipcMain.on('asynchronous-message', (event, arg) => {
  console.log(arg)
  event.reply('asynchronous-reply', 'pong')
})
```

#### Renderer script:

```
window.electronAPI.f3('ping');
```

### Control flow

- The renderer script executes and `ipcRenderer.send('asynchronous-message', 'ping')` is called
- The event handler registered by `ipcMain.on()` fires. It prints `'ping'` to the console and then issues a response to `ipcRenderer`.
- The event handler registered by `ipcRenderer.on()` fires. It prints `pong` to the console.

# `invoke()` and `send()`

#### Preload script

```
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  f3: () => ipcRenderer.invoke('f2')
})
```

#### Subscribed to `app.whenReady()` of main script

```
async function f1() { return {'data': '01234abc'}; }
ipcMain.handle('f2', f1)
```

#### Renderer script

```
const result = await window.electronAPI.f3();
console.log(result.data); // prints '01234abc'
```