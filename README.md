# sign-doc-reuploader

This is a "migration tool" that copies selected documents from a specified commercial Adobe Sign account to a specified FedRAMP Adobe Sign account. The most common use case is the copying of *all* documents over from a commercial account to a FedRAMP account.

## Instructions for use

#### Setup: commercial account

1. Log-in to Sign and click on the "Account" tab.
2. Search for "Access Tokens" in the left search bar and click on "Access Tokens".
3. Click the plus sign to create an access token, and give it a name such as "migration-tool-access-token".
4. Check the boxes next to `library_read`, `library_write`, and `agreement_write` when creating the token.
5. After you've created the token, click on it, then click "Integration Key", and copy the long randomly generated string. You will need this "commercial integration key" later when running the migration tool.

#### Setup: FedRAMP account

Receive the "FedRAMP client ID" and "Fed RAMP client secret" for said API Application from Professional Services.

#### Building and running the app

1. Download this repository by clicking "Code", then "Download ZIP".
2. Unzip the downloaded .zip file. Let's refer to the folder that contains files such as package.json as "fldr".
3. Start a command prompt and `cd` into fldr.
4. Execute `npm run make`.
5. In your file explorer, navigate into the "out" directory, and then into the folder that corresponds to whatever operating system you're using (e.g. "migration-tool-win32-x64"). The app executable will be inside this folder. On Windows, it will be an .exe file, on Mac, it will be a .dmg file; on Linux, it will be a .deb file.
6. Double click the executable to run the app. Have the commercial integration key, FedRAMP client ID, and FedRAMP client secret on hand when you do so.

# Disclaimer

Any organization who uses this app implicitly acknowledges that it moves templates from FedRAMP LI-SAAS (colloquially referred to in the above as "commercial") to FedRAMP moderate. FedRAMP LI-SAAS is less strict than FedRAMP moderate.
