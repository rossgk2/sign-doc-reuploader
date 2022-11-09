const
  fs = require('fs'),
  axios = require('axios'),
  FormData = require('form-data'), // https://maximorlov.com/send-a-file-with-axios-in-nodejs/
  FileSaver = require('file-saver'); // https://github.com/eligrey/FileSaver.js/

import {Blob} from 'buffer';

/* ============================================ */
/* Helper functions.                            */
/* ============================================ */

function getDefaultHeadersConfig(bearerToken: string)
{
  return {'Authorization' : `Bearer ${bearerToken}`};
}

function getDefaultRequestConfig(bearerToken: string)
{
  return {'headers' : getDefaultHeadersConfig(bearerToken)};
}

/* Retrieves the base URI that is the first part of all Adobe Sign API endpoints. */
async function getBaseUri(bearerToken: string)
{
  let response = await axios.get('https://api.na1.adobesign.com:443/api/rest/v6/baseUris', getDefaultRequestConfig(bearerToken));
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

function printSep()
{
  console.log("================================================");
}

/* ============================================ */
/* Core functionality implemented here.                            */
/* ============================================ */

async function reupload(libraryDocumentId: string, oldToken: string, newToken: string, debug: boolean)
{
  /* ==================================*/
  /* Download from the "old" account.  */
  /* ==================================*/

  let baseUri = await getBaseUri(oldToken);
  let defaultRequestConfig = getDefaultRequestConfig(oldToken);

  /* GET the name of the document. */
  let docInfo = await axios.get(`${baseUri}/libraryDocuments/${libraryDocumentId}`, defaultRequestConfig);
  let docName = docInfo.data.name;

  /* GET the values the user has entered into the document's fields. */
  let formFields = await axios.get(`${baseUri}/libraryDocuments/${libraryDocumentId}/formFields`, defaultRequestConfig);
  formFields = formFields.data;

  if (debug)
  {
    console.log('Form fields obtained from document:\n');
    console.log(formFields);
    printSep();
  }

  /* GET the PDF on which the custom form fields that the user field out were placed.*/
  let combinedDocumentUrl = await axios.get(`${baseUri}/libraryDocuments/${libraryDocumentId}/combinedDocument/url`, defaultRequestConfig);
  combinedDocumentUrl = combinedDocumentUrl.data.url;

  /* Save the PDF to the folder this script resides in. */
  const savedFileName = `${docName}.pdf`;
  await download(combinedDocumentUrl, savedFileName, function() { console.log("Download completed."); printSep(); }); 

  /* ===============================*/
  /* Upload to the "new" account.   */
  /* ===============================*/

  baseUri = await getBaseUri(newToken);
  defaultRequestConfig = await getDefaultRequestConfig(newToken);

  /* POST the same document (but without any custom form fields) as a transient document and get its ID.
  
  Informed by https://stackoverflow.com/questions/53038900/nodejs-axios-post-file-from-local-server-to-another-server. */
  let form = new FormData();
  form.append('File-Name', `"${docName}"`); // have to enclose values for File-Name and File in double quotes 
  form.append('File', `"${fs.createReadStream(savedFileName)}"`);
  let requestConfig = { 'headers' : {...getDefaultHeadersConfig(newToken), ...form.getHeaders()} };
  let response = await axios.post(`${baseUri}/transientDocuments`, form, requestConfig);
  let transientDocumentId = response.data.transientDocumentId;

  if (debug)
  {
    console.log('Response to POSTing a transient document:\n');
    console.log(response.data);
    console.log(`Status code of response to POST to /transientDocuments: ${response.status}`);
    printSep();
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
  
  let headersConfig = { 'headers' : { ...getDefaultHeadersConfig(newToken), 'Content-Type' : 'application/json' } };
  response = await axios.post(`${baseUri}/libraryDocuments`, JSON.stringify(libraryDocumentInfo), headersConfig);

  if (debug)
  {
    console.log('Response to POSTing a library document:\n');
    console.log(response.data);
    printSep();
  }

  /* Use a PUT request to add the custom form fields and the values entered earlier to the document. */
  
  response = await axios.put(`${baseUri}/libraryDocuments/${libraryDocumentId}/formFields`, JSON.stringify(formFields), headersConfig);

  if (debug)
  {
    console.log("Response to editing the library document with a PUT request:\n");
    console.log(response.data);
    printSep();
  }
}

let libraryDocumentId = "CBJCHBCAABAA7V0riaWVDHwrLaSkRddihs_aqME4QQuz";
let oldToken = '(This sensitive info has been removed by BFG repo cleaner)';
let newToken = oldToken; // temp
reupload(libraryDocumentId, oldToken, newToken, true);