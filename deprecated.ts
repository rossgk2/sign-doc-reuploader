const
	https = require('https'),
	fs = require('fs'),
	axios = require('axios'),
	open = require('open'), // for viewing URLs
	FormData = require('form-data'), // https://maximorlov.com/send-a-file-with-axios-in-nodejs/
	FileSaver = require('file-saver'); // https://github.com/eligrey/FileSaver.js/


/* Deprecated functions. */

/* 
  Downloads the content located at url and stores it at the relative path (with the root directory
  being the one that contains this file) that is dest.

  Informed by https://github.com/axios/axios/issues/3971#issuecomment-1159556428.
*/
async function download(url: string, dest: string, cb: () => (void))
{
  let file = fs.createWriteStream(dest);
  file.on('finish', function() { file.close(cb); });  
  let {data} = await axios.get(url, {'responseType': 'stream'});
  data.pipe(file); // this wouldn't work if we didn't use 'responseType' : 'stream'
}

async function downloadWithHttps(url: string, dest: string, cb: () => (void)) // from https://stackoverflow.com/a/17676794
{
	let file = fs.createWriteStream(dest);
	https.get(url, function(response: any)
	{
    	console.log(response);
    	response.pipe(file); // If you wanted to use axios instead of https and change https.get() 
    						 // to axios.get(), the initial line of this request would become 
    						 // "axios.get(url).then(function(response: any) { ... })",
    						 // where the anonymous function passed is this function.
    						 //
    						 // After some investigation, you would also think that this line should change 
    						 // to "response.request.res.pipe(file);", since the "response.request.res" of axios seems 
    						 // to be the same as the "response" of https.
    						 //
    						 // For some reason this doesn't work- a file will get downloaded, 
    						 // but it won't be able to be opened.
    	file.on('finish', function() { file.close(cb); });
    });
}

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



