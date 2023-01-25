import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ProxyDebug implements HttpInterceptor {
  private proxy: any = {
    '/oauth-api/.*':  'https://secure.na1.adobesignstage.us/api/gateway/adobesignauthservice', // the proxy. the regex .* is equivalent to the proxy syntax **
    '^/oauth-api': '' // the rewrite rule
  };

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('-api')) { // convention is that a URL is proxied iff it contains '-api'
      console.log('URL before proxying:', req.url);
      return next.handle(req);
    }
  }

  applyProxy(url: string): string {
    let proxyUrl = url;
    Object.keys(this.proxy).forEach(key => {
      proxyUrl = proxyUrl.replace(new RegExp(key), this.proxy[key]);
    });
    return proxyUrl;
  }
}