1. Generate `authGrantRequest` in Angular. Have user click on link and set `loadUrl(authGrantRequest.url)` as the response to the click event. User logs in and then is redirected to https://migrationtooldev.com, which, due to the `hosts` file, is interpreted as https://localhost.com
2. Maintain a `boolean` field called `redirected` in the Angular component file

```
window.redirected: boolean = false;
```

1. In the Electron main process define the function 

```js
function loadIndexHtml(win) {
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `../dist/migration-tool/index.html`),
      protocol: "file:",
      slashes: true
    })
  );
}
```

Also add this code to the Electron main process:

```js
mainWindow.webContents.on('will-navigate', function (event, newUrl) {
    if (newUrl.includes(/* something */)) {
    	loadIndexHtml();
        // send a message to the renderer process that modifies the variable redirected to true
    }
});
```



- how to make sure update occurs before ngOnInit() called for the second time?
