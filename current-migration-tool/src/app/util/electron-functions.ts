/* The result of any ipcRenderer.invoke() call in preload.ts is a Promise, so all these functions are async.  */

export async function httpRequest(requestConfig: any) {
	return (<any> window).api.httpRequest2(requestConfig);
}

export async function redirect(url: string) {
  (<any> window).api.redirect2(url);
}

export async function getCurrentUrl(): Promise<string> {
  const result = (<any> window).api.getCurrentUrl2();
  return result;
}