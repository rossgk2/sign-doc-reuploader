- add a radio button for "prod" vs. "stage" apiEnv

- implement commercial-to-commercial migration

- remove need for direct call to axios (sending `data` with `JSON.stringify()` and then deserializing with `JSON.parse()` should probably work)

- improve UI

- change ' to "

- use Angular to inject `window` instead of using `<any> window`

- error handling for incorrect password

- convert settings.ts into an environment variable file that Angular natively supports; even better would be an env var file that both Electron main process and renderer process load upon starting

  
