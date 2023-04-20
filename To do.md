- is offline_access scope required for fedramp dest account?

- **change console logging to talk about source account and dest account rather than commercial account and FedRAMP account**

- **upon redirect, set values of dropdowns to be what they were before the redirect**

- initialize `sourceComplianceLevel` and `destComplianceLevel` to the default values that are used in the .html instead of hardcoding their initial values to match those from the .html

- type arguments with types such as `'option1' | 'option2'` in functions where applicable

  - e.g. `complianceLevel` should always be of type `'commercial' | 'fedramp'`

- remove need for direct call to axios (sending `data` with `JSON.stringify()` and then deserializing with `JSON.parse()` should probably work)

- improve UI

- change ' to "

- use Angular to inject `window` instead of using `<any> window`

- error handling for incorrect password

- convert settings.ts into an environment variable file that Angular natively supports; even better would be an env var file that both Electron main process and renderer process load upon starting

  
