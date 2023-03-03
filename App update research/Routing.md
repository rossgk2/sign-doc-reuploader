- configure Angular routes as usual
- in the main process, listen for the relevant event to fire. when it does, `mainWindow.webContents.send("navigate-console", r)`, where `r` is the route for the console component
- change app.component.ts to this:

```typescript
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ipcRenderer } from 'electron';

@Component({...})
export class AppComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    ipcRenderer.on('navigate', (event, url) => {
      this.router.navigateByUrl(url);
    });
  }
}
```

# Changing route upon redirect intercept

## Current behavior

- Electron app starts

- `ngOnInit()` invoked, event handler for "navigate" channel registered, "login" component loaded

- User logs in and is redirected to https://migrationtool.com; "login" component destroyed

- Electron main process intercepts redirect, cancels it, and sends message to "navigate" channel of renderer process

- `ngOnInit()` invoked, event handler for "navigate" channel registered- message not received because it's too late!

## Behavior to implement

- Electron app starts

- `ngOnInit()` invoked, the message `true` is sent to "renderer-init-done" channel of Electron main process
- **Add `ngOnDestroy()` to login.component.ts, and within it, send the message `false` to "renderer-init-done"**

- User logs in and is redirected to https://migrationtool.com; "login" component destroyed, **and as a result, `false` is sent to "renderer-init-done" channel of Electron main process** 
- **Maintain a boolean field `redirected = true` in Electron main process that's initialized to `false`**

- Electron main process intercepts redirect, **sets `redirected = true`**, cancels the redirect, and reloads Angular app

- `ngOnInit()` invoked, the message `true` is sent to "renderer-init-done" channel of Electron main process
- When the "renderer-init-done" channel of the Electron main process fires, add the following code:

```js
if (redirected) {
	const currentWindow = BrowserWindow.getFocusedWindow();
	currentWindow.webContents.send("navigate", "/migration-console");
}
```

