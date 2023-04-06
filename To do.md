- implementing oauth for source and destination

  - Current issue: when apiEnv is stage, the OAuth URL is `https://secure.na1.adobesignstage.us/api/gateway/adobesignauthservice`. This URL does not work for commercial OAuth. The commercial OAuth URL is likely different.
    - commercial endpoints have different base urls; one is `/public/oauth`, one is just `/oauth`
  - only redirect to migration console UI after both logins have occurred
    can use shared service to track this
  - don't hardcode maybe not- change this
  
- type arguments with types such as `'option1' | 'option2'` in functions where applicable

  - e.g. `complianceLevel` should always be of type `'commercial' | 'fedramp'`

- remove need for direct call to axios (sending `data` with `JSON.stringify()` and then deserializing with `JSON.parse()` should probably work)

- improve UI

- change ' to "

- use Angular to inject `window` instead of using `<any> window`

- error handling for incorrect password

- convert settings.ts into an environment variable file that Angular natively supports; even better would be an env var file that both Electron main process and renderer process load upon starting

  
