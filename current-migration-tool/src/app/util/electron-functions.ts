export async function httpRequest(requestConfig: any) {
	return (await (<any> window).api.httpRequest2(requestConfig));
}

export function redirect(url: string) {
  (<any> window).api.redirect2(url);
}

export function getCurrentUrl(): string {
  const result = (<any> window).api.getCurrentUrl2();
  return result;
}