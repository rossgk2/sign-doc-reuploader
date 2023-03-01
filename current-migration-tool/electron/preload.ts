const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("api", { 
  httpRequest2: (requestConfig) => ipcRenderer.invoke("httpRequest1", requestConfig),
  redirect2: (url) => ipcRenderer.invoke("redirect1", url),
  getCurrentUrl2: () => ipcRenderer.invoke("getCurrentUrl1")
});