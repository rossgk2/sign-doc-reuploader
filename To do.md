Code

1. Add "select all" and "deselect all" buttons to the document selection UI.
2. Hardcode URLs in`proxy.conf.ts` to be prod URLs rather than stage URLs.
   1. It would be better if we could get `import` statements to work in `proxy.conf.ts` so that we don't have to hardcode the URLs.

Add to documentation

1. When a client uses this tool, Adobe will need to
   1. Create an API Application for the client, using "https://migrationtooldev.com" as the redirect URI.
   2. Then Adobe uses
   3. Transfer the Client Secret to Adobe (?). See [this](https://wiki.corp.adobe.com/display/ES/Process+for+Delivering+Application+Secret+to+Customers+in+Gov+Cloud) wiki page.

Later

1. Get ngrx store to work.
   1. Use it to persist `state` across multiple instances of source-documents-list.component
   2. In source-documents-list.component, create a boolean instance variable `loggedIn`, and persist it across multiple instances of source-documents-list.component. Modify the code so that `getToken()` is only called when `redirected() && loggedIn`.