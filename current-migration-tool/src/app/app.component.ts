import {Component, OnInit} from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private router: Router) { }

  ngOnInit() {
    console.log(`ngOnInit() from app.module.ts called at time ${Date.now()}.`);
    /* onNavigate() is exposed in preload.ts. */
    (<any> window).api.onNavigate((event: any, url: string) => { console.log('yayayayaya'); this.router.navigateByUrl(url); });
  }
}
