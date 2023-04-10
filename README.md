# sign-doc-reuploader

This is a "migration tool" that copies selected documents from a specified commercial Adobe Sign account to a specified FedRAMP Adobe Sign account. The most common use case is the copying of *all* documents over from a commercial account to a FedRAMP account.

This tool is currently in beta. Please open an issue for any bugs you find.

## Instructions for use

### Setup: commercial account

1. Log-in to Sign and click on the "Account" tab.
2. Search for "Access Tokens" in the left search bar and click on "Access Tokens".
3. Click the plus sign to create an access token, and give it a name such as "migration-tool-access-token".
4. Check the box next to `library_read` when creating the token.
5. After you've created the token, click on it, then click "Integration Key", and copy the long randomly generated string. You will need this "commercial integration key" later when running the migration tool.

### Setup: FedRAMP account

Receive the "FedRAMP client ID" and "Fed RAMP client secret" for said API Application from Professional Services. The API token will have the scopes `agreement_write`, `agreement_sign`, `widget_write`, and `library_write` enabled.

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
