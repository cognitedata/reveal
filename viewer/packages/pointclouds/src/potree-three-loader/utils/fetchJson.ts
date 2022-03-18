import { XHRFactoryInstance } from './XHRFactory';

export async function fetchJson(fullUrl: string): Promise<any> {
  return new Promise<any>((res, rej) => {
    const xhr = XHRFactoryInstance.createXMLHttpRequest();
    xhr.open('GET', fullUrl, true);
    xhr.onreadystatechange = async () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          res(JSON.parse(await xhr.response));
        } else {
          rej('Failed ' + fullUrl + ': ' + xhr.status);
        }
      }
    };

    xhr.send(null);
  });
}
