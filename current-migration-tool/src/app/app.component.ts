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
    /* See preload.ts for the definitions of these functions. */
    (<any> window).api.notifyIsRendererInitDone();
    (<any> window).api.onNavigate((event: any, url: string) => { this.router.navigateByUrl(url); });
  }
}
