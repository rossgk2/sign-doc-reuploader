const
	https = require('https'),
	fs = require('fs'),
	axios = require('axios'),
	open = require('open'), // for viewing URLs
	FormData = require('form-data'), // https://maximorlov.com/send-a-file-with-axios-in-nodejs/
	FileSaver = require('file-saver'); // https://github.com/eligrey/FileSaver.js/

const gmailBearerToken = '(This sensitive info has been removed by BFG repo cleaner)';
const headersConfig = {'Authorization' : `Bearer ${gmailBearerToken}`}
const requestConfig = { 'headers' : headersConfig };

async function getBaseUri()
{
	let response = await axios.get('https://api.na1.adobesign.com:443/api/rest/v6/baseUris', requestConfig);
	let baseUri = response.data['apiAccessPoint'];
	baseUri = baseUri.substring(0, baseUri.length - 1) + "/api/rest/v6";
	return baseUri;
}

/* 
	Downloads the content located at url and stores it at the relative path (with the root directory
	being the one that contains this file) that is dest.
*/
function download(url: string, dest: string, cb: () => (void)) // from https://stackoverflow.com/a/17676794
{
	let file = fs.createWriteStream(dest);
	https.get(url, function(response: any)
	{
    	response.pipe(file); // If you wanted to use axios instead of https and change https.get 
    						 // to axios.get, the initial line of this request would become 
    						 // "axios.get(url).then(function(response: any) { ... })",
    						 // where the anonymous function passed is this function.
    						 //
    						 // After some investigation, you would also think that this line should change 
    						 // to "response.request.res.pipe(file);", since the "response" of https seems 
    						 // to be the same as the "response.request.res" of axios.
    						 //
    						 // For some reason this doesn't work- a file will get downloaded, 
    						 // but it won't be able to be opened.
    	file.on('finish', function() { file.close(cb); });
    });
}

async function main(libraryDocumentId: string, debug: boolean)
{
	let baseUri = await getBaseUri();

	/* GET the values the user has entered into the document's fields. */
	let formFields = await axios.get(`${baseUri}/libraryDocuments/${libraryDocumentId}/formFields`, requestConfig);
	formFields = formFields.data;

	/* GET the PDF on which the custom form fields that the user field out were placed.*/
	let combinedDocumentUrl = await axios.get(`${baseUri}/libraryDocuments/${libraryDocumentId}/combinedDocument/url`,
		{ 'headers' : headersConfig, 'responseType' : 'blob' });
	combinedDocumentUrl = JSON.parse(combinedDocumentUrl.data).url;

	// Save the PDF to the folder this script resides in.
	const savedFileName = 'combined_document.pdf';
	let cb = function() { console.log("Download completed."); };
	download(combinedDocumentUrl, savedFileName, cb);

	/* If debugging, print the form fields and inspect the combined document PDF. */
	if (debug)
	{
		console.log(formFields);
		open(combinedDocumentUrl);	
	}

	/* POST the same document, but without any custom form fields. */
	// https://stackoverflow.com/questions/53038900/nodejs-axios-post-file-from-local-server-to-another-server
	let form = new FormData();
	form.append('combined_document', fs.createReadStream(savedFileName));
	let config =
		{
			'headers' : 
			{
				'Authorization' : `Bearer ${gmailBearerToken}`,
				...form.getHeaders()
			},
			'data': form
		};

	let response = await axios.post(`${baseUri}/transientDocuments`, form, config);
	console.log(response);
	console.log("========================");
	console.log(typeof(response));
	console.log(Object.keys(response));
	
	/* Use a PUT request to add the custom form fields and the values entered earlier to the document. */
	
	// TO-DO: PUT /libraryDocuments/{libraryDocumentId}/formFields
}

main("CBJCHBCAABAA7V0riaWVDHwrLaSkRddihs_aqME4QQuz", false);

/* Experimentation of how to implement a return statement below something like "let result = await getBaseUri(...)". */

function getBaseUri2()
{
	let baseUriInfo = axios.get('https://api.na1.adobesign.com:443/api/rest/v6/baseUris', 
	{ headers: {'Authorization' : `Bearer ${gmailBearerToken}`} })
	.then((response: any) => {
		let baseUri = response.data['apiAccessPoint'];
		baseUri = baseUri.substring(0, baseUri.length - 1) + "/api/rest/v6";
		return baseUri;
	});
	return baseUriInfo;
}
	
function main2()
{
	getBaseUri2().then(console.log);
}



