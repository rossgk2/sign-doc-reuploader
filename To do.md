- implementing oauth for source and destination

  - Current issue: when apiEnv is stage, the OAuth URL is `https://secure.na1.adobesignstage.us/api/gateway/adobesignauthservice`. This URL does not work for commercial OAuth. The commercial OAuth URL is likely different.
    - commercial endpoints have different base urls; one is `/public/oauth`, one is just `/oauth`
  - Is `'https://api.na1.adobesign.us/api/rest/v6` is the correct URL for gov prod API access? 
  - only redirect to migration console UI after both logins have occurred
    can use shared service to track this
  - is oauth url always on na1? for commercial? for fedramp?
  - are pdf documents always stored on na4?
  
- add a radio button for "prod" vs. "stage" apiEnv

- implement commercial-to-commercial migration

- remove need for direct call to axios (sending `data` with `JSON.stringify()` and then deserializing with `JSON.parse()` should probably work)

- improve UI

- change ' to "

- use Angular to inject `window` instead of using `<any> window`

- error handling for incorrect password

- convert settings.ts into an environment variable file that Angular natively supports; even better would be an env var file that both Electron main process and renderer process load upon starting

  
