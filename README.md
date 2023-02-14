# sign-doc-reuploader

This is a "migration tool" that copies selected documents from a specified commercial Adobe Sign account to a specified FedRAMP Adobe Sign account. The most common use case is the copying of *all* documents over from a commercial account to a FedRAMP account.

## Installation

1. Install v16 of node.js. You can use one of [these](https://nodejs.org/download/release/v16.19.0/) installer executables for node.js v16.19.0, for example.
2. Follow the instructions [here]() to install whatever version of the Angular CLI is compatible with the version of node.js installed.

## Running the app for the first time

1. Request via ticket that https://migrationtool.com be added to the list of forwarding URLs that your FedRAMP account recognizes as legitimate:

   > Please add https://migrationtool.com to the Redirect URI field of the Configure OAuth menu for the API Application owned by &lt;*your FedRAMP account email here*&gt;.

2. Edit the Windows `hosts` file so that it has the following new line: `127.0.0.1 migrationtool.com`. To edit the Windows hosts file, open Notepad as an admin and then File > Open >  `C:\Windows\System32\drivers\etc\hosts`.

3. Clone this repo and `cd` into the `sign-doc-reuploader` folder that results.

4. If running for the first time, execute `npm install`.

5. Execute `ng serve`.

6. Navigate to https://localhost. Make sure you use https and not http.

# Pedagogy

It is not necessary to read this section for the sake of using the migration tool.

#### Explanation for editing the Windows hosts file

`localhost` is really just an alias for 127.0.0.1, so adding the line `127.0.0.1 migrationtool.com` to the `hosts` file specifies that http://migrationtool.com should be forwarded to http://localhost and that https://migrationtool.com should be forwarded to https://localhost.

After the user has successfully logged in, the OAuth authentication server will redirect the user to https://migrationtool.com. Due to the edit in the `hosts` file, the user is again redirected from `https://migrationtool.com` to `https://localhost`, which is interpreted as https://localhost (since 443 is the default port for HTTPS). It is necessary that the user is ultimately redirected to https://localhost so that the webserver hosting the migration tool can receive further requests.

#### Necessary dev webserver configuration

- We need to ensure the dev webserver uses HTTPS. This is done by including `"ssl": true` in`projects.<project>.architect.serve.options`, where `<project>` is the name of the associated Angular project.
- The default HTTPS port is 443 (the default HTTP port is 80). We need to ensure the Angular app is hosted on the default HTTPS port so that requests to https://migrationtool.com, which are interpreted as requests to https://migrationtool.com:443, are received by the dev webserver. This is done by including `"port" = 443` in `projects.<project>.architect.serve.options`, where `<project>` is the name of the associated Angular project.

# Disclaimer

Any organization who uses this tool implicitly acknowledges the following.

- The app moves templates from FedRAMP LI-SAAS (colloquially referred to in the above as "commercial") to FedRAMP moderate. FedRAMP LI-SAAS is less strict than FedRAMP moderate.
- The app currently only runs in dev mode. (URL proxies that the app needs to function correctly get disabled when the app runs in prod).
- Currently, all hosts are whitelisted for outgoing HTTP requests. That is, the app requires `disableHostCheck = true`.
- The API call that obtains the OAuth token does not check that the randomly generated state passed to the token request call is the same as the state returned by said call. Ideally the returned state would be inspected so that we can rule out the unlikely possibility that a malicious server is pretending to be the authentication server.