const { contextBridge, ipcRenderer } = require("electron")
const fs = require("fs"); // for testing only; delete later


contextBridge.exposeInMainWorld("api", { 
  httpRequest2: (requestConfig) => ipcRenderer.invoke("httpRequest1", requestConfig),
  loadUrl2: (url) => ipcRenderer.invoke("loadUrl1", url),
    
  notifyIsRendererInitDone: () => ipcRenderer.send("renderer-init-done"),
  onNavigate: (callback) => ipcRenderer.on("navigate", callback),

  notifyIsConsoleInitStarted: () => ipcRenderer.send("console-init-started"),
  onConsoleInitFinish: (callback) => ipcRenderer.on("console-init-finish", callback),

  writeFileSync: (pdfBlob) => fs.writeFileSync(`test.pdf`, pdfBlob)
});