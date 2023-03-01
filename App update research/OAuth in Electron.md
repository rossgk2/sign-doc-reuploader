1. Generate auth grant request URL in Angular. Call it `url`. Have user click on link and set `loadUrl(url)` as the response to the click event.
2. 
3. 
4. Send this URL to the Electron main process.
5. Receive URL in Electron main process and call mainWindow.loadURL() on it.