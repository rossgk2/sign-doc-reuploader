export interface I_Settings {
	/* Determines which Adobe Sign API URLs are used for the API calls that this
	application relies on. Use "stage" to use URLs that contain "adobesignstage"
	and "prod" to use URLs that contain "adobesign" but not "adobesignstage". */
	apiEnv: string, // 'stage' or 'prod'
	
	/* A legacy setting from when this application was Angular only.
	Was useful for avoiding CORS errors in developent. */
	useProxy: boolean,

	/* Whether or not to use util/credentials.ts to log in. Useful
	for development. */
	forceUseTestCredentials: boolean,

	/* The URL that OAuth is instructed to redirect the user to upon successful login. */
	redirectUri: "https://migrationtool.com",

	/* Is appended to name of every document uploaded to the destination account.
	Use the empty string to essentially disable this setting. */
	docNamePrefixForDebug: string,

	/* Opens each PDF in a new window after downloading it from the source account.
	Useful for verifying that PDFs have been correctly downloaded. */
	debugViewDownloadedPdf: boolean,

	/* Use 1 for a reasonable dev-purposes page limit. 
	Use a value < 0 to disable this limit and thus load
	all the documents. */
	devPageLimit: number
};

export const devSettings: I_Settings = {
	apiEnv: 'stage',
	useProxy: false,
	forceUseTestCredentials: true,
	redirectUri: "https://migrationtool.com",
	docNamePrefixForDebug: '(--- FROM ELECTRON APP ---)',
	debugViewDownloadedPdf: false,
	devPageLimit: 1
};

export const prodSettings: I_Settings = {
	apiEnv: 'prod',
	useProxy: false,
	forceUseTestCredentials: false,
	redirectUri: "https://migrationtool.com",
	docNamePrefixForDebug: '',
	debugViewDownloadedPdf: false,
	devPageLimit: -1
};

export const almostProdSettings = prodSettings;
almostProdSettings.apiEnv = 'stage';

export const Settings = devSettings;