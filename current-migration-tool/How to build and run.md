## How to build and run the Angular app

1. Install dependencies.
   1. Install the OpenSSL command line tool. On Windows this can be accomplished by using Chocolatey: `choco install openssl`.
   2. Install a simple webserver, `http-server`, with`npm install http-server -g`. Yes, the `-g` is necessary.
2. Build the app by running `ng build` within the sign-doc-reuploader folder. This creates the folder dist/sign-doc-reuploader that contains the files needed to run the server.
3. `cd dist/sign-doc-reuploader`
4. Generate key.pem and cert.pem files, which are needed for SSL (i.e. HTTPS), by executing `openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem`. (See [this Stack Overflow](https://stackoverflow.com/a/35231213) answer).
5. `http-server --ssl --port=443`.
