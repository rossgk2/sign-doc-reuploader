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

1. [Download](https://github.com/rossgk2/sign-doc-reuploader/archive/refs/heads/main.zip) the zip of this repo and extract it.
2. Rename the extracted folder to something (e.g. `fldr`).
3. In a command prompt `cd` to `fldr/sign-template-reuploader`.
4. (Possibly not necessary). If running for the first time, execute `npm install`.
5. Execute `ng serve --disableHostCheck true`. (We use `disableHostCheck` to allow traffic outside the local machine, i.e., traffic from the ngrok-generated URL).
6. In another command prompt, `ngrok http 4200 --host-header="localhost:4200"`.
7. Navigate to the ngrok forwarding URL in your web browser.

## Miscellaneous documentation

### Forwarding to localhost with ngrok

Since the Angular app uses OAuth, it is necessary to provide the URL that will point to the Angular webserver to the OAuth API. Obviously it won't work to send "localhost:\<port\>" to the OAuth API. (The OAuth API is decoupled from whatever machine the webserver runs on, so there is no shared notion of locality. Even if they weren't decoupled, this would be invalid syntax). 

Is it even possible to obtain a global URL that points to a locally hosted webserver? It turns out that if we use ngrok, it is. ngrok is a command line tool that provides a globally available URL that forwards to a locally running webserver.

To install ngrok on Windows:
1. Follow step 2 of this installation guide and install the Chocolatey package manager. Use the "Individual" installation. This will involve typing commands in an instance of Windows PowerShell that has admin privileges.
2. Open the regular Windows command prompt and execute `choco install ngrok`.
3. In your browser, go to the ngrok website and create an ngrok account.
4. In the Windows command prompt, execute `ngrok config add-authtoken <token>`, as is suggested on the home page of your ngrok account.

After installing ngrok, here is how you obtain the global URL that forwards to localhost:
1. Start the Angular webserver with `ng serve --disableHostCheck true`.
2. Assuming that `<port>` is the port on which the Angular webserver runs, execute `ngrok http <port> --host-header="localhost:<port>"`. This command may take a while to execute. After it does, the global URL is the one to the left of the -> in the row of text labeled by "Forwarding".

### tsconfig.json

The tsconfig.json used in the top level-directory of this project is informed by these two links: [(1)](https://stackoverflow.com/a/55701637) [(2)](
https://blog.appsignal.com/2022/01/19/how-to-set-up-a-nodejs-project-with-typescript.html). Specifically, we learn from (1) that since TypeScript's `File` type is defined in the `dom` library,  we have to add `dom` to `complierOptions` in order for TypeScript to know about the `File` type.
