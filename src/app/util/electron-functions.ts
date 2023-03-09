/* The definitions of the functions called within the functions of this file are given in preload.ts.
Said defintions involve ipcRenderer.invoke(). Since the result of any ipcRenderer.invoke() call
is a Promise, we mark all these functions as async for readability purposes. */

export async function httpRequest(requestConfig: any): Promise<any> {
	return (<any> window).api.httpRequest2(requestConfig);
}

export async function loadUrl(url: string) {
  (<any> window).api.loadUrl2(url);
}

export async function getCurrentUrl(): Promise<string> {
  const result = (<any> window).api.getCurrentUrl2();
  return result;
}