- to implement oauth for source account...

  - write function that encapsulates all oauth tasks that are done for second signer
  - create three input fields that correspond to source account
  - when "log in" clicked, pass values obtained from these fields to the newly written function
  - at this point we've implemented commercial -> gov using oauth for both source and destination
  - next step is to implement x -> y, where x, y in {commercial, gov}
  - add two radio buttons to log in page that toggle between "commercial" and "gov"
  - create sourceType and destinationType variables that are shared between login and console components
  - update sourceType and destinationType with values obtained from radio buttons
  - replace the functions getApiBaseUriFedRamp() and getApiBaseUriCommercial() that are used in download() and upload() with getApiBaseUri(). this new function will take sourceType and destinationType as parameters, and use conditional logic such as `if (sourceType  === 'commercial')`

- add a radio button for "prod" vs. "stage" apiEnv

- implement commercial-to-commercial migration

- remove need for direct call to axios (sending `data` with `JSON.stringify()` and then deserializing with `JSON.parse()` should probably work)

- improve UI

- change ' to "

- use Angular to inject `window` instead of using `<any> window`

- error handling for incorrect password

- convert settings.ts into an environment variable file that Angular natively supports; even better would be an env var file that both Electron main process and renderer process load upon starting

  
