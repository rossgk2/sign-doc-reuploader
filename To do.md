- implementing oauth for source and destination

  - initialize sourceComplianceLevel and destCompliance level to the default values that are used in the .html
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

  
