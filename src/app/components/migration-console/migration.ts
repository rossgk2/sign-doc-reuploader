import { Settings } from "src/app/settings/settings";
import { httpRequest } from "src/app/util/electron-functions";
import { getApiBaseUriCommercial, getApiBaseUriFedRamp, getPdfLibraryBaseUri } from "src/app/util/url-getter";

export async function migrate(oldThis: any, selectedDocs: string[]): Promise<any> {
  /* For each document: if that document was selected, upload it. */
  const startTime = Date.now();
  const minutesPerMillisecond = 1.667E-5;
  const timeoutPeriodInMinutes = 5; // hardcoded for now; later we can grab this value from initial response from /token
  const epsilonInMinutes = (1/50) * timeoutPeriodInMinutes; 
  for (let i = 0; i < selectedDocs.length; ) {
    /* Determine how much time has elapsed since the start of this function and declare a helper function. */
    const totalTimeElapsedInMinutes = (Date.now() - startTime) * minutesPerMillisecond;
    console.log('totalTimeElapsedInMinutes:', totalTimeElapsedInMinutes);
    console.log('If in the following comparison if we have LHS < RHS, then the current time is considered close to the time at which the token expires.');
    console.log(`${totalTimeElapsedInMinutes % (timeoutPeriodInMinutes - 1)} < ${epsilonInMinutes}`);
  
    /* If the token is about to expire, use a refresh token to get a new token and a new refresh token. */
    const tokenAboutToExpire: boolean = closeToNonzeroMultipleOf(totalTimeElapsedInMinutes, timeoutPeriodInMinutes - 1, epsilonInMinutes);
    if (tokenAboutToExpire) {
      const tokenResponse = await oldThis.oAuthService.refreshToken(oldThis.oAuthClientId, oldThis.oAuthClientSecret, oldThis.refreshToken);
      oldThis.bearerAuth = tokenResponse.accessToken; oldThis.refreshToken = tokenResponse.refreshToken;
    }

    oldThis.logToConsole(`Beginning migration of document ${i + 1} of the ${selectedDocs.length} documents.`);
    /* Try to reupload the ith document. Only proceed to the next iteration if we succeed. */
    let error = false;
    try {
      await reuploadHelper(oldThis, selectedDocs[i]);
    } catch (err) {
      error = true;
      oldThis.logToConsole(`Migration of document ${i + 1} of the ${selectedDocs.length} failed. Retrying migration of document ${i + 1}.`);
    }
    if (!error) {
      oldThis.logToConsole(`Document ${i + 1} of the ${selectedDocs.length} documents has been sucessfully migrated.`);
      oldThis.logToConsole('========================================================================');
      i ++;
    }
  }
}

async function reuploadHelper(oldThis: any, documentId: string): Promise<any> {  
  oldThis.logToConsole('About to inspect this document in the commercial account and then download it from the commercial account.');
  oldThis.logToConsoleTabbed(`The ID of this document in the commercial account is ${documentId}.`);
  const result = await download(oldThis, documentId, oldThis.commercialIntegrationKey);

  oldThis.logToConsole('About to upload this document to the FedRAMP account.');
  await upload(oldThis, result.docName, result.formFields, result.pdfBlob, documentId);
}

async function download(oldThis: any, documentId: string, bearerAuth: string): Promise<any> {
  const baseUri = await getApiBaseUriCommercial(bearerAuth);    
  const defaultHeaders = {'Authorization': `Bearer ${bearerAuth}`};

  /* GET the name of the document. */
  let requestConfig: any = {
    'method': 'get',
    'url': `${baseUri}/libraryDocuments/${documentId}`,
    'headers': defaultHeaders
  };
  const docName: string = (await httpRequest(requestConfig)).name;
  oldThis.logToConsoleTabbed(`The name of this document in the commercial account is "${docName}"`);

  /* GET the values the user has entered into the document's fields. */
  requestConfig.url = `${baseUri}/libraryDocuments/${documentId}/formFields`;
  const formFields: {[key: string]: string}[] = (await httpRequest(requestConfig));
  oldThis.logToConsoleTabbed(`Obtained the values the user entered into this document's fields.`);

  /* GET the URL of the PDF on which the custom form fields that the user field out were placed. */
  requestConfig.url = `${baseUri}/libraryDocuments/${documentId}/combinedDocument/url`;
  const combinedDocumentUrl = (await httpRequest(requestConfig)).url;
  oldThis.logToConsoleTabbed(`The PDF representation of this document is located at ${combinedDocumentUrl}.`);

  /* Get the PDF itself. */
  
  // Form the request URL in a way that allows us to enable or disable proxying as we choose.
  // (The output of getPdfLibraryBaseUri() depends on Settings.useProxy.)
  const prefixEndIndex = getPdfLibraryBaseUri(Settings.apiEnv, false).length - 1; // useProxy = false
  const endIndex = combinedDocumentUrl.length - 1;
  const combinedDocumentUrlSuffix = combinedDocumentUrl.substring(prefixEndIndex + 1, endIndex + 1);
  const proxiedCombinedDocumentUrl = `${getPdfLibraryBaseUri()}/${combinedDocumentUrlSuffix}`; // See proxy.conf.ts.

  // GET the PDF.
  requestConfig.url = proxiedCombinedDocumentUrl;
  requestConfig.responseType = 'arraybuffer';
  const pdfArrayBuffer: ArrayBuffer = (await httpRequest(requestConfig));
  const pdfBlob = new Blob([pdfArrayBuffer], {type: 'application/pdf'});

  if (Settings.debugViewDownloadedPdf) {
    const blobUrl = URL.createObjectURL(pdfBlob);
    (<any> window).open(blobUrl);
  }

  return {'docName': docName, 'formFields': formFields, 'pdfBlob': pdfBlob};
}

async function upload(oldThis: any, docName: string, formFields: {[key: string]: string}, pdfBlob: Blob, documentId: string) {
  const baseUri = getApiBaseUriFedRamp();
  const defaultHeaders = {'Authorization': `Bearer ${oldThis.bearerAuth}`};

  oldThis.logToConsoleTabbed(`About to upload the downloaded PDF to the FedRAMP 
    account by POSTing to ${baseUri}/transientDocuments`);

  /* POST the same document (but without any custom form fields) as a transient document and get its ID.
  (Informed by https://stackoverflow.com/questions/53038900/nodejs-axios-post-file-from-local-server-to-another-server). */
  const formData = new FormData();
  formData.append('File-Name', docName);
  formData.append('File', pdfBlob);
  
  let requestConfig: any = {
    'method': 'post',
    'url': `${baseUri}/transientDocuments`,
    'headers': defaultHeaders,
    'data': formData
  };
  const response: any = (await oldThis.httpRequestTemp(requestConfig)); // this API endpoint is tricky; have to access data field of response to get response
  const transientDocumentId = response.transientDocumentId;
  oldThis.logToConsoleTabbed(`Uploaded the downloaded PDF to the FedRAMP account as a transient document with a transientDocumentId of ${transientDocumentId}.`);

  /* Create a library document from the just-created transient document. */
  let libraryDocumentInfo = 
  {
    'fileInfos' : [{'transientDocumentId' : transientDocumentId}],
    'name': Settings.docNamePrefixForDebug + docName,
    'sharingMode': 'ACCOUNT', // can be 'USER' or 'GROUP' or 'ACCOUNT' or 'GLOBAL'
    'state': 'ACTIVE', // can be 'AUTHORING' or 'ACTIVE'
    'templateTypes': ['DOCUMENT'] // each array elt can be 'DOCUMENT' or 'FORM_FIELD_LAYER'
  };
  
  requestConfig = {
    'method': 'post',
    'url': `${baseUri}/libraryDocuments`,
    'headers': defaultHeaders,
    'data': libraryDocumentInfo
  };
  const newLibraryDocumentId = (await httpRequest(requestConfig)).id;
  oldThis.logToConsoleTabbed(`Created a library document (a template) in the FedRAMP account from the transient document with a libraryDocumentId of ${newLibraryDocumentId}.`);

  /* Use a PUT request to add the custom form fields and the values entered earlier to the document. */
  requestConfig = {
    'method': 'put',
    'url': `${baseUri}/libraryDocuments/${newLibraryDocumentId}/formFields`,
    'headers': defaultHeaders,
    'data': formFields
  };
  await httpRequest(requestConfig);
  oldThis.logToConsoleTabbed("Wrote the values the user entered into this document's fields to the library document in the FedRAMP account.");
}

/* Returns true if and only if s is not epsilon-close to zero and s is epsilon-close to a multiple of t. */
function closeToNonzeroMultipleOf(s: number, t: number, epsilon: number): boolean {
  return (s > epsilon) && ((s % t) < epsilon);
}