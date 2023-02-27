const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("versions", {
  node: () => process.versions.node,
  chrome: () => process.versions.chrome,
  electron: () => process.versions.electron,
  // we can also expose variables, not just functions
});

contextBridge.exposeInMainWorld("api", { 
  request2: (requestConfig) => ipcRenderer.invoke("request1", requestConfig)
});