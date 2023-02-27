const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("api", { 
  request2: (requestConfig) => ipcRenderer.invoke("request1", requestConfig)
});