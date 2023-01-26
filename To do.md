Code

1. Collect commercialIntegrationKey, oAuthClientId, oAuthClientSecret, loginEmail as user input.
2. Add "select all" and "deselect all" buttons to the document selection UI.
3. Hardcode URLs in`proxy.conf.ts` to be prod URLs rather than stage URLs.
   1. It would be better if we could get `import` statements to work in `proxy.conf.ts` so that we don't have to hardcode the URLs.

Add to documentation

1. When a client uses this tool, it will be necessary for them to go into Sign settings, create an API Application, and 
   1. Add "https://migrationtooldev.com" to the list of redirect URIs that is edited by clicking "Configure OAuth".
   2. Note the Client ID and Client Secret.

Later

1. Get ngrx store to work.
   1. Use it to persist `state` across multiple instances of source-documents-list.component
   2. In source-documents-list.component, create a boolean instance variable `loggedIn`, and persist it across multiple instances of source-documents-list.component. Modify the code so that `getToken()` is only called when `redirected() && loggedIn`.