## Before pushing to prod

1. Disable `inDevelopment` and `forceUseTestCredentials`. Delete `credentials.ts`.
2. Hardcode URLs in`proxy.conf.ts` to be prod URLs rather than stage URLs.
   1. It would be better if we could get `import` statements to work in `proxy.conf.ts` so that we don't have to hardcode the URLs.

## Core functionality

1. Remove need for `"disableHostCheck": true` in angular.json. Create a .env file with the content `ALLOWED_HOST=your-host-name.com`, and then add `"allowedHosts": ["${ALLOWED_HOST}"]` as a key-value pair to architect.serve.builder.options in angular.json. Then use a tool like dotenv to modify the .env file at runtime.
2. Get ngrx store to work.
   1. Use it to persist `state` across multiple instances of source-documents-list.component
   2. In source-documents-list.component, create a boolean instance variable `loggedIn`, and persist it across multiple instances of source-documents-list.component.
      1. Modify the code so that `getToken()` is only called when `redirected() && loggedIn`.
      2. Use `loggedIn` rather than `redirected()` to check if the user has been redirected, and if so, redirect user (from https://migrationtool.com/?code=someCode&state=someState) to https://migrationtool.com.
3. Add "select all" and "deselect all" buttons to the document selection UI.

## High level features

- ability to search the list of commercial documents by document name
- ability to sort the list of commercial documents by group, user 

## Questions

- For some reason GET /libraryDocumentList only returns 100 documents. Is this because stage accounts are limited to having 100 templates?

## Add to documentation

1. When a client uses this tool, Adobe will need to
   1. Create an API Application for the client, using "https://migrationtooldev.com" as the redirect URI.
   2. Obtain the client secret from Adobe. See [this](https://wiki.corp.adobe.com/display/ES/Process+for+Delivering+Application+Secret+to+Customers+in+Gov+Cloud) wiki page.
