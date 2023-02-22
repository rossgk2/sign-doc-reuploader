# [nginx install](http://nginx.org/en/docs/windows.html) for Windows

- Download the latest "mainline version" for Windows, e.g. nginx/Windows-1.23.3. Unarchive the downloaded .zip to obtain a folder named nginx-&lt;*version*&gt; (e.g. nginx-1.23.3).
- To run the server,`cd` into nginx-&lt;*version*&gt; and run `start nginx`. Then run `tasklist /fi "imagename eq nginx.exe"`. A table with two entries should be the response:

```
C:\nginx-1.23.3>tasklist /fi "imagename eq nginx.exe"

Image Name           PID Session Name     Session#    Mem Usage
=============== ======== ============== ========== ============
nginx.exe            652 Console                 0      2 780 K
nginx.exe           1332 Console                 0      3 112 K
```

# Configuring and using nginx

- https://www.devdungeon.com/content/deploy-angular-apps-nginx
- Has sections called "Configuration File's Structure" and "Setting Up a Simple Proxy Server": http://nginx.org/en/docs/beginners_guide.html#conf_structure

# Docker

- troubleshooting frozen Docker
  - What worked for me was a combination of [switching to Windows containers](https://stackoverflow.com/a/75105105), [force quitting Docker with Powershell](https://forums.docker.com/t/shutting-down-docker-desktop-on-windows-10-programmatically/107395) via `Stop-Process -Name 'Docker Desktop'` as needed, and restarting my machine multiple times.

- https://dev.to/ritesh4u/deploy-angular-application-with-nginx-and-docker-3jf6
- https://medium.com/bb-tutorials-and-thoughts/how-to-serve-angular-application-with-nginx-and-docker-3af45be5b854#:~:text=NGINX%20can%20be%20used%20as,used%20as%20the%20container%20runtime.