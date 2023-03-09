import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private router: Router) { }

  ngOnInit() {
    /* See preload.ts for the definitions of the functions from api. */

    /* Send a message to the Electron main process indicating that the Angular app has loaded. */
    (<any> window).api.notifyIsRendererInitDone();

    /* When the Electron main process recieves the notification sent in the above,
    it sends a message back that, when recieved, results in the invocation of the
    below defined callback function. The message includes a url argument that is
    passed to the callback. */
    (<any> window).api.onNavigate((event: any, url: string) => { this.router.navigateByUrl(url); });
  }
}
