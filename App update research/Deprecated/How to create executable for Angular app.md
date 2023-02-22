There are several ways to create an executable that starts a locally hosted Angular app, but one common approach is to use the Angular CLI (Command Line Interface) to build and package the app. Here are the general steps to create an executable:

1. Install the Angular CLI: `npm install -g @angular/cli`
2. Create a new Angular app: `ng new my-app`
3. Build the app for production: `ng build --prod`
4. Install the package "nexe" : `npm install nexe`
5. Create the executable: `nexe -i dist/my-app/main.js -o my-app-exe`
6. Run the executable: `./my-app-exe`

Note that you will need to have node.js and npm (node package manager) installed on your machine to use the Angular CLI and nexe package.

Note: This is a general guide, you might need to install some more dependencies or configure the package.json file to make it work.