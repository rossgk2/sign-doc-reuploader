# sign-doc-reuploader

## Dependencies

1. Install v16 of node.js. You can use one of [these](https://nodejs.org/download/release/v16.19.0/) installer executables for node.js v16.19.0.
2. Follow the instructions [here]() to install whatever version of the Angular CLI is compatible with the version of node.js installed.

## Running the app for the first time

1. You don't need to do anything for this step; it's included for pedagogy. (Ensure the Angular app is hosted on port 443 by adding `"port" = 443` to `projects.<project>.architect.serve.options`, where `<project>` is the name of the associated Angular project.)
2. Follow the instructions of the below **Redirecting via the `hosts` file** section. Perform step (3) as described in the **Special case** subsection.
3. Clone this repo and `cd` into the `sign-doc-reuploader` folder that results.
6. If running for the first time, execute `npm install`.
7. Execute `ng serve`.
8. Navigate to https://localhost. Make sure you use https and not http.

## Redirecting via the `hosts` file

1. Add the line `127.0.0.1 some.url` to the Windows `hosts` file, which is in the directory `C:\Windows\System32\drivers\etc`. `localhost` is really just an alias for 127.0.0.1, so this line specifies that http://some.url should be forwarded to http://localhost. (To edit the `hosts` file, open a text editor with admin privileges and then use the File > Open menu to open `hosts`).

After saving this change to the `hosts` file, then, assuming you have a webserver listening to `localhost:<port>`, you should be able to navigate to `http://some.url:<port>` and consequently be redirected to `http://localhost:<port>`.

2. Now change the Angular webserver so that it uses HTTPS instead of HTTP by adding the option `"ssl": true` to `projects.<project>.architect.serve.options`, where `<project>` is the name of the associated Angular project.

Now, assuming the webserver is running, you should be able navigate to `https://localhost:<port>` and consequently be redirected to `https://some.url:<port>`.

3. Ask an administrator to add `http://some.url:<port>` to the list of forwarding URLs that your Adobe Sign account recognizes as legitimate.

### Special case: using the default port for HTTPS

After performing the above steps (1) and (2), you can navigate to https://some.url and be redirected to https://localhost. 

This is not useful if the Angular app is not hosted on the default port for HTTPS, however, since if the Angular app is not hosted on the default port for HTTPS (443), then you will get an error if you are redirected to https://localhost: the error will say that there is no server hosted on port 443. If you want to navigate to https://some.url, consequently be redirected to https://localhost, and then consequently *have the Angular app load*, then the Angular app must be hosted on port 443.

Assuming that the Angular app *is* hosted on port 443, the above steps are all the same, except for step (3):

3. Ask an administrator to add `http://some.url` to the list of forwarding URLs that your Adobe Sign account recognizes as legitimate.

Taking advantage of this special case is probably necessary because Adobe Sign might not be able to store a URL-with-port in its list of legitimate forwarding URLs.
