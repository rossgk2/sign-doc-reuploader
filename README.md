# sign-doc-reuploader

## Dependencies

You need to have v16 of [node.js](https://nodejs.org/en/) installed.

## Install and run

There are two versions of this tool: a proof of concept command line tool and an Angular app. The Angluar app is still in development.

### Command line tool

1. [Download](https://github.com/rossgk2/sign-doc-reuploader/archive/refs/heads/main.zip) the zip of this repo and extract it.
2. Rename the extracted folder to something (e.g. `fldr`).
3. In a command prompt `cd` to `fldr`.
4. If running for the first time, execute `npm install`.
5. Execute `npx ts-node reuploader.ts` (not `node reuploader.ts`, since we're using TypeScript).

### Angular app

1. You don't need to do anything for this step; it's included for pedagogy. (Ensure the Angular app is hosted on port 443 by adding `"port" = 443` to `projects.<project>.architect.serve.options`, where `<project>` is the name of the associated Angular project.)
2. Follow the instructions of the below **Redirecting via the `hosts` file** section. Perform step (3) as described in the **Special case** subsection.
3. [Download](https://github.com/rossgk2/sign-doc-reuploader/archive/refs/heads/main.zip) the zip of this repo and extract it.
4. Rename the extracted folder to something (e.g. `fldr`).
5. In a command prompt `cd` to `fldr/sign-template-reuploader`.
6. (Possibly not necessary). If running for the first time, execute `npm install`.
7. Execute `ng serve --disableHostCheck true`. (We use `disableHostCheck` to allow traffic outside the local machine, i.e., traffic from the OAuth authentication server).
8. Navigate to https://localhost.

## Redirecting via the `hosts` file

1. Add the line `127.0.0.1 some.url` to the Windows `hosts` file, which is in the directory `C:\Windows\System32\drivers\etc`. `localhost` is really just an alias for 127.0.0.1, so this line specifies that http://some.url should be forwarded to http://localhost. (To edit the `hosts` file, open a text editor with admin priveleges and then use the File > Open menu to open `hosts`).

After saving this change to the `hosts` file, then, assuming you have a webserver listening to `localhost:<port>`, you should be able to navigate to `http://some.url:<port>` and consequently be redirected to `http://localhost:<port>`.

2. Now change the Angular webserver so that it uses HTTPS instead of HTTP by adding the option `"ssl": true` to `projects.<project>.architect.serve.options`, where `<project>` is the name of the associated Angular project.

Now, assuming the webserver is running, you should be able navigate to `https://localhost:<port>` and consequently be redirected to `https://some.url:<port>`.

3. Ask an administrator to add `http://some.url:<port>` to the list of forwarding URLs that your Adobe Sign account recognizes as legitimate.

### Special case: using the default port for HTTPS

After performing the above steps (1) and (2), you can navigate to https://some.url and be redirected to https://localhost. 

This is not useful if the Angular app is not hosted on the default port for HTTPS, however; if the Angular app is not hosted on the default port for HTTPS (443), then you will get an error if you are redirected to https://localhost that complains there is no server hosted on port 443. If you want to navigate to https://some.url, consequently be redirected to https://localhost, and then consequently *have the Angular app load*, then the Angular app must be hosted on port 443.

Assuming that the Angular app *is* hosted on port 443, the above steps are all the same, except for step (3):

3. Ask an administrator to add `http://some.url` to the list of forwarding URLs that your Adobe Sign account recognizes as legitimate.

Taking advantage of this special case is probably necessary because Adobe Sign might not be able to store a URL-with-port in its list of legitimate forwarding URLs.

## Miscellaneous documentation

### Enable CORS for development

Use [this](https://webbrowsertools.com/test-cors/) Chrome plugin to enable [CORS](https://www.stackhawk.com/blog/what-is-cors/) (cross-origin resource sharing). This prevents errors being thrown due a "same origin" policy. See [this](https://www.stackhawk.com/blog/angular-cors-guide-examples-and-how-to-enable-it/) for more info.

A more permanent solution will be necessary when finishing development... working on it!

### tsconfig.json

The tsconfig.json used in the top level-directory of this project is informed by these two links: [(1)](https://stackoverflow.com/a/55701637) [(2)](
https://blog.appsignal.com/2022/01/19/how-to-set-up-a-nodejs-project-with-typescript.html). Specifically, we learn from (1) that since TypeScript's `File` type is defined in the `dom` library,  we have to add `dom` to `complierOptions` in order for TypeScript to know about the `File` type.
