- **just finished converting getter and setter methods with syntactic sugar in sharer.service.ts to regular getter and setter methods to eliminate misuse. next step: run tool, see error, debug.**

- only redirect to migration console UI after both logins have occurred
  can use shared service to track this

  - add fields `sourceLoggedIn`, `destLoggedIn` to shared service; initialize both to false
  - in `sourceLogin()` and `destLogin()` update the values of above variables to true

- looks like redirect works; now need to save the old state of the login ui (namely the content of the dropdowns) and reload it upon redirect 

- initialize `sourceComplianceLevel` and `destComplianceLevel` to the default values that are used in the .html instead of hardcoding their initial values to match those from the .html

- type arguments with types such as `'option1' | 'option2'` in functions where applicable

  - e.g. `complianceLevel` should always be of type `'commercial' | 'fedramp'`

- remove need for direct call to axios (sending `data` with `JSON.stringify()` and then deserializing with `JSON.parse()` should probably work)

- improve UI

- change ' to "

- use Angular to inject `window` instead of using `<any> window`

- error handling for incorrect password

- convert settings.ts into an environment variable file that Angular natively supports; even better would be an env var file that both Electron main process and renderer process load upon starting

  
