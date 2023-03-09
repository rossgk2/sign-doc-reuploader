# sign-doc-reuploader

This is a "migration tool" that copies selected documents from a specified commercial Adobe Sign account to a specified FedRAMP Adobe Sign account. The most common use case is the copying of *all* documents over from a commercial account to a FedRAMP account.

## Instructions for use

1. Request via ticket that https://migrationtool.com be added to the list of forwarding URLs that your FedRAMP account recognizes as legitimate:

   > Please add https://migrationtool.com to the Redirect URI field of the Configure OAuth menu for the API Application owned by &lt;*your FedRAMP account email here*&gt;.

2. Download this repository by clicking "Code", then "Download ZIP". Unzip the downloaded .zip file and navigate into the "executables" directory, and then into the "Windows" directory. Double click on the .exe file to start the app.
3. If you are on Mac or Linux, you will have to build the executable yourself before you run it by following these steps:
   - Start a command prompt.
   - `cd` into the unzipped folder. There should be a "package.json" file inside the unzipped folder. Let's call this unzipped folder `fldr`.
   - Execute `npm run make`.
   - The compiled executable should be located in one of the subfolders of `fldr/out` . If you are on Mac, the executable will be a .dmg file; if you are on Linux, it will be a .deb file.

# Disclaimer

Any organization who uses this app implicitly acknowledges that it moves templates from FedRAMP LI-SAAS (colloquially referred to in the above as "commercial") to FedRAMP moderate. FedRAMP LI-SAAS is less strict than FedRAMP moderate.
