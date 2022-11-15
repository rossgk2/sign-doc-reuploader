const
  fs = require('fs'),
  axios = require('axios'),
  FormData = require('form-data'); // https://maximorlov.com/send-a-file-with-axios-in-nodejs/

import Blob from "@web-std/file";

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

function printSep()
{
  console.log("================================================");
}

/* ============================================ */
/* Core functionality implemented here.                            */
/* ============================================ */

async function reupload(oldLibraryDocumentId: string, oldToken: string, newToken: string, debug: boolean)
{
  /* ==================================*/
  /* Download from the "old" account.  */
  /* ==================================*/

  let baseUri = await getBaseUri(oldToken);
  let defaultRequestConfig = getDefaultRequestConfig(oldToken);

  /* GET the name of the document. */
  let docInfo = await axios.get(`${baseUri}/libraryDocuments/${oldLibraryDocumentId}`, defaultRequestConfig);
  let docName = docInfo.data.name;

  /* GET the values the user has entered into the document's fields. */
  let formFields = await axios.get(`${baseUri}/libraryDocuments/${oldLibraryDocumentId}/formFields`, defaultRequestConfig);
  formFields = formFields.data;

  if (debug)
  {
    console.log('Form fields obtained from document:\n');
    console.log(formFields);
    printSep();
  }

  /* GET the PDF on which the custom form fields that the user field out were placed.*/
  let combinedDocumentUrl = await axios.get(`${baseUri}/libraryDocuments/${oldLibraryDocumentId}/combinedDocument/url`, defaultRequestConfig);
  combinedDocumentUrl = combinedDocumentUrl.data.url;

  /* Save the PDF to the folder this script resides in. */
  const savedFileName = 'DOCUMENT FROM REUPLOADER 3';
  let arrayBuffer = await axios.get(combinedDocumentUrl, {'responseType': 'arraybuffer'}); // 'responseType': 'blob' is browser-only: see https://stackoverflow.com/questions/60454048/how-does-axios-handle-blob-vs-arraybuffer-as-responsetype
  arrayBuffer = arrayBuffer.data;
  fs.writeFileSync(`${savedFileName}.pdf`, arrayBuffer);

  /* ===============================*/
  /* Upload to the "new" account.   */
  /* ===============================*/

  baseUri = await getBaseUri(newToken);
  defaultRequestConfig = await getDefaultRequestConfig(newToken);

  /* POST the same document (but without any custom form fields) as a transient document and get its ID.
  
  Informed by https://stackoverflow.com/questions/53038900/nodejs-axios-post-file-from-local-server-to-another-server. */
  let form = new FormData();
  form.append('File-Name', docName);
  form.append('File', arrayBuffer, `${savedFileName}.pdf`);
  let requestConfig = { 'headers' : {...getDefaultHeadersConfig(newToken), ...form.getHeaders()} };

  if (debug)
  {
    console.log('Request config:');
    console.log(requestConfig);
    printSep();
  }

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
  let newLibraryDocumentId = response.data.id;

  if (debug)
  {
    console.log('Response to POSTing a library document:\n');
    console.log(response.data);
    printSep();
  }

  /* Use a PUT request to add the custom form fields and the values entered earlier to the document. */
  
  response = await axios.put(`${baseUri}/libraryDocuments/${newLibraryDocumentId}/formFields`, JSON.stringify(formFields), headersConfig);

  if (debug)
  {
    console.log("Response to editing the library document with a PUT request:\n");
    console.log(response.data);
    printSep();
  }
}

async function main()
{
  let oldLibraryDocumentId = "CBJCHBCAABAA7V0riaWVDHwrLaSkRddihs_aqME4QQuz";
  let oldToken = '(This sensitive info has been removed by BFG repo cleaner)'; // Ross's account
  let newToken = oldToken; // '3AAABLblqZhDI08CVbG5A7glf8jxmrdoIyo0RZlchGBQhex8Jw1WNuoZiuIXlrLe89BlaxYtEdUka-I8zQ_xugtxcHO5WxP7k'; // Todd's account
  reupload(oldLibraryDocumentId, oldToken, newToken, true);
}

main();

/* Could be useful in future: https://stackoverflow.com/questions/43231241/how-to-create-a-file-object-with-a-path-in-nodejs*/
/* Apparently solves the lack of interoperability between Node's fs file system (which the browser doesn't have access to),
 and the browser's File object type, which Node cannot create. */