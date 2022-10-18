const
	axios = require('axios'),
	open = require('open'),
	FormData = require('form-data');

const gmailBearerToken = '(This sensitive info has been removed by BFG repo cleaner)';
const headersConfig = {'Authorization' : `Bearer ${gmailBearerToken}`}
const requestConfig = { 'headers' : headersConfig };

async function getBaseUri() {
	response = await axios.get('https://api.na1.adobesign.com:443/api/rest/v6/baseUris', requestConfig);
	baseUri = response.data['apiAccessPoint'];
	baseUri = baseUri.substring(0, baseUri.length - 1) + "/api/rest/v6";
	return baseUri;
}

async function main() {
	var baseUri = await getBaseUri();
	var libraryDocumentId = "CBJCHBCAABAA7V0riaWVDHwrLaSkRddihs_aqME4QQuz";

	/* GET the values the user has entered into the document's fields. */
	var formFields = await axios.get(`${baseUri}/libraryDocuments/${libraryDocumentId}/formFields`, requestConfig);
	var formFields = formFields.data;

	/* GET the PDF on which the custom form fields that the user field out were placed.*/
	var combinedDocumentUri = await axios.get(`${baseUri}/libraryDocuments/${libraryDocumentId}/combinedDocument/url`,
		{ 'headers' : headersConfig, 'responseType' : 'blob' });
	combinedDocumentUri = JSON.parse(combinedDocumentUri.data).url;

	/* If debugging, print the form fields and inspect the combined document PDF. */
	if (debug) {
		console.log(formFields);
		open(combinedDocumentUri);	
	}

	/* POST the same document, but without any custom form fields. */
	// TO-DO: POST /transientDocuments

	/* Use a PUT request to add the custom form fields and the values entered earlier to the document. */
	// TO-DO: PUT /libraryDocuments/{libraryDocumentId}/formFields
}

main();

/* Experimentation of how to implement a return statement below something like "var result = await getBaseUri(...)". */

function getBaseUri2() {
	baseUriInfo = axios.get('https://api.na1.adobesign.com:443/api/rest/v6/baseUris', 
	{ headers: {'Authorization' : `Bearer ${gmailBearerToken}`} })
	.then((response) => {
		baseUri = response.data['apiAccessPoint'];
		baseUri = baseUri.substring(0, baseUri.length - 1) + "/api/rest/v6";
		return baseUri;
	});
	return baseUriInfo;
}
	
function main2() {
	getBaseUri2().then(console.log);
}



