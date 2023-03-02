const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("api", { 
  httpRequest2: (requestConfig) => ipcRenderer.invoke("httpRequest1", requestConfig),
  loadUrl2: (url) => ipcRenderer.invoke("loadUrl1", url),
  getCurrentUrl2: () => ipcRenderer.invoke("getCurrentUrl1"),
  onNavigate: (callback) => ipcRenderer.on("navigate", callback)
});