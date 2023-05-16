# sign-doc-reuploader

This is a "migration tool" that copies selected documents between Adobe Sign accounts. Both the "source" and "destination" accounts may either be a commercial Adobe Sign account or a FedRAMP Adobe Sign account. The most common use case is the copying of *all* documents over from a commercial account to a FedRAMP account.

This tool is currently in beta. Please open an issue for any bugs you find.

## Instructions for use

### Setup: source account

1. Log-in to Sign and click on the "Account" tab.
2. Search for "API Applications" in the left search bar and then click on "API Applications".
3. Click the plus sign to create an API Application. Give it a name and display name.
4. Click on the row that coorresponds to the API Application and then click "Configure OAuth for Application".
5. Check the box next to `library_read` and then "Save".
6. Again click on the row that coorresponds to the API Application, click "View/Edit", and then make note of the client ID and client secret.

### Setup: destination account

First, log in to your FedRAMP account to ensure that you can indeed log in. After the migration process executes, it's necessary to log into the FedRAMP account to check that documents were correctly migrated.

Receive the "FedRAMP client ID" and "Fed RAMP client secret" for said API Application from Professional Services. The API token will have the `library_write` scope enabled.

### Using the app

To use the app, download either Sign.Template.Migrator.Windows.zip or Sign.Template.Migrator.Mac.zip from the [releases](https://github.com/rossgk2/sign-doc-reuploader/releases) section of this repository, extract the folder inside the .zip file from the .zip, and double click the .exe (Windows) or .dmg (Mac) executable. The executable (the .exe or .dmg) must be kept inside the folder it resides in; if it is moved outside of this folder it will not work. 

### Optional: building the app manually

If you would like to build the app yourself instead of downloading precompiled executables, follow these steps.

1. Download this repository by clicking "Code", then "Download ZIP".
2. Unzip the downloaded .zip file. Let's refer to the folder that contains files such as package.json as "fldr".
3. In a command prompt, `cd` into fldr and execute `npm install`.
4. Make sure the the last line of fldr/src/app/settings/settings.ts is `Settings = prodSettings`, and not `Settings = devSettings` or `Settings = almostProdSettings`. Edit this last line and then "Save" if necessary.
5. In a command prompt, `cd` into fldr and execute `npm run make`.
6. In your file explorer, navigate into the "out" directory, and then into the folder that corresponds to whatever operating system you're using (e.g. "migration-tool-win32-x64"). The app executable will be inside this folder. On Windows, it will be an .exe file, on Mac, it will be a .dmg file; on Linux, it will be a .deb file.
7. Double click the executable to run the app. Have the commercial integration key, FedRAMP client ID, and FedRAMP client secret on hand when you do so.

# Disclaimer

Any organization who uses this app implicitly acknowledges that it moves templates from FedRAMP LI-SAAS to FedRAMP moderate. FedRAMP LI-SAAS is less strict than FedRAMP moderate.

# Known bugs

About once every hundred times the app is run, you may see the following pop-up error message:

```
Uncaught Exception:
TypeError: Cannot read properties of null (reading 'webContents')
	at configLoadRenderAfterDOMContentLoaded (...\electron\main.ts45:7)
	at Function.<anonymous> (...\electron\main.ts95:7)
```

If you get this error, just close the application and restart it.
