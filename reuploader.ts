const
  fs = require('fs'),
  axios = require('axios'),
  FormData = require('form-data'), // https://maximorlov.com/send-a-file-with-axios-in-nodejs/
  FileSaver = require('file-saver'); // https://github.com/eligrey/FileSaver.js/

import {Blob} from 'buffer';

const gmailBearerToken = '(This sensitive info has been removed by BFG repo cleaner)';
const defaultHeadersConfig = {'Authorization' : `Bearer ${gmailBearerToken}`}
const defaultRequestConfig = { 'headers' : defaultHeadersConfig };

/* Retrieves the base URI that is the first part of all Adobe Sign API endpoints. */
async function getBaseUri()
{
  let response = await axios.get('https://api.na1.adobesign.com:443/api/rest/v6/baseUris', defaultRequestConfig);
  let baseUri = response.data['apiAccessPoint'];
  baseUri = baseUri.substring(0, baseUri.length - 1) + "/api/rest/v6";
  return baseUri;
}

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

function printWithEqualsSep(message: string)
{
  console.log(message);
  console.log("================================================");
}

/* Returns the JSON that specifies custom headers for an HTTP request. */
function getRequestConfig(form: typeof FormData)
{
  return { 'headers' : {...defaultHeadersConfig, ...form.getHeaders()} }
}

async function main(libraryDocumentId: string, debug: boolean)
{
  let baseUri = await getBaseUri();

  /* GET the name of the document. */
  let docInfo = await axios.get(`${baseUri}/libraryDocuments/${libraryDocumentId}`, defaultRequestConfig);
  let docName = docInfo.data.name;

  /* GET the values the user has entered into the document's fields. */
  let formFields = await axios.get(`${baseUri}/libraryDocuments/${libraryDocumentId}/formFields`, defaultRequestConfig);
  formFields = formFields.data;

  if (debug)
    printWithEqualsSep(formFields);

  /* GET the PDF on which the custom form fields that the user field out were placed.*/
  let combinedDocumentUrl = await axios.get(`${baseUri}/libraryDocuments/${libraryDocumentId}/combinedDocument/url`, defaultRequestConfig);
  combinedDocumentUrl = combinedDocumentUrl.data.url;

  /* Save the PDF to the folder this script resides in. */
  const savedFileName = 'combined_document.pdf';
  await download(combinedDocumentUrl, savedFileName, function() { console.log("Download completed."); }); 

  /* POST the same document (but without any custom form fields) as a transient document and get its ID.
  
  Informed by https://stackoverflow.com/questions/53038900/nodejs-axios-post-file-from-local-server-to-another-server. */
  let form = new FormData();
  form.append('File-Name', `"${docName}"`); // have to enclose values for File-Name and File in double quotes 
  form.append('File', `"${fs.createReadStream(savedFileName)}"`);
  let response = await axios.post(`${baseUri}/transientDocuments`, form, getRequestConfig(form));
  let transientDocumentId = response.data.transientDocumentId;

  if (debug)
  {
    printWithEqualsSep(response.data);
    console.log(`Status code of response to POST to /transientDocuments: ${response.status}`);
  }

  /* Create a library document from the just-created transient document. */
  let libraryDocumentInfo = 
  {
    'fileInfos' : [{'transientDocumentId' : transientDocumentId}],
    'name': savedFileName,
    'sharingMode': 'ACCOUNT', // can be 'USER' or 'GROUP' or 'ACCOUNT' or 'GLOBAL'
    'state': 'AUTHORING', // can be 'AUTHORING' or 'ACTIVE'
    'templateTypes': ['DOCUMENT'] // each array elt can be 'DOCUMENT' or 'FORM_FIELD_LAYER'
  };
  
  let headersConfig = { 'headers' : { ...defaultHeadersConfig, 'Content-Type' : 'application/json' } };
  response = await axios.post(`${baseUri}/libraryDocuments`, JSON.stringify(libraryDocumentInfo), headersConfig);

  /* The response body to this is "{code: 'MISC_SERVER_ERROR', message: 'Some miscellaneous error has occurred'}". */

  if (debug)
  {
    console.log('Result of POSTing a library document...');
    printWithEqualsSep(response.data);
  }

  /* Use a PUT request to add the custom form fields and the values entered earlier to the document. */
  
  // await axios.put(`/libraryDocuments/${libraryDocumentId}/formFields`);
}

let libraryDocumentId = "CBJCHBCAABAA7V0riaWVDHwrLaSkRddihs_aqME4QQuz";
main(libraryDocumentId, true);