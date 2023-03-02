- configure routes as usual
- in the main process, listen for the relevant event to fire. when it does, `mainWindow.webContents.send("navigate-console", r)`, where `r` is the route for the console component
- change app.module.ts to this:

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

