## Build and run the app

1. Install dependencies.
   1. `choco install openssl`
   2. `npm install http-server -g`. Yes, the `-g` is necessary.
2. Build the app by running`ng build` within the sign-doc-reuploader folder. This creates the folder dist/sign-doc-reuploader that contains the files needed to run the server.
3. `cd dist/sign-doc-reuploader`
4. Generate key.pem and cert.pem files, which are needed for SSL (i.e. HTTPS), by executing `openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem`. (See [this Stack Overflow](https://stackoverflow.com/a/35231213) answer).
5. `http-server --ssl --port=443`.

## Code

1. For some reason GET /libraryDocumentList only returns 100 documents. Is this because stage accounts are limited to having 100 templates?
2. Disable `inDevelopment` and `forceUseTestCredentials`. Delete `credentials.ts`.
3. Hardcode URLs in`proxy.conf.ts` to be prod URLs rather than stage URLs.
   1. It would be better if we could get `import` statements to work in `proxy.conf.ts` so that we don't have to hardcode the URLs.
4. Add "select all" and "deselect all" buttons to the document selection UI.
5. Remove need for `"disableHostCheck": true` in angular.json. Create a .env file with the content `ALLOWED_HOST=your-host-name.com`, and then add `"allowedHosts": ["${ALLOWED_HOST}"]` as a key-value pair to architect.serve.builder.options in angular.json. Then use a tool like dotenv to modify the .env file at runtime.
6. After get `loggedIn`to work, use `loggedIn` rather than `redirected()` to check for redirection and redirect user from https://migrationtool.com/?code=someCode&state=someState to https://migrationtool.com.

## Add to documentation

1. When a client uses this tool, Adobe will need to
   1. Create an API Application for the client, using "https://migrationtooldev.com" as the redirect URI.
   2. Transfer the Client Secret to Adobe (?). See [this](https://wiki.corp.adobe.com/display/ES/Process+for+Delivering+Application+Secret+to+Customers+in+Gov+Cloud) wiki page.

## Later

1. Get ngrx store to work.
   1. Use it to persist `state` across multiple instances of source-documents-list.component
   2. In source-documents-list.component, create a boolean instance variable `loggedIn`, and persist it across multiple instances of source-documents-list.component.
      1. Modify the code so that `getToken()` is only called when `redirected() && loggedIn`.
      2. Modify the code so that the "Display documents from your Sign account" button is only visible when `loggedIn`.