export const Settings = {
	/* Determines which Adobe Sign API URLs are used for the API calls that this
	application relies on. Use "stage" to use URLs that contain "adobesignstage"
	and "prod" to use URLs that contain "adobesign" but not "adobesignstage". */
	apiEnv: 'stage', // 'stage' or 'prod'
	
	/* A legacy setting from when this application was Angular only.
	Was useful for avoiding CORS errors in developent. */
	useProxy: false,

	/* Whether or not to use util/credentials.ts to log in. Useful
	for development. */
	forceUseTestCredentials: true,

	/* The URL that OAuth is instructed to redirect the user to upon successful login. */
	redirectUri: "https://migrationtool.com",

	/* Is appended to name of every document uploaded to the destination account.
	Use the empty string to essentially disable this setting. */
	docNamePrefixForDebug: '(@@@ FROM ELECTRON APP @@@)',

	/* Opens each PDF in a new window after downloading it from the source account.
	Useful for verifying that PDFs have been correctly downloaded. */
	debugViewDownloadedPdf: false,

	/* Use 1 for a reasonable dev-purposes page limit. 
	Use a value < 0 to disable this limit and thus load
	all the documents. */
	devPageLimit: -1
};